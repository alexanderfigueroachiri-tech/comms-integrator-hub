# ADR-0004: PostgreSQL + Prisma — cuándo activar e importación Excel

**Estado:** Aprobado (fase B en curso)  
**Fecha:** 2025-06-28  
**Decisor:** Orquestador (aprobado 2025-06-15)  
**Referencias:** [ADR-0002](./0002-stack-tecnologico.md) · [ADR-0003](./0003-demo-gerencial-primero.md) · [02-data-model-core](../specs/02-data-model-core.md) · [03-avance-obra-module](../specs/03-avance-obra-module.md) · [04-prisma-schema-draft](../specs/04-prisma-schema-draft.md)

## Contexto

El stack ya define PostgreSQL + Prisma ([ADR-0002](./0002-stack-tecnologico.md)). La demo gerencial v0.2 ([ADR-0003](./0003-demo-gerencial-primero.md)) usa seed TypeScript en `@cih/shared` sin persistencia. En producción, un hospital real implica ~700+ filas de metrados en Excel, configuración de fases por proyecto, usuarios con RBAC y auditoría de importaciones.

Se necesita decidir **cuándo** crear `packages/database` y **cómo** importar metrados sin romper el motor de salud ya validado en `packages/shared`.

## Decisión

### 1. Cuándo activar PostgreSQL + Prisma

| Fase | Condición (todas las de la fila) | Entregable |
|------|----------------------------------|------------|
| **A — Demo (actual)** | Demo v0.2 publicada; motor en `shared` con seed JSON/TS | Sin `packages/database` |
| **B — Persistencia mínima** | Orquestador aprueba spec `04-prisma-schema-draft.md`; QA Vitest del motor en verde | Scaffold `packages/database`, migración inicial, seed desde demo existente |
| **C — Import + RBAC** | Auth.js + roles definidos; Excel anonimizado calibrado (5–10 filas → muestra representativa) | Pipeline import, API protegida, UI upload gerencia |
| **D — Multi-proyecto** | Segundo cliente o segundo hospital en mismo tenant | `Organization`, aislamiento por `projectId`, índices de escala |

**Regla:** no iniciar fase B hasta que el orquestador apruebe explícitamente este ADR **y** el borrador de schema en `04-prisma-schema-draft.md`.

**Gates técnicos adicionales (fase B):**

1. Variables `DATABASE_URL` documentadas (Neon/Supabase local o cloud).
2. Tipos de dominio permanecen en `packages/shared`; Prisma genera tipos de persistencia — **no duplicar** lógica de `computeMetradoProgress` en el ORM.
3. La app demo sigue funcionando con seed en memoria hasta que un feature flag (`CIH_DATA_SOURCE=db|seed`) active la DB en desarrollo.

### 2. Ubicación y responsabilidades

```
packages/shared     → tipos, motor de salud, catálogo SYSTEM_CATALOG (referencia)
packages/database   → schema.prisma, migraciones, Prisma Client, repos delgados
apps/web            → Route Handlers, import upload, lectura vía repos
```

- **Catálogo global** (`system-catalog.ts`): permanece en código como plantilla; al crear un proyecto se **instancian** `System` + `PhaseDefinition` copiados del catálogo (permitiendo override YAML futuro, ver spec §11).
- **Datos de proyecto**: viven en PostgreSQL; no se editan filas de catálogo en runtime.

### 3. Estrategia de importación Excel / CSV (metrados)

#### 3.1 Principios

| Principio | Implementación |
|-----------|----------------|
| **Idempotencia** | Clave natural `(systemId, code)`; reimport = upsert metrado + merge de fases |
| **Trazabilidad** | Cada import crea `ImportBatch` con usuario, timestamp, archivo hash, contadores |
| **Validación antes de commit** | Fase *validate* en memoria; solo persistir si error rate ≤ umbral configurable (default 0 %) |
| **Motor único** | Valores importados pasan por los mismos enums que `PhaseValues` en `shared` |
| **No bloquear UI** | Import > 100 filas: job async (Route Handler + cola simple o batch en transacción) |

#### 3.2 Flujo propuesto

```
Upload (.xlsx | .csv)
  → Parse (SheetJS / csv-parse)
  → Map columns (ImportColumnMapping por proyecto + sistema)
  → Normalize rows → MetradoDraft[]
  → Validate:
       - code único por sistema
       - fases existen en PhaseDefinition del sistema
       - valores compatibles con valueType (BINARY/TERNARY/CONTINUOUS)
       - BR-A01 opcional en import (warn, no hard-fail en v1)
  → Preview (primeras N filas + resumen errores) — UI gerencia
  → Commit transaccional:
       - ImportBatch.status = COMMITTED
       - upsert Metrado + MetradoPhaseValue
  → Regenerar Alert (job o hook post-import)
```

#### 3.3 Mapeo de columnas

Config por proyecto (JSON en DB o YAML en repo hasta UI de config):

```yaml
# Ejemplo — sistema 07.14
systemCode: "07.14"
sheet: "Metrados SCE"
headerRow: 1
columns:
  code: "Código salida"          # → Metrado.code
  nivel: "Nivel"
  bloque: "Bloque"
  ambiente: "Ambiente"
  rotulado: "Rotulado TIA"
  salidaTipo: "Tipo faceplate"   # SIMPLE | DOBLE
  phases:
    COMPATIBILIZACION: "Compat."
    CANALIZADO: "Canalizado"
    CABLEADO: "Cableado"
    PONCHADO: "Ponchado"
    PLAQUEADO: "Plaqueado"
    CERTIFICADO: "Certificado"
valueNormalization:
  "SI": "YES"
  "SÍ": "YES"
  "NO": "NO"
  "": null                       # omitir celda vacía
```

Columnas de fase no mapeadas → ignoradas con warning en `ImportBatch.warnings`.

#### 3.4 Formatos soportados (v1 import)

| Formato | Prioridad | Notas |
|---------|-----------|-------|
| `.xlsx` | P1 | Formato legacy obra; una hoja por sistema o hoja única con columna `sistema` |
| `.csv` UTF-8 | P1 | Export manual desde Excel; delimitador configurable |
| `.xls` | P2 | Solo si cliente lo exige; mismo parser |

**Volumen objetivo:** 700–2000 filas por sistema SCE; batch único < 30 s en Neon free tier (transacción + índices en `Metrado.code`).

#### 3.5 Errores y rollback

- Filas inválidas → `ImportRowError(batchId, rowNumber, field, message)`.
- Modo **strict** (default producción): 0 errores → commit; si hay errores → rollback completo, batch `FAILED`.
- Modo **partial** (solo dev/staging): commit filas válidas; documentar en UI cuántas se omitieron.

Reimport del mismo archivo (mismo hash): advertir duplicado; permitir si usuario confirma (útil para correcciones masivas).

### 4. Migración desde seed demo

1. Script `packages/database/prisma/seed.ts` lee `ProjectDemo` del seed actual en `shared`.
2. Inserta 1 `Organization`, 1 `Project`, sistemas demo, metrados y dependencias.
3. Criterio de éxite: dashboard con `CIH_DATA_SOURCE=db` produce mismo snapshot que seed (± tolerancia redondeo).

### 5. Entidades diferidas (fuera de fase B)

Permanecen fuera del schema inicial ([02-data-model-core](../specs/02-data-model-core.md) §1):

- `QuotationLine`, `TechnicalSheet`, `WorkOrder`
- Adjuntos S3 (MinIO/R2) — ADR futuro
- Config YAML editor en UI — usar JSON en `Project.settings` hasta entonces

## Consecuencias

**Positivas**

- Demo GitHub no se bloquea; DB entra con contrato claro (spec + ADR).
- Import reproducible y auditable para gerencia y campo.
- Motor de salud desacoplado: tests Vitest siguen sin DB.

**Negativas / riesgos**

- Dos fuentes de verdad temporales (seed vs DB) hasta feature flag unificado.
- Mapeo Excel por proyecto requiere calibración manual inicial (orquestador + muestra anonimizada).
- SheetJS aumenta bundle del Route Handler; evaluar import solo server-side.

## Alternativas consideradas

| Alternativa | Por qué se descartó |
|-------------|---------------------|
| SQLite en demo | Desvía de stack Neon/Supabase; migración doble |
| Import directo sin staging | Sin preview ni auditoría; 700 filas con errores opacos |
| JSONB único por metrado (fases embebidas) | Dificulta queries por fase y validación relacional |
| DB desde día 1 del repo | Contradice ADR-0003; retrasa demo portfolio |

## Pendiente (post-aprobación)

- [x] Orquestador aprueba ADR + `04-prisma-schema-draft.md`
- [x] Scaffold `packages/database` + schema Prisma inicial
- [ ] Seed parity verificado con `CIH_DATA_SOURCE=db`
- [ ] QA: `docs/specs/04-prisma-schema-draft-tests.md` (criterios seed parity, import validate)
- [ ] ADR-0005 (propuesto): Auth.js + RBAC mínimo (`GERENCIA`, `RESIDENTE`, `ADMIN`)
- [ ] Muestra Excel anonimizada en repo (`docs/fixtures/metrados-sample.xlsx`) — opcional, no bloqueante
