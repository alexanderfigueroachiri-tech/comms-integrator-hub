import {
  AlertSeverity,
  PhaseValueType,
  PrismaClient,
  SalidaTipo,
  SystemCategory,
} from "@prisma/client";
import {
  DEMO_PROJECT,
  buildDashboardSnapshot,
  getCatalogSystem,
} from "@cih/shared";
import type { PhaseValues, SystemDefinition } from "@cih/shared";

const prisma = new PrismaClient();

function mapCategory(
  category: SystemDefinition["category"],
): SystemCategory {
  const map: Record<SystemDefinition["category"], SystemCategory> = {
    cabling: SystemCategory.CABLING,
    security: SystemCategory.SECURITY,
    clinical: SystemCategory.CLINICAL,
    network: SystemCategory.NETWORK,
    admin: SystemCategory.ADMIN,
  };
  return map[category];
}

function mapPhaseValueType(valueType: string): PhaseValueType {
  return PhaseValueType[valueType as keyof typeof PhaseValueType];
}

function serializePhaseValue(value: PhaseValues[string]): string | null {
  if (value === undefined || value === null) return null;
  return String(value);
}

async function main() {
  const project = DEMO_PROJECT;
  const snapshot = buildDashboardSnapshot(project);

  await prisma.importRowError.deleteMany();
  await prisma.metradoPhaseValue.deleteMany();
  await prisma.metrado.deleteMany();
  await prisma.importBatch.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.systemDependency.deleteMany();
  await prisma.phaseDefinition.deleteMany();
  await prisma.system.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.project.deleteMany();
  await prisma.organization.deleteMany();

  const org = await prisma.organization.create({
    data: {
      name: "IntegraCom",
      slug: "integracom",
    },
  });

  const dbProject = await prisma.project.create({
    data: {
      organizationId: org.id,
      name: project.name,
      client: project.client,
      simulatedToday: new Date(project.simulatedToday),
      settings: { dataSource: "seed", legacyId: project.id },
    },
  });

  await prisma.contract.create({
    data: {
      projectId: dbProject.id,
      startDate: new Date(project.contract.startDate),
      endDate: new Date(project.contract.endDate),
      penaltyNote: project.contract.penaltyNote,
    },
  });

  const systemIdByCode = new Map<string, string>();

  for (const [index, sys] of project.systems.entries()) {
    const catalog = getCatalogSystem(sys.code);
    const created = await prisma.system.create({
      data: {
        projectId: dbProject.id,
        code: sys.code,
        name: sys.name,
        category: mapCategory(catalog?.category ?? "network"),
        standardRef: catalog?.standardRef,
        sortOrder: index,
        catalogSourceCode: sys.code,
        phases: {
          create: sys.phases.map((phase) => ({
            code: phase.code,
            label: phase.label,
            sortOrder: phase.sortOrder,
            valueType: mapPhaseValueType(phase.valueType),
            valueTypeCode: phase.valueTypeCode,
            maxValue: phase.maxValue,
          })),
        },
      },
    });
    systemIdByCode.set(sys.code, created.id);
  }

  for (const dep of project.dependencies) {
    const upstreamId = systemIdByCode.get(dep.upstreamCode);
    const downstreamId = systemIdByCode.get(dep.downstreamCode);
    if (!upstreamId || !downstreamId) continue;

    await prisma.systemDependency.create({
      data: {
        projectId: dbProject.id,
        upstreamSystemId: upstreamId,
        downstreamSystemId: downstreamId,
        weight: dep.weight,
        label: dep.label,
      },
    });
  }

  for (const sys of project.systems) {
    const systemId = systemIdByCode.get(sys.code);
    if (!systemId) continue;

    for (const metrado of sys.metrados) {
      await prisma.metrado.create({
        data: {
          systemId,
          code: metrado.code,
          nivel: metrado.nivel,
          bloque: metrado.bloque,
          ambiente: metrado.ambiente,
          rotulado: metrado.rotulado,
          salidaTipo: metrado.salidaTipo
            ? SalidaTipo[metrado.salidaTipo]
            : null,
          phaseValues: {
            create: Object.entries(metrado.phases).map(([phaseCode, value]) => ({
              phaseCode,
              value: serializePhaseValue(value),
            })),
          },
        },
      });
    }
  }

  for (const alert of snapshot.alerts) {
    await prisma.alert.create({
      data: {
        projectId: dbProject.id,
        systemId: alert.systemCode
          ? systemIdByCode.get(alert.systemCode)
          : null,
        severity: AlertSeverity[alert.severity],
        code: alert.code,
        message: alert.message,
      },
    });
  }

  console.log(
    `Seed OK — ${project.systems.length} sistemas, avance global ${snapshot.overallActualPct}%`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
