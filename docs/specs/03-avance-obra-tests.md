# Plan de pruebas — Avance de Obra (demo gerencial)

**Spec origen:** `03-avance-obra-module.md` v0.2  
**Motor bajo prueba:** `packages/shared/src/progress-engine.ts`, `packages/shared/src/demo-data.ts`  
**Automatizado:** Vitest en `@cih/shared`  
**Manual / e2e (fase posterior):** Playwright en `apps/web`

---

## 1. Alcance

| Capa | Qué se prueba | Herramienta |
|------|---------------|-------------|
| **Unit** | Semáforo, metrado, plazo contractual, snapshot demo | Vitest |
| **Integración UI** | Command Center, trencito, mapa de trenes | Playwright (pendiente) |
| **Regresión demo** | Seed `DEMO_PROJECT` coherente con narrativa SCE rezagado | Vitest + smoke manual |

Fuera de alcance v0.2: RBAC, import Excel, fichas técnicas.

---

## 2. Mapa spec → pruebas

### 2.1 Reglas de negocio

| ID | Regla | Caso de prueba | Vitest | AC / pantalla |
|----|-------|----------------|--------|---------------|
| BR-A01 | Fase *n* no avanza si fase *n−1* ≠ YES | Validación de transición de fases en metrado | — (UI / futuro) | G5 |
| BR-A02 | % sistema = promedio ponderado de metrados × fases (peso igual demo) | `computeMetradoProgress` con 6 fases binarias; promedio de 12 metrados SCE | ✅ `progress-engine.test.ts` | G3, G4 |
| §7.1 | `scheduledPct = elapsed / total × 100` | Contrato demo 2025-01-01 → 2025-06-30, hoy 2025-05-15 | ✅ `progress-engine.test.ts` | G1 |
| §7.2 | `actualPct = avg(metradoProgress)` | Promedio SCE_METRADOS vs `computeSystemProgressFromMetrados` | ✅ `progress-engine.test.ts` | G3 |
| §7.3 | Semáforo good / warning / critical | Umbrales ±10 pts; ejemplo 75 % vs 90 % → critical | ✅ `progress-engine.test.ts` | G1 |
| §7.4-A1 | Sistema rezagado vs contrato | SCE critical → alerta A1 en snapshot | ✅ `demo-data.test.ts` | G1 |
| §7.4-A2 | Cuello de botella intra-metado | SCE con `bottleneckPhase` → alerta A2 | ✅ `demo-data.test.ts` | G3 |
| §7.4-A3 | Riesgo heredado upstream | SCE critical → downstream `inheritedRisk` + alerta A3 | ✅ `demo-data.test.ts` | G2, AC-D03 |
| §7.4-A4 | Días restantes < umbral y avance < 95 % | `remainingDays < 45` y overall < 90 % → A4 | ✅ `demo-data.test.ts` | G1 |

### 2.2 Criterios de aceptación demo

| AC | Given / When / Then | Casos automatizados | Manual / e2e |
|----|---------------------|---------------------|--------------|
| **AC-D01** | Contrato 180 días, día ~120; Command Center muestra semáforo y mensaje natural | `buildDashboardSnapshot`: `overallHealth`, `executiveSummary` no vacío, coherente con `computeHealth` | Playwright: texto semáforo visible |
| **AC-D02** | Sistema 07.14: 6 fases en orden, nodo crítico | `SCE_PHASES.length === 6`, orden `sortOrder`; `findBottleneckPhase` en metrados demo | Playwright: detalle SCE resalta bottleneck |
| **AC-D03** | SCE en 🔴 → telefonía badge "riesgo heredado" | Snapshot: `07` tiene `inheritedRisk === true`; alerta A3 menciona riesgo heredado | Playwright: mapa de trenes badge |

---

## 3. Casos Vitest (detalle)

### 3.1 `computeHealth`

| TC | Entrada | Esperado |
|----|---------|----------|
| HC-01 | actual 90, scheduled 75 | `good` |
| HC-02 | actual 80, scheduled 85 | `warning` (≥ scheduled − 10) |
| HC-03 | actual 75, scheduled 90 | `critical` (ejemplo spec §7.3) |
| HC-04 | actual 85, scheduled 85 | `good` (borde exacto) |
| HC-05 | actual 75, scheduled 85 | `warning` (borde −10) |
| HC-06 | actual 74, scheduled 85 | `critical` (justo bajo warning) |

### 3.2 `computeMetradoProgress`

| TC | Entrada | Esperado |
|----|---------|----------|
| MP-01 | `phases = []` | `0` |
| MP-02 | 6 fases SCE, todas `YES` | `100` |
| MP-03 | 6 fases SCE, todas `NO` | `0` |
| MP-04 | Metrado m1 (3/6 YES) | `50` |
| MP-05 | Metrado m5 (6/6 YES) | `100` |
| MP-06 | Fase TERNARY `DONE` / `PARTIAL` / `PENDING` | `100` / `50` / `0` |

### 3.3 `computeScheduledProgress`

| TC | Entrada | Esperado |
|----|---------|----------|
| SP-01 | inicio = fin = hoy | `0` (borde `now <= start`) |
| SP-02 | hoy = inicio contrato | `0` |
| SP-03 | hoy = fin contrato | `100` |
| SP-04 | Demo: 2025-01-01 / 2025-06-30 / 2025-05-15 | ~74 % (redondeado) |
| SP-05 | hoy antes de inicio | `0` |
| SP-06 | hoy después de fin | `100` |

### 3.4 `buildDashboardSnapshot`

| TC | Verificación | Esperado (demo seed) |
|----|--------------|----------------------|
| DS-01 | Estructura mínima | `scheduledPct`, `overallActualPct`, `systems`, `alerts`, `executiveSummary` |
| DS-02 | Coherencia plazo | `scheduledPct === computeScheduledProgress(...)` |
| DS-03 | Coherencia semáforo global | `overallHealth === computeHealth(overallActualPct, scheduledPct)` |
| DS-04 | SCE rezagado | `07.14.health === 'critical'` |
| DS-05 | Cascada AC-D03 | Sistema `07` con `inheritedRisk === true` |
| DS-06 | Alertas A1 | Al menos una alerta código `A1` para SCE |
| DS-07 | Alertas A3 | Alerta con código `A3` y mensaje "riesgo heredado" |
| DS-08 | Resumen ejecutivo | `executiveSummary` incluye % y lenguaje de riesgo cuando critical |
| DS-09 | Metrados SCE | `getProjectSystem(DEMO_PROJECT, '07.14').metrados.length === 12` |

---

## 4. Playwright (pendiente — no bloquea demo)

| ID | Flujo | AC |
|----|-------|-----|
| E2E-G1 | Abrir Command Center → semáforo + KPIs + alertas | AC-D01 |
| E2E-G2 | Mapa trenes → hover dependencia 07.14 → 07 | AC-D03 |
| E2E-G3 | Detalle 07.14 → 6 fases ordenadas + bottleneck | AC-D02 |
| E2E-G4 | Tabla metrados filtro por bloque | G4 |

---

## 5. Ejecución

```bash
pnpm test                    # root → @cih/shared
pnpm --filter @cih/shared test
```

Criterio de merge motor de salud: **todos los Vitest PASS** + smoke manual G1–G3 antes de tag demo.

---

## 6. Historial

| Versión | Cambios |
|---------|---------|
| 0.1 | Plan inicial QA: mapa AC + Vitest motor + snapshot demo |
