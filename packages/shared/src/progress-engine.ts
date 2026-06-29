import type {
  Metrado,
  PhaseDefinition,
  PhaseValueType,
  PhaseValues,
  TernaryValue,
} from "./types";

export function phaseScore(
  phase: PhaseDefinition,
  values: PhaseValues,
): number {
  const raw = values[phase.code];

  switch (phase.valueType) {
    case "BINARY":
      return raw === "YES" ? 100 : 0;
    case "TERNARY": {
      const v = raw as TernaryValue | undefined;
      if (v === "DONE") return 100;
      if (v === "PARTIAL") return 50;
      return 0;
    }
    case "CONTINUOUS": {
      const num = typeof raw === "number" ? raw : 0;
      const max = phase.maxValue ?? 100;
      return Math.round(Math.min(100, Math.max(0, (num / max) * 100)));
    }
    default:
      return 0;
  }
}

export function computeMetradoProgress(
  phases: PhaseDefinition[],
  values: PhaseValues,
): number {
  if (phases.length === 0) return 0;
  const total = phases.reduce((sum, p) => sum + phaseScore(p, values), 0);
  return Math.round(total / phases.length);
}

export function computeSystemProgressFromMetrados(
  phases: PhaseDefinition[],
  metrados: Metrado[],
): number {
  if (metrados.length === 0) return 0;
  const total = metrados.reduce(
    (sum, m) => sum + computeMetradoProgress(phases, m.phases),
    0,
  );
  return Math.round(total / metrados.length);
}

export function computePhaseAverage(
  phase: PhaseDefinition,
  metrados: Metrado[],
): number {
  if (metrados.length === 0) return 0;
  const total = metrados.reduce(
    (sum, m) => sum + phaseScore(phase, m.phases),
    0,
  );
  return Math.round(total / metrados.length);
}

export function findBottleneckPhase(
  phases: PhaseDefinition[],
  metrados: Metrado[],
): string | undefined {
  let worstPhase: string | undefined;
  let worstAvg = 101;

  for (const phase of phases) {
    const avg = computePhaseAverage(phase, metrados);
    if (avg < worstAvg) {
      worstAvg = avg;
      worstPhase = phase.code;
    }
  }

  return worstPhase;
}

export function daysBetween(start: Date, end: Date): number {
  return Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
  );
}

export function computeScheduledProgress(
  startDate: string,
  endDate: string,
  today: string,
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date(today);
  const total = daysBetween(start, end);
  const elapsed = Math.min(total, Math.max(0, daysBetween(start, now)));
  return Math.round((elapsed / total) * 100);
}

export function computeHealth(
  actualPct: number,
  scheduledPct: number,
): import("./types").HealthStatus {
  if (actualPct >= scheduledPct) return "good";
  if (actualPct >= scheduledPct - 10) return "warning";
  return "critical";
}

export function buildExecutiveSummary(
  actualPct: number,
  scheduledPct: number,
  health: import("./types").HealthStatus,
  worstSystem?: { name: string; bottleneckPhase?: string; actualPct: number },
): string {
  const gap = scheduledPct - actualPct;
  if (health === "good") {
    return `Avance global ${actualPct}% alineado al ${scheduledPct}% del plazo contractual. Proyecto en curso favorable.`;
  }
  if (health === "warning") {
    return `Avance ${actualPct}% vs ${scheduledPct}% de tiempo consumido. Rezago leve (~${gap} pts). Revisar ${worstSystem?.name ?? "sistema crítico"}.`;
  }
  return `${actualPct}% de avance con ${scheduledPct}% del contrato transcurrido — riesgo de penalidad. Prioridad: ${worstSystem?.name ?? "N/D"} (${worstSystem?.bottleneckPhase?.replace(/_/g, " ") ?? "fase crítica"}, ${worstSystem?.actualPct ?? 0}%).`;
}

export function buildTimelineSeries(
  startDate: string,
  endDate: string,
  today: string,
  actualPctNow: number,
  months = 6,
): Array<{ month: string; scheduled: number; actual: number }> {
  const labels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago"];
  const scheduledRatio = computeScheduledProgress(startDate, endDate, today) / 100;

  return Array.from({ length: months + 1 }, (_, i) => {
    const scheduled = Math.round((i / months) * 100);
    let actual: number;
    if (i / months <= scheduledRatio) {
      actual = Math.round((i / months / scheduledRatio) * actualPctNow);
    } else {
      actual = actualPctNow;
    }
    return { month: labels[i] ?? `M${i}`, scheduled, actual };
  });
}

export { SCE_PHASES } from "./system-catalog";
