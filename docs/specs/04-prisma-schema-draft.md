# Spec — Borrador schema Prisma (persistencia avance de obra)

**Versión:** 0.1 (borrador)  
**Estado:** Pendiente aprobación orquestador  
**Referencias:** [02-data-model-core](./02-data-model-core.md) · [ADR-0004](../adr/0004-postgresql-prisma-import.md) · `packages/shared/src/types.ts` · `packages/shared/src/system-catalog.ts`

> **Alcance:** documentación y contrato de tablas. **No** incluye scaffold de `packages/database` hasta aprobación de ADR-0004 fase B.

---

## 1. Objetivo

Definir el schema Prisma inicial para persistir el modelo de [02-data-model-core](./02-data-model-core.md), alineado a tipos existentes en `@cih/shared`, con extensiones mínimas para import Excel y auditoría.

---

## 2. Diagrama ER (fase B)

```
Organization ──< Project ──< Contract
Project ──< System ──< PhaseDefinition
Project ──< SystemDependency (entre System del mismo proyecto)
System ──< Metrado ──< MetradoPhaseValue
Project ──< Alert
Project ──< ImportBatch ──< ImportRowError
Project ──< ImportColumnMapping (opcional v1, JSON en Project.settings alternativa)
```

**Diferido:** `User`, `Role`, `ProjectMember` (fase C — RBAC).

---

## 3. Enums

Alineados a `packages/shared/src/types.ts`:

| Enum Prisma | Valores | Uso |
|-------------|---------|-----|
| `PhaseValueType` | `TERNARY`, `BINARY`, `CONTINUOUS` | `PhaseDefinition.valueType` |
| `SalidaTipo` | `SIMPLE`, `DOBLE` | `Metrado.salidaTipo` |
| `SystemCategory` | `CABLING`, `SECURITY`, `CLINICAL`, `NETWORK`, `ADMIN` | Copiado de catálogo al instanciar |
| `AlertSeverity` | `INFO`, `WARNING`, `CRITICAL` | `Alert.severity` |
| `ImportBatchStatus` | `PENDING`, `VALIDATING`, `PREVIEW`, `COMMITTED`, `FAILED`, `ROLLED_BACK` | Pipeline import |
| `HealthStatus` | `GOOD`, `WARNING`, `CRITICAL` | Cache opcional; cálculo preferido en runtime |

Valores de fase (`BinaryValue`, `TernaryValue`, números) se almacenan como **string** en `MetradoPhaseValue.value` para flexibilidad; validación en capa de aplicación contra `PhaseDefinition.valueType`.

---

## 4. Entidades

### 4.1 Organization

Tenant multi-cliente (fase D).

| Campo | Tipo Prisma | Notas |
|-------|-------------|-------|
| id | `String @id @default(cuid())` | |
| name | `String` | Ej. IntegraCom |
| slug | `String @unique` | URL-safe |
| createdAt | `DateTime @default(now())` | |
| updatedAt | `DateTime @updatedAt` | |

### 4.2 Project

Obra / hospital bajo contrato.

| Campo | Tipo Prisma | Notas |
|-------|-------------|-------|
| id | `String @id @default(cuid())` | |
| organizationId | `String` | FK → Organization |
| name | `String` | Hospital Metropolitano Demo |
| client | `String?` | Nombre cliente |
| simulatedToday | `DateTime?` | Solo demo; null en prod = `now()` |
| settings | `Json?` | Config fases YAML serializada, feature flags |
| createdAt / updatedAt | `DateTime` | |

**Índices:** `(organizationId)`, `(organizationId, name)`.

### 4.3 Contract

Marco legal del proyecto (1:1 demo, 1:N posible en prod).

| Campo | Tipo Prisma | Notas |
|-------|-------------|-------|
| id | `String @id @default(cuid())` | |
| projectId | `String` | FK → Project |
| startDate | `DateTime @db.Date` | |
| endDate | `DateTime @db.Date` | |
| penaltyNote | `String?` | Texto libre multas |
| createdAt / updatedAt | `DateTime` | |

**Índice:** `(projectId)`.

### 4.4 System

Instancia de sistema **en un proyecto** (no confundir con `SYSTEM_CATALOG` en código).

| Campo | Tipo Prisma | Notas |
|-------|-------------|-------|
| id | `String @id @default(cuid())` | |
| projectId | `String` | FK → Project |
| code | `String` | `07.14`, `07`, … |
| name | `String` | |
| category | `SystemCategory` | Desde catálogo al crear |
| standardRef | `String?` | BICSI / NFPA ref |
| sortOrder | `Int @default(0)` | Orden en UI |
| catalogSourceCode | `String?` | Traza a `SYSTEM_CATALOG.code` |
| createdAt / updatedAt | `DateTime` | |

**Unique:** `(projectId, code)`.

### 4.5 PhaseDefinition

Trencito configurable por sistema (copiado del catálogo, editable por proyecto).

| Campo | Tipo Prisma | Notas |
|-------|-------------|-------|
| id | `String @id @default(cuid())` | |
| systemId | `String` | FK → System |
| code | `String` | COMPATIBILIZACION |
| label | `String` | Compatibilización |
| sortOrder | `Int` | 1…n |
| valueType | `PhaseValueType` | |
| valueTypeCode | `Int` | 1 \| 2 \| 3 — espejo orquestador |
| maxValue | `Float?` | CONTINUOUS: metros máx |
| createdAt / updatedAt | `DateTime` | |

**Unique:** `(systemId, code)`.  
**Orden:** `(systemId, sortOrder)`.

### 4.6 SystemDependency

DAG inter-sistema dentro del mismo proyecto.

| Campo | Tipo Prisma | Notas |
|-------|-------------|-------|
| id | `String @id @default(cuid())` | |
| projectId | `String` | FK → Project — denormalizado para queries |
| upstreamSystemId | `String` | FK → System |
| downstreamSystemId | `String` | FK → System |
| weight | `Float @default(1)` | 0–1 impacto |
| label | `String?` | Ej. "PoE / datos" |
| createdAt | `DateTime @default(now())` | |

**Unique:** `(upstreamSystemId, downstreamSystemId)`.  
**Check (app layer):** upstream ≠ downstream.

### 4.7 Metrado

Unidad granular de avance.

| Campo | Tipo Prisma | Notas |
|-------|-------------|-------|
| id | `String @id @default(cuid())` | |
| systemId | `String` | FK → System |
| code | `String` | SCE-H-0042 |
| nivel | `String` | |
| bloque | `String` | |
| ambiente | `String` | |
| rotulado | `String` | TIA-606 |
| salidaTipo | `SalidaTipo?` | |
| lastImportBatchId | `String?` | FK → ImportBatch |
| createdAt / updatedAt | `DateTime` | |

**Unique:** `(systemId, code)`.  
**Índices:** `(systemId, nivel)`, `(systemId, bloque, ambiente)`.

### 4.8 MetradoPhaseValue

Valor por fase (normalizado; alternativa JSON descartada en ADR-0004).

| Campo | Tipo Prisma | Notas |
|-------|-------------|-------|
| id | `String @id @default(cuid())` | |
| metradoId | `String` | FK → Metrado |
| phaseCode | `String` | Debe existir en PhaseDefinition |
| value | `String?` | YES, DONE, "85", null = sin dato |
| updatedAt | `DateTime @updatedAt` | |
| updatedByImportId | `String?` | FK → ImportBatch |

**Unique:** `(metradoId, phaseCode)`.

### 4.9 Alert

Alertas gerenciales (generadas por motor o persistidas post-cálculo).

| Campo | Tipo Prisma | Notas |
|-------|-------------|-------|
| id | `String @id @default(cuid())` | |
| projectId | `String` | FK → Project |
| systemId | `String?` | FK → System |
| severity | `AlertSeverity` | |
| code | `String` | A1, A2, … |
| message | `String` | |
| resolvedAt | `DateTime?` | |
| createdAt | `DateTime @default(now())` | |

**Índice:** `(projectId, severity)`, `(projectId, resolvedAt)`.

### 4.10 ImportBatch

Auditoría de importación Excel/CSV.

| Campo | Tipo Prisma | Notas |
|-------|-------------|-------|
| id | `String @id @default(cuid())` | |
| projectId | `String` | FK → Project |
| systemId | `String?` | Sistema objetivo si aplica |
| fileName | `String` | |
| fileHash | `String` | SHA-256 deduplicación |
| rowCount | `Int` | |
| successCount | `Int @default(0)` | |
| errorCount | `Int @default(0)` | |
| status | `ImportBatchStatus` | |
| warnings | `Json?` | Array de strings |
| startedAt | `DateTime @default(now())` | |
| completedAt | `DateTime?` | |

### 4.11 ImportRowError

Detalle de filas rechazadas.

| Campo | Tipo Prisma | Notas |
|-------|-------------|-------|
| id | `String @id @default(cuid())` | |
| batchId | `String` | FK → ImportBatch |
| rowNumber | `Int` | 1-based, post-header |
| field | `String?` | columna o phaseCode |
| rawValue | `String?` | |
| message | `String` | |

---

## 5. Borrador `schema.prisma`

```prisma
// packages/database/prisma/schema.prisma — BORRADOR, no generar aún

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum PhaseValueType {
  TERNARY
  BINARY
  CONTINUOUS
}

enum SalidaTipo {
  SIMPLE
  DOBLE
}

enum SystemCategory {
  CABLING
  SECURITY
  CLINICAL
  NETWORK
  ADMIN
}

enum AlertSeverity {
  INFO
  WARNING
  CRITICAL
}

enum ImportBatchStatus {
  PENDING
  VALIDATING
  PREVIEW
  COMMITTED
  FAILED
  ROLLED_BACK
}

model Organization {
  id        String    @id @default(cuid())
  name      String
  slug      String    @unique
  projects  Project[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Project {
  id             String         @id @default(cuid())
  organizationId String
  organization   Organization   @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  name           String
  client         String?
  simulatedToday DateTime?
  settings       Json?
  contracts      Contract[]
  systems        System[]
  dependencies   SystemDependency[]
  alerts         Alert[]
  importBatches  ImportBatch[]
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  @@index([organizationId])
}

model Contract {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  startDate   DateTime @db.Date
  endDate     DateTime @db.Date
  penaltyNote String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([projectId])
}

model System {
  id                String             @id @default(cuid())
  projectId         String
  project           Project            @relation(fields: [projectId], references: [id], onDelete: Cascade)
  code              String
  name              String
  category          SystemCategory
  standardRef       String?
  sortOrder         Int                @default(0)
  catalogSourceCode String?
  phases            PhaseDefinition[]
  metrados          Metrado[]
  upstreamDeps      SystemDependency[] @relation("UpstreamSystem")
  downstreamDeps    SystemDependency[] @relation("DownstreamSystem")
  alerts            Alert[]
  importBatches     ImportBatch[]
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt

  @@unique([projectId, code])
}

model PhaseDefinition {
  id            String         @id @default(cuid())
  systemId      String
  system        System         @relation(fields: [systemId], references: [id], onDelete: Cascade)
  code          String
  label         String
  sortOrder     Int
  valueType     PhaseValueType
  valueTypeCode Int
  maxValue      Float?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  @@unique([systemId, code])
  @@index([systemId, sortOrder])
}

model SystemDependency {
  id                 String  @id @default(cuid())
  projectId          String
  project            Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  upstreamSystemId   String
  upstreamSystem     System  @relation("UpstreamSystem", fields: [upstreamSystemId], references: [id], onDelete: Cascade)
  downstreamSystemId String
  downstreamSystem   System  @relation("DownstreamSystem", fields: [downstreamSystemId], references: [id], onDelete: Cascade)
  weight             Float   @default(1)
  label              String?
  createdAt          DateTime @default(now())

  @@unique([upstreamSystemId, downstreamSystemId])
  @@index([projectId])
}

model Metrado {
  id                String              @id @default(cuid())
  systemId          String
  system            System              @relation(fields: [systemId], references: [id], onDelete: Cascade)
  code              String
  nivel             String
  bloque            String
  ambiente          String
  rotulado          String
  salidaTipo        SalidaTipo?
  lastImportBatchId String?
  lastImportBatch   ImportBatch?        @relation(fields: [lastImportBatchId], references: [id], onDelete: SetNull)
  phaseValues       MetradoPhaseValue[]
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  @@unique([systemId, code])
  @@index([systemId, nivel])
  @@index([systemId, bloque, ambiente])
}

model MetradoPhaseValue {
  id                String       @id @default(cuid())
  metradoId         String
  metrado           Metrado      @relation(fields: [metradoId], references: [id], onDelete: Cascade)
  phaseCode         String
  value             String?
  updatedByImportId String?
  updatedByImport   ImportBatch? @relation(fields: [updatedByImportId], references: [id], onDelete: SetNull)
  updatedAt         DateTime     @updatedAt

  @@unique([metradoId, phaseCode])
}

model Alert {
  id         String        @id @default(cuid())
  projectId  String
  project    Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)
  systemId   String?
  system     System?       @relation(fields: [systemId], references: [id], onDelete: SetNull)
  severity   AlertSeverity
  code       String
  message    String
  resolvedAt DateTime?
  createdAt  DateTime      @default(now())

  @@index([projectId, severity])
  @@index([projectId, resolvedAt])
}

model ImportBatch {
  id           String              @id @default(cuid())
  projectId    String
  project      Project             @relation(fields: [projectId], references: [id], onDelete: Cascade)
  systemId     String?
  system       System?             @relation(fields: [systemId], references: [id], onDelete: SetNull)
  fileName     String
  fileHash     String
  rowCount     Int
  successCount Int                 @default(0)
  errorCount   Int                 @default(0)
  status       ImportBatchStatus
  warnings     Json?
  startedAt    DateTime            @default(now())
  completedAt  DateTime?
  rowErrors    ImportRowError[]
  metrados     Metrado[]
  phaseUpdates MetradoPhaseValue[]

  @@index([projectId, fileHash])
}

model ImportRowError {
  id        String      @id @default(cuid())
  batchId   String
  batch     ImportBatch @relation(fields: [batchId], references: [id], onDelete: Cascade)
  rowNumber Int
  field     String?
  rawValue  String?
  message   String

  @@index([batchId])
}
```

---

## 6. Mapeo shared ↔ Prisma

| Shared (`types.ts`) | Prisma model | Notas |
|---------------------|--------------|-------|
| `ProjectDemo` | Project + Contract + System[] + … | Agregado; seed aplana en tablas |
| `SystemInstance` | System + Metrado[] + PhaseDefinition[] | |
| `Metrado.phases` | MetradoPhaseValue[] | Record → filas |
| `SystemDependency` | SystemDependency | codes → FK ids en seed script |
| `Alert` | Alert | |
| `SYSTEM_CATALOG` | *(código)* | Plantilla; no tabla en fase B |
| `PhaseDefinition` | PhaseDefinition | Mismos campos |

Funciones de cálculo (`computeMetradoProgress`, etc.) reciben DTOs construidos desde Prisma en repos delgados — **sin** dependencia de Prisma dentro de `packages/shared`.

---

## 7. Seed demo (criterio de aceptación fase B)

| AC | Descripción |
|----|-------------|
| AC-P01 | Seed crea Organization "IntegraCom", Project demo, 4 systems, dependencias de `SYSTEM_DEPENDENCIES` filtradas |
| AC-P02 | 12 metrados SCE con fases parciales equivalentes al seed TS actual |
| AC-P03 | Contrato 2025-01-01 → 2025-06-30, `simulatedToday` mes 5.5 |
| AC-P04 | Dashboard con `CIH_DATA_SOURCE=db` coincide con seed en ±0.5 % avance global |

---

## 8. Fuera de alcance (v0.1 schema)

- QuotationLine, TechnicalSheet, WorkOrder
- User / Role / Session (Auth.js — spec futuro)
- Partidas de material (`7.14.3`, …) — catálogo documental, no metrados
- Full-text search en metrados

---

## 9. Historial

| Versión | Cambios |
|---------|---------|
| 0.1 | Borrador inicial — entidades core + import |
