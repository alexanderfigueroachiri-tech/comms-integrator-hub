/**
 * Codificación de tipos de valor (orquestador):
 * 1 = TERNARY (0 / 50 / 100 o estados nominales)
 * 2 = BINARY   (NO / YES)
 * 3 = CONTINUOUS (numérico, ej. metros 0–N)
 */
export const VALUE_TYPE_CODE = {
  TERNARY: 1,
  BINARY: 2,
  CONTINUOUS: 3,
} as const;

export type HealthStatus = "good" | "warning" | "critical";

export type PhaseValueType = "TERNARY" | "BINARY" | "CONTINUOUS";

export type BinaryValue = "NO" | "YES";
export type TernaryValue = "PENDING" | "PARTIAL" | "DONE";

export interface PhaseDefinition {
  code: string;
  label: string;
  sortOrder: number;
  valueType: PhaseValueType;
  /** Código numérico del orquestador (1|2|3) */
  valueTypeCode: 1 | 2 | 3;
  maxValue?: number;
}

export type PhaseValues = Record<string, BinaryValue | TernaryValue | number>;

export interface Metrado {
  id: string;
  code: string;
  nivel: string;
  bloque: string;
  ambiente: string;
  rotulado: string;
  salidaTipo?: "SIMPLE" | "DOBLE";
  phases: PhaseValues;
}

export interface SystemDefinition {
  code: string;
  name: string;
  category: "cabling" | "security" | "clinical" | "network" | "admin";
  phases: PhaseDefinition[];
  /** Referencia BICSI / NFPA / TIA para documentación */
  standardRef?: string;
}

export interface SystemInstance {
  code: string;
  name: string;
  phases: PhaseDefinition[];
  metrados: Metrado[];
}

export interface SystemDependency {
  upstreamCode: string;
  downstreamCode: string;
  weight: number;
  label?: string;
}

export interface SystemProgress {
  code: string;
  name: string;
  category: SystemDefinition["category"];
  actualPct: number;
  health: HealthStatus;
  bottleneckPhase?: string;
  inheritedRisk?: boolean;
  riskReason?: string;
  metradoCount: number;
}

export interface Alert {
  id: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  code: string;
  message: string;
  systemCode?: string;
}

export interface ProjectDemo {
  id: string;
  name: string;
  client: string;
  contract: {
    startDate: string;
    endDate: string;
    penaltyNote: string;
  };
  simulatedToday: string;
  systems: SystemInstance[];
  dependencies: SystemDependency[];
}

export interface DashboardSnapshot {
  project: ProjectDemo;
  scheduledPct: number;
  overallActualPct: number;
  overallHealth: HealthStatus;
  executiveSummary: string;
  systems: SystemProgress[];
  alerts: Alert[];
  elapsedDays: number;
  totalDays: number;
  remainingDays: number;
  timelineSeries: Array<{ month: string; scheduled: number; actual: number }>;
}

export const DEMO_NIVELES = ["1", "2", "3", "4", "5"] as const;
export const DEMO_BLOQUES = ["A", "B", "C", "D", "E"] as const;
export const DEMO_AMBIENTES = [
  "Sala de cómputo",
  "Oficina",
  "Cuarto de enfermeras",
  "Sala A",
  "Sala B",
  "Consultorio",
  "Pasillo",
  "UCI",
  "Quirófano",
  "Admisión",
] as const;
