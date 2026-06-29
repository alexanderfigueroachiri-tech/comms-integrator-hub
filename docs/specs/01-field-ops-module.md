# Spec — Módulo Producción en Campo

**Versión:** 0.1 (esqueleto — pendiente contexto orquestador)  
**Módulo:** `field-ops`  
**Organización demo:** IntegraCom  
**Depende de:** [00-product-brief.md](./00-product-brief.md), [conventions.md](../conventions.md)

---

## 1. Resumen

El módulo **Producción en Campo** gestiona el ciclo de vida de las **Órdenes de Trabajo (OT)** en sitio: asignación, ejecución con checklist y evidencias, y cierre hacia **dossier** validado por supervisor.

**Propósito:** reemplazar WhatsApp + carpetas sueltas por trazabilidad auditable sin complejidad de ERP.

### 1.1 Dentro del alcance (MVP)

- [ ] Crear y listar OT vinculadas a proyecto/sitio
- [ ] Asignar técnico(s) o equipo
- [ ] Ejecutar checklist en campo
- [ ] Subir evidencias (fotos/documentos)
- [ ] Transiciones de estado controladas
- [ ] Envío a revisión y cierre supervisado
- [ ] Vinculación con dossier del proyecto/OT

### 1.2 Fuera del alcance (MVP)

- Planificación de rutas / GPS en vivo
- Inventario de materiales (módulo logística)
- Facturación por OT
- Firma digital certificada legalmente
- Offline completo sin conexión

---

## 2. Actores

| Actor | Código | Descripción |
|-------|--------|-------------|
| Técnico de campo | `FIELD_TECH` | Ejecuta OT asignadas |
| Supervisor de producción | `FIELD_SUPERVISOR` | Crea/asigna, valida, cierra |
| Administrador | `ADMIN` | Configuración, usuarios, override |

### 2.1 Matriz de permisos (borrador)

| Acción | FIELD_TECH | FIELD_SUPERVISOR | ADMIN |
|--------|:----------:|:----------------:|:-----:|
| Ver OT propias | ✅ | ✅ todas | ✅ |
| Crear OT | ❌ | ✅ | ✅ |
| Asignar técnico | ❌ | ✅ | ✅ |
| Editar checklist en ejecución | ✅ | ✅ | ✅ |
| Subir evidencia | ✅ | ✅ | ✅ |
| Enviar a revisión | ✅ | ✅ | ✅ |
| Aprobar / rechazar cierre | ❌ | ✅ | ✅ |
| Cerrar OT | ❌ | ✅ | ✅ |
| Cancelar OT | ❌ | ✅ | ✅ |

`[PENDIENTE ORQUESTADOR]` — ¿El técnico puede crear OT en emergencia? ¿Admin hace todo lo del supervisor?

---

## 3. Conceptos del dominio

| Término | Definición |
|---------|------------|
| **OT (Work Order)** | Unidad de trabajo en un sitio concreto dentro de un proyecto |
| **Sitio (Site)** | Ubicación física de la intervención (torre, central, cliente) |
| **Checklist** | Lista verificable de tareas/ítems de instalación o commissioning |
| **Evidencia** | Archivo (foto, PDF) ligado a OT o ítem de checklist |
| **Dossier** | Conjunto documental con estados de aprobación |
| **Bitácora** | Registro append-only de acciones (auditoría core) |

---

## 4. Flujo principal (borrador)

```
[Supervisor crea OT] → DRAFT
        ↓ asigna técnico
    ASSIGNED
        ↓ técnico inicia en sitio
   IN_PROGRESS
        ↓ checklist + evidencias
   PENDING_REVIEW
        ↓ supervisor aprueba / rechaza
   CLOSED  /  IN_PROGRESS (rechazo)
```

`[PENDIENTE ORQUESTADOR]` — ¿Falta estado `ON_HOLD` (espera material/cliente)? ¿`CANCELLED`?

---

## 5. Máquina de estados — OT

| Estado | Código | Quién puede transicionar | Notas |
|--------|--------|--------------------------|-------|
| Borrador | `DRAFT` | SUPERVISOR, ADMIN | `[definir]` |
| Asignada | `ASSIGNED` | SUPERVISOR, ADMIN | Requiere técnico asignado |
| En progreso | `IN_PROGRESS` | FIELD_TECH, SUPERVISOR | `[definir]` inicio automático al abrir |
| Pendiente revisión | `PENDING_REVIEW` | FIELD_TECH, SUPERVISOR | Validar checklist completo |
| Cerrada | `CLOSED` | FIELD_SUPERVISOR, ADMIN | Dispara cierre dossier parcial |
| Cancelada | `CANCELLED` | FIELD_SUPERVISOR, ADMIN | `[definir]` motivo obligatorio |
| En espera | `ON_HOLD` | `[opcional MVP]` | |

### Reglas de negocio (borrador)

| ID | Regla | Estado |
|----|-------|--------|
| BR-001 | No cerrar OT sin evidencias mínimas configuradas | `[PENDIENTE]` |
| BR-002 | No pasar a PENDING_REVIEW con ítems obligatorios incompletos | `[PENDIENTE]` |
| BR-003 | Rechazo de supervisor devuelve a IN_PROGRESS con comentario | `[PENDIENTE]` |
| BR-004 | Toda transición de estado genera AuditEvent | Acordado (convenciones) |
| BR-005 | `[tu regla]` | |

---

## 6. Flujos por actor

### 6.1 Técnico de campo

1. Ver bandeja “Mis OT” (ASSIGNED, IN_PROGRESS).
2. Abrir OT → detalle sitio, checklist, evidencias previas.
3. Marcar ítems de checklist / notas.
4. Capturar o subir fotos.
5. Enviar a revisión.

`[PENDIENTE ORQUESTADOR]` — describe tu flujo real paso a paso.

### 6.2 Supervisor

1. Crear OT desde proyecto.
2. Asignar técnico y fecha planificada.
3. Monitorear tablero por estado.
4. Revisar evidencias → aprobar o rechazar.
5. Cerrar OT y validar dossier.

`[PENDIENTE ORQUESTADOR]` — ¿tablero Kanban, lista, o ambos?

### 6.3 Administrador

- Gestión de usuarios y roles (core).
- Override de estados `[definir si aplica]`.

---

## 7. Checklist de instalación

### 7.1 Estructura (propuesta)

```
ChecklistTemplate (por tipo de trabajo)
  └── ChecklistItem[] { label, required, order, category? }

WorkOrder
  └── WorkOrderChecklistItem[] { snapshot del template, done, doneAt, note? }
```

### 7.2 Tipos de trabajo (ejemplos — reemplazar con los tuyos)

| Código | Nombre | ¿MVP? |
|--------|--------|-------|
| `RADIO_INSTALL` | Instalación radio enlace | `[ ]` |
| `FIBER_SPLICE` | Empalme fibra | `[ ]` |
| `COMMISSIONING` | Puesta en marcha | `[ ]` |
| `MAINTENANCE` | Mantenimiento correctivo | `[ ]` |
| `[CUSTOM]` | | |

`[PENDIENTE ORQUESTADOR]` — lista real de tipos de obra que haces o supervisas.

### 7.3 Ítems de checklist ejemplo

`[PENDIENTE ORQUESTADOR]` — aporta 5–10 ítems reales de un dossier/instalación típica.

---

## 8. Evidencias

| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID | |
| workOrderId | FK | |
| checklistItemId | FK? | Opcional, foto por ítem |
| fileUrl / storageKey | string | vía servicio core de archivos |
| mimeType | string | image/*, application/pdf |
| caption | string? | |
| uploadedBy | userId | |
| createdAt | datetime | |

### Políticas (borrador)

| ID | Política | Valor MVP |
|----|----------|-----------|
| EV-001 | Máx. tamaño archivo | `[ej. 10 MB]` |
| EV-002 | Máx. archivos por OT | `[ej. 20]` |
| EV-003 | Formatos permitidos | jpg, png, pdf |
| EV-004 | Foto obligatoria por ítem crítico | `[definir]` |

---

## 9. Dossier (integración con core)

El módulo campo **consume** el agregado `Document` del core y aplica estados específicos:

```
DOSSIER_DRAFT → SUBMITTED → APPROVED | REJECTED
```

| ID | Regla | |
|----|-------|---|
| DS-001 | Al cerrar OT, dossier asociado pasa a SUBMITTED | `[confirmar]` |
| DS-002 | Supervisor APPROVED dossier al cerrar OT | `[confirmar]` |

`[PENDIENTE ORQUESTADOR]` — ¿un dossier por OT, por proyecto, o ambos?

---

## 10. Pantallas MVP (inventario)

| # | Pantalla | Actor principal | Prioridad |
|---|----------|-----------------|-----------|
| S1 | Login | todos | M |
| S2 | Dashboard por rol | todos | M |
| S3 | Lista / tablero OT | supervisor | M |
| S4 | Detalle OT | técnico, supervisor | M |
| S5 | Ejecución checklist + upload | técnico | M |
| S6 | Revisión y cierre | supervisor | M |
| S7 | Historial / auditoría OT | supervisor, admin | S |

Wireframes: `[pendiente — opción 8 del menú orquestador]`

---

## 11. API (borrador REST)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/work-orders` | Lista filtrada por rol |
| POST | `/api/work-orders` | Crear OT |
| GET | `/api/work-orders/:id` | Detalle |
| PATCH | `/api/work-orders/:id` | Actualizar metadatos |
| POST | `/api/work-orders/:id/assign` | Asignar técnico |
| POST | `/api/work-orders/:id/transitions` | Cambio de estado |
| GET/POST | `/api/work-orders/:id/checklist` | Checklist |
| POST | `/api/work-orders/:id/evidences` | Upload evidencia |

OpenAPI formal: después de aprobar spec v1.0.

---

## 12. Criterios de aceptación (muestra)

### AC-001 — Flujo feliz técnico

- **Given** OT en ASSIGNED con checklist y técnico autenticado  
- **When** completa ítems obligatorios, sube evidencias y envía a revisión  
- **Then** OT pasa a PENDING_REVIEW y existe AuditEvent

### AC-002 — Bloqueo por evidencias

- **Given** OT IN_PROGRESS sin fotos obligatorias  
- **When** técnico intenta enviar a revisión  
- **Then** error BR-001 y estado sin cambio

`[PENDIENTE]` — más AC según tus flujos reales.

---

## 13. Preguntas abiertas para el orquestador

Responde las que puedas; el resto en sesiones siguientes.

1. ¿Qué tipos de obra/intervención son los 3 más frecuentes?
2. ¿Qué documentos van siempre en el dossier (acta, fotos, planos, test report)?
3. ¿Quién firma o valida formalmente hoy?
4. ¿Un técnico lleva varias OT el mismo día?
5. ¿Hay materiales serializados que deban registrarse (aunque logística sea fase 2)?
6. ¿Qué debe ver el técnico **sin** internet? (define si ON_HOLD/offline es W)
7. ¿Supervisor necesita vista “mapa” o basta lista con dirección?
8. ¿Campos obligatorios de sitio: dirección, coordenadas, ID cliente, contacto en sitio?

---

## 14. Historial de versiones

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 0.1 | 2025-06-15 | Esqueleto inicial + placeholders |

**Próximo hito:** v0.2 con flujos reales + checklist tuyo + decisiones tech (ADR-0002).
