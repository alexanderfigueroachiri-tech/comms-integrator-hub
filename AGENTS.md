# Orquestación multi-agente

El **humano (orquestador)** aprueba specs, prioriza y valida entregables. Los agentes no implementan fuera de spec aprobado.

## Roles

| Agente | Responsabilidad | Entregables | No toca |
|--------|-----------------|-------------|---------|
| **Spec** | Product brief, user stories, modelos de datos, OpenAPI borrador | `docs/specs/`, `docs/diagrams/` | Código de aplicación |
| **Architect** | ADRs, límites de módulos, contratos compartidos | `docs/adr/`, `packages/shared/` | UI detallada |
| **Backend** | API, auth, RBAC, persistencia | `apps/api/` o routes, `packages/database/` | Specs sin aprobación |
| **Frontend** | UI por módulo, accesibilidad, flujos | `apps/web/` | Schema DB sin ADR |
| **Infra** | CI/CD, Docker, despliegue, variables | `.github/`, `infra/` | Lógica de negocio |

## Reglas universales

1. **Spec first:** issue o doc en `docs/specs/` → revisión orquestador → recién entonces código.
2. **Contratos compartidos:** tipos, enums de roles y DTOs viven en `packages/shared/` (cuando exista el monorepo).
3. **Un módulo = un bounded context:** Producción en Campo no importa lógica de Contabilidad.
4. **Auditoría transversal:** toda mutación relevante deja rastro (quién, qué, cuándo).
5. **Worktree por frente:** ver README y ADR-0002 cuando se creen worktrees.

## Flujo de trabajo

```
Orquestador define prioridad
    → Agente Spec escribe/actualiza spec
    → Orquestador aprueba
    → Agente Architect (si hay decisión nueva) escribe ADR
    → Backend / Frontend en worktrees o ramas feat/*
    → Integración en main tras revisión
```

## Fase actual

**Spec Agent** activo. Esqueleto en `01-field-ops-module.md`. Esperando contexto del orquestador + decisiones en `docs/decisions/technology-menu.md`.
