import type { PhaseDefinition, PhaseValueType, SystemDefinition } from "./types";
import { VALUE_TYPE_CODE } from "./types";

function bin(code: string, label: string, order: number): PhaseDefinition {
  return {
    code,
    label,
    sortOrder: order,
    valueType: "BINARY",
    valueTypeCode: VALUE_TYPE_CODE.BINARY,
  };
}

function ter(code: string, label: string, order: number): PhaseDefinition {
  return {
    code,
    label,
    sortOrder: order,
    valueType: "TERNARY",
    valueTypeCode: VALUE_TYPE_CODE.TERNARY,
  };
}

/** Fases SCE — todas binarias (tipo 2), orden contractual demo */
export const SCE_PHASES: PhaseDefinition[] = [
  bin("COMPATIBILIZACION", "Compatibilización", 1),
  bin("CANALIZADO", "Canalizado", 2),
  bin("CABLEADO", "Cableado", 3),
  bin("PONCHADO", "Ponchado", 4),
  bin("PLAQUEADO", "Plaqueado", 5),
  bin("CERTIFICADO", "Certificado", 6),
];

/** Catálogo hospital IntegraCom — estados genéricos alineados a BICSI/NFPA/TIA */
export const SYSTEM_CATALOG: SystemDefinition[] = [
  {
    code: "07",
    name: "Sistema de telefonía IP",
    category: "network",
    standardRef: "BICSI ITSIMM · VoIP infrastructure",
    phases: [
      bin("INFRA", "Infraestructura", 1),
      bin("CONFIG", "Configuración PBX", 2),
      bin("INTEGRATION", "Integración", 3),
      bin("COMMISSIONING", "Puesta en marcha", 4),
    ],
  },
  {
    code: "07.02",
    name: "Sistema de CCTV",
    category: "security",
    standardRef: "BICSI · Specialty systems · IP surveillance",
    phases: [
      bin("SURVEY", "Replanteo", 1),
      bin("MOUNT", "Montaje", 2),
      bin("CABLE", "Cableado", 3),
      bin("CONFIG", "Configuración VMS", 4),
      bin("ACCEPTANCE", "Pruebas de aceptación", 5),
    ],
  },
  {
    code: "07.03",
    name: "Sistema de control de acceso",
    category: "security",
    standardRef: "BICSI · Physical security integration",
    phases: [
      bin("INFRA", "Infraestructura", 1),
      bin("DEVICES", "Dispositivos", 2),
      bin("PROGRAM", "Programación", 3),
      bin("ACCEPTANCE", "Pruebas", 4),
    ],
  },
  {
    code: "07.04",
    name: "Sistema de llamada a enfermeras",
    category: "clinical",
    standardRef: "NFPA 99 · Healthcare facilities",
    phases: [
      bin("INFRA", "Infraestructura", 1),
      bin("STATIONS", "Estaciones", 2),
      bin("INTEGRATION", "Integración", 3),
      bin("COMMISSIONING", "Commissioning", 4),
    ],
  },
  {
    code: "07.05",
    name: "Sistema DACI",
    category: "security",
    standardRef: "NFPA 72 · Fire alarm",
    phases: [
      bin("DETECTION", "Detección", 1),
      bin("ALARM", "Alarma", 2),
      bin("INTEGRATION", "Integración", 3),
      bin("ACCEPTANCE", "Pruebas NFPA", 4),
    ],
  },
  {
    code: "07.06",
    name: "Sistema de perifoneo",
    category: "network",
    standardRef: "BICSI · Audio/PA systems",
    phases: [
      bin("INFRA", "Infraestructura", 1),
      bin("SPEAKERS", "Parlantes", 2),
      bin("CONFIG", "Configuración", 3),
      bin("ACCEPTANCE", "Pruebas SPL", 4),
    ],
  },
  {
    code: "07.07",
    name: "Sistema de reloj IP",
    category: "network",
    phases: [
      bin("INFRA", "Infraestructura", 1),
      bin("DEVICES", "Relojes", 2),
      bin("SYNC", "Sincronización NTP", 3),
      bin("ACCEPTANCE", "Verificación", 4),
    ],
  },
  {
    code: "07.08",
    name: "Sistema de conectividad",
    category: "network",
    standardRef: "TIA-568 · Backbone",
    phases: [
      bin("BACKBONE", "Backbone", 1),
      bin("SWITCHING", "Conmutación", 2),
      bin("ROUTING", "Enrutamiento", 3),
      bin("ACCEPTANCE", "Pruebas", 4),
    ],
  },
  {
    code: "07.09",
    name: "Sistema VHF-HF",
    category: "network",
    phases: [
      bin("ANTENNA", "Antena", 1),
      bin("RADIO", "Equipos radio", 2),
      bin("CONFIG", "Configuración", 3),
      bin("ACCEPTANCE", "Pruebas cobertura", 4),
    ],
  },
  {
    code: "07.10",
    name: "Sistema de procesamiento",
    category: "network",
    phases: [
      bin("RACK", "Rack / energía", 1),
      bin("SERVERS", "Servidores", 2),
      bin("CONFIG", "Configuración", 3),
      bin("ACCEPTANCE", "Stress test", 4),
    ],
  },
  {
    code: "07.11",
    name: "Sistema de almacenamiento",
    category: "network",
    phases: [
      bin("INFRA", "Infraestructura", 1),
      bin("ARRAY", "Storage array", 2),
      bin("CONFIG", "Configuración", 3),
      bin("ACCEPTANCE", "Pruebas I/O", 4),
    ],
  },
  {
    code: "07.12",
    name: "Sistema CATV",
    category: "network",
    phases: [
      bin("HEADEND", "Head-end", 1),
      bin("DISTRIBUTION", "Distribución", 2),
      bin("OUTLETS", "Puntos", 3),
      bin("ACCEPTANCE", "Pruebas señal", 4),
    ],
  },
  {
    code: "07.13",
    name: "Sistema de telepresencia",
    category: "clinical",
    phases: [
      bin("ROOM", "Acondicionamiento sala", 1),
      bin("AV", "Audio/video", 2),
      bin("NETWORK", "Red", 3),
      bin("ACCEPTANCE", "Pruebas", 4),
    ],
  },
  {
    code: "07.14",
    name: "Cableado estructurado",
    category: "cabling",
    standardRef: "ANSI/BICSI N1 · TIA-568 · TIA-606",
    phases: SCE_PHASES,
  },
  {
    code: "07.16",
    name: "Cableado de corrientes débiles",
    category: "cabling",
    phases: [
      bin("PATHWAY", "Canalización", 1),
      bin("CABLE", "Tendido", 2),
      bin("TERMINATE", "Terminación", 3),
      bin("ACCEPTANCE", "Pruebas", 4),
    ],
  },
  {
    code: "07.17",
    name: "Cableado DAI",
    category: "cabling",
    standardRef: "NFPA 72 · Fire alarm cabling",
    phases: [
      bin("PATHWAY", "Canalización", 1),
      bin("CABLE", "Tendido", 2),
      bin("TERMINATE", "Terminación", 3),
      bin("ACCEPTANCE", "Continuidad", 4),
    ],
  },
  {
    code: "07.19",
    name: "Licencias de software",
    category: "admin",
    phases: [
      bin("PROCURE", "Adquisición", 1),
      bin("INSTALL", "Instalación", 2),
      bin("ACTIVATE", "Activación", 3),
      bin("VERIFY", "Verificación", 4),
    ],
  },
  {
    code: "07.20",
    name: "Sistema PACS RIS",
    category: "clinical",
    standardRef: "IEC 61223 · DICOM integration",
    phases: [
      bin("INFRA", "Infraestructura", 1),
      bin("INSTALL", "Instalación", 2),
      bin("DICOM", "Integración DICOM", 3),
      bin("ACCEPTANCE", "Aceptación clínica", 4),
    ],
  },
  {
    code: "07.21",
    name: "Sistema BMS",
    category: "network",
    standardRef: "ASHRAE · BACnet integration",
    phases: [
      bin("CONTROLLERS", "Controladores", 1),
      bin("SENSORS", "Sensores", 2),
      bin("INTEGRATION", "Integración", 3),
      bin("COMMISSIONING", "Commissioning", 4),
    ],
  },
  {
    code: "07.23",
    name: "Sistema HIS",
    category: "clinical",
    phases: [
      bin("INFRA", "Infraestructura", 1),
      bin("DEPLOY", "Despliegue", 2),
      bin("INTEGRATION", "Integración", 3),
      bin("UAT", "UAT hospital", 4),
    ],
  },
];

/** Dependencias demo — extensible vía config */
export const SYSTEM_DEPENDENCIES = [
  { upstreamCode: "07.14", downstreamCode: "07", weight: 1, label: "Enlaces IP" },
  { upstreamCode: "07.14", downstreamCode: "07.02", weight: 1, label: "PoE / datos" },
  { upstreamCode: "07.14", downstreamCode: "07.03", weight: 1, label: "Datos" },
  { upstreamCode: "07.14", downstreamCode: "07.04", weight: 0.8, label: "Datos" },
  { upstreamCode: "07.14", downstreamCode: "07.07", weight: 1, label: "Datos" },
  { upstreamCode: "07.14", downstreamCode: "07.13", weight: 1, label: "Datos AV" },
  { upstreamCode: "07.14", downstreamCode: "07.16", weight: 0.6, label: "Canalización" },
  { upstreamCode: "07.08", downstreamCode: "07", weight: 0.5, label: "Core red" },
  { upstreamCode: "07.08", downstreamCode: "07.10", weight: 1, label: "Backbone" },
  { upstreamCode: "07.08", downstreamCode: "07.11", weight: 1, label: "SAN" },
  { upstreamCode: "07.08", downstreamCode: "07.20", weight: 1, label: "Red clínica" },
  { upstreamCode: "07.08", downstreamCode: "07.21", weight: 0.8, label: "Red BMS" },
  { upstreamCode: "07.08", downstreamCode: "07.23", weight: 1, label: "Red HIS" },
  { upstreamCode: "07", downstreamCode: "07.04", weight: 0.7, label: "Integración voz" },
  { upstreamCode: "07.16", downstreamCode: "07.06", weight: 1, label: "Parlantes" },
  { upstreamCode: "07.16", downstreamCode: "07.12", weight: 1, label: "Coax" },
  { upstreamCode: "07.17", downstreamCode: "07.05", weight: 1, label: "Loop DAI" },
  { upstreamCode: "07.10", downstreamCode: "07.20", weight: 0.6, label: "Servidores" },
];

export function getCatalogSystem(code: string): SystemDefinition | undefined {
  return SYSTEM_CATALOG.find((s) => s.code === code);
}

export function valueTypeFromCode(code: 1 | 2 | 3): PhaseValueType {
  if (code === 1) return "TERNARY";
  if (code === 3) return "CONTINUOUS";
  return "BINARY";
}
