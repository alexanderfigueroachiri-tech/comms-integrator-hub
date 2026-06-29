# Product Brief — comms-integrator-hub

**Versión:** 0.2  
**Organización demo:** IntegraCom  
**Estado:** Secciones 4 y 5 aprobadas por orquestador (2025-06-15)

---

## 1. Problema

IntegraCom *(integradora ficticia de sistemas de comunicaciones)* coordina instalaciones en campo, documentación técnica (dossier) y seguimiento de proyectos con herramientas dispersas: hojas de cálculo, WhatsApp, carpetas en disco y correo.

Esto genera:

- Pérdida de trazabilidad en órdenes de trabajo (OT).
- Dossiers incompletos o tardíos.
- Supervisores sin visibilidad en tiempo real del estado en campo.
- Duplicación de esfuerzo entre producción, logística y administración.

## 2. Propuesta

Una **intranet modular** donde cada área opera en su módulo, compartiendo núcleo común: usuarios, proyectos, clientes, documentos y auditoría.

## 3. Usuarios v1 (MVP)

| Rol | Descripción |
|-----|-------------|
| **Técnico de campo** | Ejecuta OT, sube evidencias, cierra tareas en sitio |
| **Supervisor de producción** | Asigna OT, monitorea avance, valida cierre |
| **Administrador** | Usuarios, roles, configuración base |

*Fuera de MVP v1:* contador, logística, comercial, RR.HH.

## 4. Objetivos del MVP

- [ ] Login seguro con roles (RBAC).
- [ ] CRUD de proyectos y clientes (nivel básico).
- [ ] Flujo completo de OT de producción en campo (crear → asignar → ejecutar → evidencias → cerrar).
- [ ] Dossier digital asociado a OT/proyecto (archivos + estados).
- [ ] Bitácora de auditoría consultable.
- [ ] Dashboard mínimo por rol.

## 5. No-objetivos (MVP)

- Facturación, nómina, inventario completo.
- App móvil nativa *(web responsive primero; PWA opcional después)*.
- Multi-tenant *(una sola organización — IntegraCom demo)*.
- Integraciones ERP / GPS en tiempo real.
- IA o reportes avanzados.

## 6. Métricas de éxito (demo/portfolio)

- Un flujo de OT demostrable de punta a punta en entorno local o staging.
- Specs y ADRs publicados en GitHub.
- README que permita a un tercero entender arquitectura y levantar el proyecto.

## 7. Nombre ficticio — ¿qué impacto tiene?

| Aspecto | Impacto |
|---------|---------|
| **Legal / marca** | Ninguno si se documenta como organización demo genérica |
| **GitHub / CV** | Positivo: muestra dominio del sector sin exponer clientes reales |
| **Comercialización** | El producto es la plataforma; el branding es configurable por despliegue |
| **Reemplazo futuro** | Logo, colores y textos vía configuración; sin cambio de arquitectura |

## 8. Próximos documentos

1. `01-field-ops-module.md` — spec detallado Producción en Campo *(siguiente paso)*.
2. `02-data-model-core.md` — entidades compartidas.
3. ADR-0002 — stack tecnológico.
4. ADR-0003 — estrategia de worktrees.

---

**Orquestador:** secciones 4 y 5 aprobadas. Spec de campo en `01-field-ops-module.md`.
