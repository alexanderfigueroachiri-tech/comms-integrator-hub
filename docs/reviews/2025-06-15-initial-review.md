# Revisión inicial de código — comms-integrator-hub

**Fecha:** 2025-06-15  
**Revisor:** Agente Revisor de código  
**Alcance:** `apps/web`, `packages/shared`, `docs`  
**Rama revisada:** `master` / `main` (demo gerencial v0.2)  
**Referencias:** [conventions.md](../conventions.md), [AGENTS.md](../../AGENTS.md), [03-avance-obra-module.md](../specs/03-avance-obra-module.md)

---

## Resumen ejecutivo

El repo entrega una **demo gerencial creíble** para portfolio: dominio de obra real (SCE, metrados, trencitos), motor de salud extraído a `@cih/shared`, UI Command Center pulida y documentación spec-driven sólida. La deuda principal está en **gates de CI**, **brechas AC vs UI** (mapa de trenes, metrados filtrables, drill-down) y **convenciones core** aún no materializadas (Zod, `AuditEvent`, estructura `modules/`).

---

## Top 5 fortalezas (portfolio)

1. **Arquitectura spec-driven demostrable** — Specs numerados, ADRs (0001–0004), convenciones transversales y plan de pruebas (`03-avance-obra-tests.md`) forman un ciclo backstage creíble para clientes técnicos y gerencia.

2. **Motor de dominio bien ubicado** — `packages/shared/src/progress-engine.ts` concentra semáforo, plazo contractual, promedios de metrado y resumen ejecutivo; la UI en `apps/web` consume `DashboardSnapshot` sin duplicar reglas de negocio.

3. **Profundidad de dominio IntegraCom** — Catálogo de ~20 sistemas hospitalarios, fases SCE alineadas a BICSI/TIA, dependencias inter-sistema, narrativa demo (SCE rezagado → cascada) y datos seed con metrados SCE hand-crafted (`SCE_METRADOS`).

4. **UI gerencial lista para demo** — Command Center con KPIs, curva S (Recharts), grafo SVG de dependencias con hover, trencito de fases, matriz de sistemas, alertas tipadas y shell responsive con sidebar móvil.

5. **Pruebas unitarias del motor crítico** — Vitest en `@cih/shared` cubre `computeHealth`, progreso de metrado, plazo contractual y coherencia del snapshot demo (AC-D01/D03 a nivel de datos). Plan de casos trazable a BR/AC del spec.

---

## Top 10 issues / deuda (priorizados)

| # | Prioridad | Issue | Evidencia | Impacto |
|---|-----------|-------|-----------|---------|
| 1 | **P0** | **CI no ejecuta tests ni lint** — solo `pnpm build` | `.github/workflows/ci.yml` | Regresiones del motor de salud pueden mergearse; contradice criterio de merge en `03-avance-obra-tests.md` |
| 2 | **P0** | **AC-D03 incompleto en UI** — riesgo heredado no visible en mapa de trenes (G2) | `dependency-graph.tsx` no usa `inheritedRisk`; solo `system-detail.tsx` | Criterio de aceptación demo no verificable manualmente en pantalla principal |
| 3 | **P0** | **Pantallas G4/G5 del spec ausentes** — tabla metrados sin filtros; sin drill-down por metrado | `metrado-table.tsx` sin filtros; no existe ruta `/systems/[code]/metrados/[id]` | MVP spec §9 incompleto; demo no cubre flujo gerencial completo |
| 4 | **P1** | **Deriva demo vs spec** — spec §4 describe 4 sistemas; ADR-0003 habla de 3 satélites; código carga ~20 sistemas | `SYSTEM_CATALOG` vs `03-avance-obra-module.md` §4 | Narrativa demo confusa; KPIs diluidos; más difícil explicar foco SCE |
| 5 | **P1** | **Convenciones core sin implementar** — sin `AuditEvent`, sin Zod en borde | `packages/shared/src/types.ts`; grep sin `zod` | Deuda explícita vs `conventions.md` §5–6; bloquea módulo campo y API futura |
| 6 | **P1** | **Estructura de módulos no aplicada** — componentes planos, sin `apps/web/modules/*` | `apps/web/src/components/` | Límite bounded context difuso cuando crezcan field-ops y avance-obra |
| 7 | **P1** | **Topología duplicada en grafo** — `LAYERS` hardcodeado aparte de `SYSTEM_DEPENDENCIES` | `dependency-graph.tsx` L16–22 vs `system-catalog.ts` | Riesgo de drift al añadir/quitar sistemos o dependencias |
| 8 | **P1** | **BR-A01 sin motor** — fase *n* no validada si *n−1* ≠ YES | Spec §5.3; test plan marca “futuro” | Regla de negocio clave para producción; datos seed pueden ser inconsistentes |
| 9 | **P2** | **Curva S con meses estáticos** — `buildTimelineSeries` usa labels fijos Ene–Ago | `progress-engine.ts` L137–148 | Gráfico puede no alinearse al contrato real del proyecto |
| 10 | **P2** | **E2E Playwright pendiente** — AC visuales sin automatizar | `03-avance-obra-tests.md` §4 | Regresión UI manual; aceptable en v0.2 demo pero deuda QA |

> **Corrección aplicada en esta revisión:** AC-D02 en spec decía “7 fases”; alineado a 6 fases SCE implementadas (`SCE_PHASES.length === 6`).

---

## 5 quick wins (< 1 h c/u)

| # | Acción | Tiempo est. | Archivos |
|---|--------|-------------|----------|
| 1 | Añadir `pnpm test` y `pnpm lint` al workflow CI | ~15 min | `.github/workflows/ci.yml` |
| 2 | Badge “riesgo heredado” en nodos del grafo y tarjetas de `SystemsMatrix` cuando `inheritedRisk === true` | ~45 min | `dependency-graph.tsx` |
| 3 | Filtros básicos en tabla metrados (nivel, bloque, ambiente) con `<select>` client-side | ~45 min | `metrado-table.tsx` |
| 4 | `aria-label="Abrir menú"` en botón hamburguesa móvil | ~5 min | `app-shell.tsx` |
| 5 | Extraer `HEALTH_COLORS` / estilos de semáforo a util compartida (`health-styles.ts`) | ~30 min | `health-badge.tsx`, `dependency-graph.tsx`, `analytics-panel.tsx` |

---

## Checklist revisor (convenciones)

| Regla | Estado |
|-------|--------|
| TypeScript estricto | ✅ `apps/web/tsconfig.json` |
| Lógica de negocio fuera de presentación | ✅ Motor en `@cih/shared` |
| Tests reglas críticas | ✅ Vitest motor + snapshot |
| RBAC servidor | ⏸ Fuera de demo (ADR-0003) |
| Zod en borde | ❌ Pendiente |
| AuditEvent universal | ❌ Pendiente |
| Estados carga/vacío/error | ⚠ Parcial (`AlertPanel` vacío; sin loading) |
| Mobile-first | ✅ Shell + tablas scroll horizontal |
| Spec antes de código | ✅ ADR-0003 + spec 03 |

---

## Recomendación de merge / siguiente backstage

- **Bloqueantes P0 antes de tag portfolio:** CI con test+lint; cerrar AC-D03 en UI; mínimo filtros G4 o documentar explícitamente defer en spec.
- **Siguiente agente recomendado (AGENTS.md):** QA — Playwright E2E-G1–G3; o Frontend — quick win #2 y #3.

---

## Historial

| Fecha | Autor | Notas |
|-------|-------|-------|
| 2025-06-15 | Revisor código | Revisión inicial post demo v0.2 |
