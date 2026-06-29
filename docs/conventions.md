# Convenciones y universalidades

Documento de referencia para todo el monorepo. Las decisiones concretas de stack viven en ADRs; aquí están las **reglas transversales** que no cambian por módulo.

---

## 1. Distinciones fundamentales

| Concepto | Qué es | Dónde vive | Ejemplo |
|----------|--------|------------|---------|
| **Core (núcleo)** | Capacidades compartidas por todos los módulos | `packages/*`, APIs `/api/core/*` | Usuarios, proyectos, auditoría |
| **Módulo** | Bounded context de un área de negocio | `apps/web/modules/*`, specs en `docs/specs/` | Producción en Campo |
| **Spec** | Contrato funcional antes de código | `docs/specs/` | Flujo de OT, estados, permisos |
| **ADR** | Decisión técnica irreversible o costosa de cambiar | `docs/adr/` | PostgreSQL vs MySQL |
| **Contrato (DTO/API)** | Interfaz entre capas o agentes | `packages/shared/`, OpenAPI | `WorkOrderStatus` enum |
| **Universalidad** | Tipo/regla usada por 2+ módulos | `packages/shared/` | `AuditEvent`, `ProjectId` |

**Regla de oro:** si solo lo usa un módulo, queda en el módulo. Si dos módulos lo necesitan, sube a `packages/shared/` con ADR si afecta persistencia.

---

## 2. Estructura de monorepo (objetivo)

```
comms-integrator-hub/
├── apps/
│   └── web/                 # Next.js: UI + API routes (o BFF)
├── packages/
│   ├── database/            # Prisma schema, migraciones, seeds
│   ├── shared/              # Tipos, enums, validadores Zod, constantes
│   └── config/              # ESLint, TS, Tailwind compartidos (opcional)
├── docs/
│   ├── specs/               # Specs funcionales
│   ├── adr/                 # Decisiones de arquitectura
│   ├── conventions.md       # Este archivo
│   └── decisions/           # Menús y respuestas del orquestador
├── infra/                   # Docker, scripts deploy (fase posterior)
└── .github/workflows/       # CI (fase posterior)
```

**Worktrees sugeridos** (cuando haya código):

| Worktree | Rama típica | Frente |
|----------|-------------|--------|
| `../comms-integrator-hub` | `main` | Integración |
| `../cih-specs` | `docs/field-ops-spec` | Specs y ADRs |
| `../cih-web-field` | `feat/field-ops-ui` | UI módulo campo |
| `../cih-api-field` | `feat/field-ops-api` | API módulo campo |

---

## 3. Convenciones de nombres

| Ámbito | Convención | Ejemplo |
|--------|------------|---------|
| Carpetas | `kebab-case` | `field-ops/` |
| Archivos TS/React | `kebab-case` o `PascalCase` para componentes | `work-order-form.tsx`, `WorkOrderCard.tsx` |
| Entidades DB | `PascalCase` singular (Prisma) | `WorkOrder` |
| Tablas SQL | `snake_case` plural (si raw SQL) | `work_orders` |
| API routes | `kebab-case`, REST plural | `/api/work-orders` |
| Enums | `PascalCase` tipo, `SCREAMING_SNAKE` valores | `WorkOrderStatus.IN_PROGRESS` |
| Specs | `NN-nombre-modulo.md` | `01-field-ops-module.md` |
| ADRs | `NNNN-titulo-kebab.md` | `0002-stack-tecnologico.md` |
| Ramas | `tipo/descripcion-corta` | `feat/field-ops-checklist` |
| Commits | Conventional Commits | `feat(field-ops): add work order states` |

---

## 4. Convenciones de specs

Cada spec de módulo debe incluir:

1. **Resumen y alcance** — qué entra y qué no.
2. **Actores y permisos** — matriz rol × acción.
3. **Flujos** — diagrama o pasos numerados.
4. **Estados** — máquina de estados explícita.
5. **Entidades** — campos mínimos; detalle fino en `02-data-model-core.md`.
6. **Reglas de negocio** — numeradas (BR-001, BR-002…).
7. **Criterios de aceptación** — verificables (Given/When/Then opcional).
8. **Preguntas abiertas** — bloque `[PENDIENTE ORQUESTADOR]`.

**Versionado del spec:** incrementar `Versión` en el encabezado; cambios de alcance requieren nueva revisión del orquestador.

---

## 5. Buenas prácticas transversales

### Seguridad y permisos

- RBAC en servidor; la UI solo oculta, no autoriza.
- Toda mutación de OT/dossier genera `AuditEvent`.
- Archivos: URLs firmadas o proxy autenticado; nunca buckets públicos con datos de cliente.

### Datos

- Soft delete para entidades de negocio (`deletedAt`).
- Timestamps: `createdAt`, `updatedAt` en todas las entidades core.
- IDs: UUID v4 (o cuid2) — decisión en ADR stack.

### API

- Validación en borde con esquema compartido (Zod).
- Errores consistentes: `{ code, message, details? }`.
- Paginación cursor o offset documentada en OpenAPI.

### UI

- Mobile-first (técnicos en campo).
- Estados de carga, vacío y error en cada vista principal.
- Acciones destructivas con confirmación.

### Código

- TypeScript estricto.
- Sin lógica de negocio en componentes de presentación.
- Tests en reglas de negocio críticas (transiciones de estado OT).

---

## 6. Auditoría (universalidad obligatoria)

Todo módulo emite eventos al núcleo de auditoría:

```ts
// Contrato conceptual (packages/shared)
AuditEvent {
  id, actorId, action, entityType, entityId,
  payload?, ip?, userAgent?, createdAt
}
```

Acciones mínimas para campo: `WORK_ORDER_CREATED`, `ASSIGNED`, `STATUS_CHANGED`, `EVIDENCE_UPLOADED`, `DOSSIER_SUBMITTED`, `CLOSED`.

---

## 7. Límites entre Core y Módulo Campo

| Responsabilidad | Core | Módulo Campo |
|-----------------|------|--------------|
| Usuario / sesión | ✅ | consume |
| Proyecto / cliente | ✅ CRUD básico | referencia por ID |
| Orden de trabajo | ❌ | ✅ dueño del agregado |
| Checklist / evidencias | ❌ | ✅ |
| Dossier (metadatos) | ✅ entidad genérica `Document` | ✅ tipos y estados específicos |
| Almacenamiento binario | ✅ servicio abstracto | usa API de upload |

---

## 8. Qué no hacer (anti-patrones)

- Implementar pantallas sin spec aprobado.
- Duplicar enums de estado en frontend y backend sin `packages/shared`.
- Acoplar módulo de campo a tablas de logística “por si acaso”.
- GPS obligatorio, offline complejo o firma biométrica en MVP sin ADR.
- “Universalizar” demasiado pronto — YAGNI hasta el segundo consumidor.
