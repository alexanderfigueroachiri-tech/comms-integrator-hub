import type {
  Alert,
  DashboardSnapshot,
  Metrado,
  PhaseDefinition,
  PhaseValues,
  ProjectDemo,
  SystemDependency,
  SystemInstance,
} from "@cih/shared";
import { buildDashboardSnapshot } from "@cih/shared";
import type {
  AlertSeverity,
  PhaseValueType,
  Prisma,
  SalidaTipo,
  SystemCategory,
} from "@prisma/client";
import { prisma } from "./client";

type ProjectWithRelations = Prisma.ProjectGetPayload<{
  include: {
    contracts: true;
    systems: {
      include: {
        phases: { orderBy: { sortOrder: "asc" } };
        metrados: { include: { phaseValues: true } };
      };
      orderBy: { sortOrder: "asc" };
    };
    dependencies: true;
    alerts: true;
  };
}>;

function mapPhaseValueType(valueType: PhaseValueType): PhaseDefinition["valueType"] {
  return valueType as PhaseDefinition["valueType"];
}

function mapSalidaTipo(value: SalidaTipo | null): Metrado["salidaTipo"] {
  if (!value) return undefined;
  return value as Metrado["salidaTipo"];
}

function mapPhaseValues(
  rows: ProjectWithRelations["systems"][number]["metrados"][number]["phaseValues"],
): PhaseValues {
  const phases: PhaseValues = {};
  for (const row of rows) {
    if (row.value == null) continue;
    const numeric = Number(row.value);
    phases[row.phaseCode] = (
      Number.isNaN(numeric) ? row.value : numeric
    ) as PhaseValues[string];
  }
  return phases;
}

function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function mapProject(project: ProjectWithRelations): ProjectDemo {
  const contract = project.contracts[0];
  if (!contract) {
    throw new Error("Project has no contract row");
  }

  const systems: SystemInstance[] = project.systems.map((sys) => ({
    code: sys.code,
    name: sys.name,
    phases: sys.phases.map((phase) => ({
      code: phase.code,
      label: phase.label,
      sortOrder: phase.sortOrder,
      valueType: mapPhaseValueType(phase.valueType),
      valueTypeCode: phase.valueTypeCode as PhaseDefinition["valueTypeCode"],
      maxValue: phase.maxValue ?? undefined,
    })),
    metrados: sys.metrados.map((m) => ({
      id: m.id,
      code: m.code,
      nivel: m.nivel,
      bloque: m.bloque,
      ambiente: m.ambiente,
      rotulado: m.rotulado,
      salidaTipo: mapSalidaTipo(m.salidaTipo),
      phases: mapPhaseValues(m.phaseValues),
    })),
  }));

  const systemCodeById = Object.fromEntries(
    project.systems.map((sys) => [sys.id, sys.code]),
  );

  const dependencies: SystemDependency[] = project.dependencies.map((dep) => ({
    upstreamCode: systemCodeById[dep.upstreamSystemId],
    downstreamCode: systemCodeById[dep.downstreamSystemId],
    weight: dep.weight,
    label: dep.label ?? undefined,
  }));

  return {
    id: project.id,
    name: project.name,
    client: project.client ?? "",
    contract: {
      startDate: toIsoDate(contract.startDate),
      endDate: toIsoDate(contract.endDate),
      penaltyNote: contract.penaltyNote ?? "",
    },
    simulatedToday: toIsoDate(project.simulatedToday ?? new Date()),
    systems,
    dependencies,
  };
}

export async function loadProjectFromDb(
  projectId?: string,
): Promise<ProjectDemo> {
  const project = await prisma.project.findFirst({
    where: projectId ? { id: projectId } : undefined,
    include: {
      contracts: true,
      systems: {
        include: {
          phases: { orderBy: { sortOrder: "asc" } },
          metrados: { include: { phaseValues: true } },
        },
        orderBy: { sortOrder: "asc" },
      },
      dependencies: true,
      alerts: true,
    },
    orderBy: { createdAt: "asc" },
  });

  if (!project) {
    throw new Error(
      "No project in database. Run: pnpm db:push && pnpm db:seed",
    );
  }

  return mapProject(project);
}

export async function loadDashboardFromDb(
  projectId?: string,
): Promise<DashboardSnapshot> {
  const project = await loadProjectFromDb(projectId);
  return buildDashboardSnapshot(project);
}

export async function loadAlertsFromDb(
  projectId?: string,
): Promise<Alert[]> {
  const project = await loadProjectFromDb(projectId);
  return buildDashboardSnapshot(project).alerts;
}

export function mapDbAlertSeverity(
  severity: AlertSeverity,
): Alert["severity"] {
  return severity as Alert["severity"];
}

/** Reverse map for seed script parity checks */
export function mapCategoryToPrisma(
  category: "cabling" | "security" | "clinical" | "network" | "admin",
): SystemCategory {
  const map = {
    cabling: "CABLING",
    security: "SECURITY",
    clinical: "CLINICAL",
    network: "NETWORK",
    admin: "ADMIN",
  } as const;
  return map[category] as SystemCategory;
}
