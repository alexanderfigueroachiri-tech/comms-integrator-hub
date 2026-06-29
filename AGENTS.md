# Agentes y roles — comms-integrator-hub

El **Orquestador (humano)** aprueba specs, prioriza y valida entregables. Los agentes trabajan en **backstage** (worktrees/ramas) y no implementan fuera de spec aprobado.

---

## Roles esenciales (mínimo viable multi-agente)

Estos cuatro cubren el ciclo completo. Son los que conviene activar **ya**, incluso con pocos tokens:

| Prioridad | Rol | Por qué lo necesitas sí o sí |
|-----------|-----|------------------------------|
| **1** | **Diseñador de especificaciones** | Evita vibe coding; traduce tu experiencia de obra a contratos (`docs/specs/`) |
| **2** | **Arquitecto de software** | ADRs, límites de módulos, `packages/shared`, dependencias entre sistemas |
| **3** | **Diseñador / ejecutor de pruebas (QA)** | Verifica AC del spec, regresiones del motor de salud, flujos críticos |
| **4** | **Revisor de código** | Calidad, convenciones, scope del PR antes de integrar a `main` |

Roles de implementación (activar cuando haya spec + ADR aprobados):

| Rol | Cuándo |
|-----|--------|
| **Frontend** | UI, Recharts, grafo, responsive |
| **Backend** | Prisma, API, persistencia |
| **Infra** | CI, deploy Vercel, variables |

---

## Matriz de responsabilidades

| Rol | Responsabilidad | Entregables | No toca |
|-----|-----------------|-------------|---------|
| **Orquestador** | Prioridad, aprobación, contexto de negocio | Decisiones en specs, ADRs | — |
| **Diseñador de specs** | Brief, user stories, AC, modelos, OpenAPI borrador | `docs/specs/`, `docs/diagrams/` | Código app |
| **Arquitecto** | Stack, módulos, contratos, extensibilidad (deps, tipos fase) | `docs/adr/`, `packages/shared/` | UI pixel-perfect |
| **QA / pruebas** | Test plan, casos borde, e2e críticos, validación AC | `docs/specs/*-tests.md`, `apps/web/e2e/`, Vitest | Rediseñar arquitectura |
| **Revisor de código** | PR review, convenciones, deuda, seguridad obvia | Comentarios, checklist merge | Escribir features nuevas |
| **Frontend** | Dashboard, componentes, a11y | `apps/web/` | Schema DB sin ADR |
| **Backend** | API, auth, RBAC, DB | `packages/database/`, routes | Specs sin aprobación |
| **Infra** | CI/CD, Docker, deploy | `.github/workflows/`, `infra/` | Lógica negocio |

---

## Flujo backstage (spec-driven)

```
Orquestador → prioridad + contexto campo
    ↓
Diseñador de specs → actualiza docs/specs/
    ↓
Orquestador APRUEBA spec
    ↓
Arquitecto → ADR si hay decisión nueva
    ↓
Frontend / Backend (rama o worktree feat/*)
    ↓
QA → prueba contra criterios de aceptación del spec
    ↓
Revisor de código → revisa diff vs spec
    ↓
Orquestador → merge a main
```

---

## Prompts listos para agentes en backstage

### Diseñador de specs
```
Lee docs/specs/03-avance-obra-module.md y el contexto del orquestador.
Actualiza el spec con [X]. Incluye BR-xxx y AC-xxx verificables.
No escribas código.
```

### Arquitecto
```
Lee spec aprobado [ruta]. Escribe ADR para [decisión].
Define contratos en packages/shared/. No implementes UI.
```

### QA
```
Lee docs/specs/03-avance-obra-module.md sección AC.
Ejecuta pnpm build. Verifica manualmente o con Playwright:
- Command Center muestra semáforo coherente
- SCE 07.14 trencito 6 fases
- Dependencias resaltan en hover
Reporta: PASS/FAIL por AC.
```

### Revisor de código
```
Revisa el diff de la rama feat/* contra docs/conventions.md y el spec aprobado.
Lista: bugs, scope creep, tipos duplicados, falta de tests en motor de salud.
```

---

## Worktrees sugeridos

| Worktree | Rama | Agente principal |
|----------|------|------------------|
| repo principal | `main` | Integración |
| `../cih-specs` | `docs/spec-updates` | Diseñador de specs |
| `../cih-web` | `feat/ui-*` | Frontend |
| `../cih-qa` | `test/e2e-*` | QA |

---

## Fase actual del proyecto

| Área | Estado |
|------|--------|
| Demo gerencial v0.2 | ✅ En GitHub |
| Spec avance obra | ✅ v0.2 |
| QA automatizado | ⏳ Pendiente (Vitest motor + Playwright e2e) |
| PostgreSQL | ⏳ Roadmap |

**Próximo backstage recomendado:** QA escribe `docs/specs/03-avance-obra-tests.md` + tests Vitest para `progress-engine.ts`.
