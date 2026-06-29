import type {
  Alert,
  DashboardSnapshot,
  Metrado,
  PhaseValues,
  ProjectDemo,
  SystemInstance,
  SystemProgress,
} from "./types";
import { DEMO_AMBIENTES, DEMO_BLOQUES, DEMO_NIVELES } from "./types";
import {
  SYSTEM_CATALOG,
  SYSTEM_DEPENDENCIES,
  getCatalogSystem,
} from "./system-catalog";
import {
  buildExecutiveSummary,
  buildTimelineSeries,
  computeHealth,
  computeScheduledProgress,
  computeSystemProgressFromMetrados,
  daysBetween,
  findBottleneckPhase,
} from "./progress-engine";

function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function buildBinaryPhases(
  phases: SystemInstance["phases"],
  completionBias: number,
  rand: () => number,
): PhaseValues {
  const values: PhaseValues = {};
  for (const p of phases) {
    if (p.valueType === "BINARY") {
      const threshold = completionBias + rand() * 0.15;
      values[p.code] = rand() < threshold ? "YES" : "NO";
    } else if (p.valueType === "TERNARY") {
      const r = rand();
      values[p.code] =
        r < completionBias - 0.1
          ? "DONE"
          : r < completionBias + 0.1
            ? "PARTIAL"
            : "PENDING";
    } else {
      values[p.code] = Math.round(completionBias * (p.maxValue ?? 100));
    }
  }
  return values;
}

const SCE_METRADOS: Metrado[] = [
  { id: "m1", code: "SCE-H-0001", nivel: "1", bloque: "A", ambiente: "Admisión", rotulado: "IDF-A-001", salidaTipo: "DOBLE", phases: { COMPATIBILIZACION: "YES", CANALIZADO: "YES", CABLEADO: "YES", PONCHADO: "NO", PLAQUEADO: "NO", CERTIFICADO: "NO" } },
  { id: "m2", code: "SCE-H-0002", nivel: "1", bloque: "A", ambiente: "Oficina", rotulado: "IDF-A-002", salidaTipo: "SIMPLE", phases: { COMPATIBILIZACION: "YES", CANALIZADO: "YES", CABLEADO: "YES", PONCHADO: "YES", PLAQUEADO: "YES", CERTIFICADO: "NO" } },
  { id: "m3", code: "SCE-H-0003", nivel: "2", bloque: "B", ambiente: "Consultorio", rotulado: "IDF-B-014", salidaTipo: "SIMPLE", phases: { COMPATIBILIZACION: "YES", CANALIZADO: "YES", CABLEADO: "YES", PONCHADO: "NO", PLAQUEADO: "NO", CERTIFICADO: "NO" } },
  { id: "m4", code: "SCE-H-0004", nivel: "2", bloque: "B", ambiente: "Cuarto de enfermeras", rotulado: "IDF-B-015", salidaTipo: "DOBLE", phases: { COMPATIBILIZACION: "YES", CANALIZADO: "YES", CABLEADO: "NO", PONCHADO: "NO", PLAQUEADO: "NO", CERTIFICADO: "NO" } },
  { id: "m5", code: "SCE-H-0005", nivel: "3", bloque: "C", ambiente: "UCI", rotulado: "IDF-C-001", salidaTipo: "DOBLE", phases: { COMPATIBILIZACION: "YES", CANALIZADO: "YES", CABLEADO: "YES", PONCHADO: "YES", PLAQUEADO: "YES", CERTIFICADO: "YES" } },
  { id: "m6", code: "SCE-H-0006", nivel: "3", bloque: "C", ambiente: "Quirófano", rotulado: "IDF-C-002", salidaTipo: "SIMPLE", phases: { COMPATIBILIZACION: "YES", CANALIZADO: "YES", CABLEADO: "YES", PONCHADO: "YES", PLAQUEADO: "NO", CERTIFICADO: "NO" } },
  { id: "m7", code: "SCE-H-0007", nivel: "1", bloque: "A", ambiente: "Sala de cómputo", rotulado: "IDF-A-003", salidaTipo: "SIMPLE", phases: { COMPATIBILIZACION: "NO", CANALIZADO: "NO", CABLEADO: "NO", PONCHADO: "NO", PLAQUEADO: "NO", CERTIFICADO: "NO" } },
  { id: "m8", code: "SCE-H-0008", nivel: "2", bloque: "B", ambiente: "Sala A", rotulado: "IDF-B-016", salidaTipo: "DOBLE", phases: { COMPATIBILIZACION: "YES", CANALIZADO: "YES", CABLEADO: "YES", PONCHADO: "YES", PLAQUEADO: "YES", CERTIFICADO: "NO" } },
  { id: "m9", code: "SCE-H-0009", nivel: "4", bloque: "D", ambiente: "Sala B", rotulado: "IDF-D-001", salidaTipo: "SIMPLE", phases: { COMPATIBILIZACION: "YES", CANALIZADO: "YES", CABLEADO: "YES", PONCHADO: "NO", PLAQUEADO: "NO", CERTIFICADO: "NO" } },
  { id: "m10", code: "SCE-H-0010", nivel: "4", bloque: "D", ambiente: "Oficina", rotulado: "IDF-D-002", salidaTipo: "SIMPLE", phases: { COMPATIBILIZACION: "YES", CANALIZADO: "NO", CABLEADO: "NO", PONCHADO: "NO", PLAQUEADO: "NO", CERTIFICADO: "NO" } },
  { id: "m11", code: "SCE-H-0011", nivel: "5", bloque: "E", ambiente: "Pasillo", rotulado: "IDF-E-001", salidaTipo: "DOBLE", phases: { COMPATIBILIZACION: "YES", CANALIZADO: "YES", CABLEADO: "YES", PONCHADO: "YES", PLAQUEADO: "YES", CERTIFICADO: "YES" } },
  { id: "m12", code: "SCE-H-0012", nivel: "2", bloque: "B", ambiente: "Sala B", rotulado: "IDF-B-017", salidaTipo: "SIMPLE", phases: { COMPATIBILIZACION: "YES", CANALIZADO: "YES", CABLEADO: "YES", PONCHADO: "NO", PLAQUEADO: "NO", CERTIFICADO: "NO" } },
];

/** Sesgo de avance por sistema (demo narrativa: SCE rezagado, backbone ok) */
const COMPLETION_BIAS: Record<string, number> = {
  "07.14": 0.52,
  "07.08": 0.88,
  "07": 0.62,
  "07.02": 0.71,
  "07.03": 0.68,
  "07.04": 0.35,
  "07.05": 0.78,
  "07.06": 0.55,
  "07.07": 0.72,
  "07.09": 0.45,
  "07.10": 0.82,
  "07.11": 0.79,
  "07.12": 0.58,
  "07.13": 0.48,
  "07.16": 0.65,
  "07.17": 0.74,
  "07.19": 0.91,
  "07.20": 0.42,
  "07.21": 0.56,
  "07.23": 0.38,
};

function generateMetradosForSystem(
  sysCode: string,
  phases: SystemInstance["phases"],
  count: number,
): Metrado[] {
  const rand = seededRand(sysCode.split("").reduce((a, c) => a + c.charCodeAt(0), 0));
  const bias = COMPLETION_BIAS[sysCode] ?? 0.5;
  const prefix = sysCode.replace(".", "");

  return Array.from({ length: count }, (_, i) => {
    const nivel = DEMO_NIVELES[i % DEMO_NIVELES.length];
    const bloque = DEMO_BLOQUES[i % DEMO_BLOQUES.length];
    const ambiente = DEMO_AMBIENTES[i % DEMO_AMBIENTES.length];
    return {
      id: `${prefix}-m${i + 1}`,
      code: `${prefix}-Z${String(i + 1).padStart(3, "0")}`,
      nivel,
      bloque,
      ambiente,
      rotulado: `${prefix}-${bloque}-${nivel}-${i + 1}`,
      salidaTipo: i % 3 === 0 ? "DOBLE" : "SIMPLE",
      phases: buildBinaryPhases(phases, bias, rand),
    };
  });
}

function buildSystemInstances(): SystemInstance[] {
  return SYSTEM_CATALOG.map((def) => {
    const metrados =
      def.code === "07.14"
        ? SCE_METRADOS
        : generateMetradosForSystem(
            def.code,
            def.phases,
            def.code === "07.19" ? 2 : 4,
          );

    return {
      code: def.code,
      name: def.name,
      phases: def.phases,
      metrados,
    };
  });
}

export const DEMO_PROJECT: ProjectDemo = {
  id: "proj-hospital-demo",
  name: "Hospital Metropolitano — Comunicaciones",
  client: "ESSALUD Demo (IntegraCom)",
  contract: {
    startDate: "2025-01-01",
    endDate: "2025-06-30",
    penaltyNote: "Penalidad por incumplimiento de hito según cláusula 14.2 del contrato.",
  },
  simulatedToday: "2025-05-15",
  systems: buildSystemInstances(),
  dependencies: SYSTEM_DEPENDENCIES,
};

function buildSystemProgress(project: ProjectDemo): SystemProgress[] {
  const scheduled = computeScheduledProgress(
    project.contract.startDate,
    project.contract.endDate,
    project.simulatedToday,
  );

  const base: SystemProgress[] = project.systems.map((sys) => {
    const cat = getCatalogSystem(sys.code);
    const actualPct = computeSystemProgressFromMetrados(sys.phases, sys.metrados);
    return {
      code: sys.code,
      name: sys.name,
      category: cat?.category ?? "network",
      actualPct,
      health: computeHealth(actualPct, scheduled),
      bottleneckPhase: findBottleneckPhase(sys.phases, sys.metrados),
      metradoCount: sys.metrados.length,
    };
  });

  const byCode = Object.fromEntries(base.map((s) => [s.code, s]));

  return base.map((sys) => {
    const upstreamDeps = project.dependencies.filter(
      (d) => d.downstreamCode === sys.code,
    );
    const riskyUpstream = upstreamDeps.find(
      (d) => byCode[d.upstreamCode]?.health === "critical",
    );
    if (riskyUpstream) {
      const up = byCode[riskyUpstream.upstreamCode];
      return {
        ...sys,
        inheritedRisk: true,
        riskReason: `Depende de ${riskyUpstream.upstreamCode} ${up?.name} (${up?.actualPct}%, crítico)`,
        health: sys.health === "good" ? "warning" : sys.health,
      };
    }
    return sys;
  });
}

function buildAlerts(
  project: ProjectDemo,
  systems: SystemProgress[],
  scheduled: number,
): Alert[] {
  const alerts: Alert[] = [];
  const sce = systems.find((s) => s.code === "07.14");

  if (sce?.health === "critical") {
    alerts.push({
      id: "a1",
      severity: "CRITICAL",
      code: "A1",
      message: `Cableado estructurado al ${sce.actualPct}% con ${scheduled}% del contrato consumido. Riesgo directo de penalidad.`,
      systemCode: "07.14",
    });
  }

  if (sce?.bottleneckPhase) {
    alerts.push({
      id: "a2",
      severity: "WARNING",
      code: "A2",
      message: `Cuello de botella SCE: ${sce.bottleneckPhase.replace(/_/g, " ")}. Bloquea sistemas downstream (telefonía, CCTV, enfermeras).`,
      systemCode: "07.14",
    });
  }

  systems
    .filter((s) => s.inheritedRisk)
    .slice(0, 4)
    .forEach((s, i) => {
      alerts.push({
        id: `a3-${i}`,
        severity: "WARNING",
        code: "A3",
        message: `${s.name}: riesgo heredado. ${s.riskReason}`,
        systemCode: s.code,
      });
    });

  const remaining = daysBetween(
    new Date(project.simulatedToday),
    new Date(project.contract.endDate),
  );
  const overall = Math.round(
    systems.reduce((sum, s) => sum + s.actualPct, 0) / systems.length,
  );

  if (remaining < 45 && overall < 90) {
    alerts.push({
      id: "a4",
      severity: "CRITICAL",
      code: "A4",
      message: `${remaining} días restantes · avance global ${overall}%. Hitos clínicos (HIS, PACS, enfermeras) en riesgo.`,
    });
  }

  return alerts;
}

export function buildDashboardSnapshot(
  project: ProjectDemo = DEMO_PROJECT,
): DashboardSnapshot {
  const scheduledPct = computeScheduledProgress(
    project.contract.startDate,
    project.contract.endDate,
    project.simulatedToday,
  );

  const systems = buildSystemProgress(project);
  const overallActualPct = Math.round(
    systems.reduce((sum, s) => sum + s.actualPct, 0) / systems.length,
  );
  const overallHealth = computeHealth(overallActualPct, scheduledPct);
  const worst = [...systems].sort((a, b) => a.actualPct - b.actualPct)[0];

  const elapsedDays = daysBetween(
    new Date(project.contract.startDate),
    new Date(project.simulatedToday),
  );
  const totalDays = daysBetween(
    new Date(project.contract.startDate),
    new Date(project.contract.endDate),
  );

  return {
    project,
    scheduledPct,
    overallActualPct,
    overallHealth,
    executiveSummary: buildExecutiveSummary(
      overallActualPct,
      scheduledPct,
      overallHealth,
      worst,
    ),
    systems,
    alerts: buildAlerts(project, systems, scheduledPct),
    elapsedDays,
    totalDays,
    remainingDays: totalDays - elapsedDays,
    timelineSeries: buildTimelineSeries(
      project.contract.startDate,
      project.contract.endDate,
      project.simulatedToday,
      overallActualPct,
    ),
  };
}

export function getProjectSystem(
  project: ProjectDemo,
  code: string,
): SystemInstance | undefined {
  return project.systems.find((s) => s.code === code);
}

export { SYSTEM_CATALOG, SYSTEM_DEPENDENCIES, getCatalogSystem };
