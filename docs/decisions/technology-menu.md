# Menú de decisiones tecnológicas

**Instrucciones para el orquestador:** responde con el código de cada bloque (ej. `A1, B2, C1, D3…`) o texto libre donde indique *Otro*. Con tus respuestas genero ADR-0002 y cierro el spec de campo.

**Leyenda de recomendación (portfolio + escalabilidad + curva de aprendizaje):**

- ⭐ = recomendado para este proyecto
- ○ = viable
- △ = posible pero con trade-offs

---

## A. Estructura del repositorio

| ID | Opción | Notas |
|----|--------|-------|
| **A1** ⭐ | Monorepo (pnpm workspaces + Turborepo) | Un repo, packages compartidos, CI unificado |
| **A2** ○ | Monorepo (npm workspaces sin Turborepo) | Más simple, builds manuales |
| **A3** △ | Polyrepo (web + api separados) | Más fricción para shared types |

**Tu elección:** `[ ]`

---

## B. Lenguaje y runtime

| ID | Opción | Notas |
|----|--------|-------|
| **B1** ⭐ | TypeScript end-to-end | Tipos compartidos, estándar en intranets modernas |
| **B2** ○ | TypeScript front + Python (FastAPI) API | Si prefieres Python en backend |
| **B3** △ | JavaScript sin tipos | No recomendado para spec-driven |

**Tu elección:** `[ ]`

---

## C. Framework frontend

| ID | Opción | Notas |
|----|--------|-------|
| **C1** ⭐ | Next.js 15 (App Router) | SSR, API routes, deploy fácil, buen CV |
| **C2** ○ | React (Vite) + API separada | Front más desacoplado |
| **C3** ○ | Nuxt 3 (Vue) | Si dominas Vue |
| **C4** △ | Angular | Más pesado para MVP solo |

**Tu elección:** `[ ]`

---

## D. Estilos y componentes UI

| ID | Opción | Notas |
|----|--------|-------|
| **D1** ⭐ | Tailwind CSS + shadcn/ui | Rápido, vistoso, customizable |
| **D2** ○ | Tailwind + Headless UI | Más control, más trabajo |
| **D3** ○ | MUI (Material) | Look corporativo estándar |
| **D4** ○ | Chakra UI | Buen DX React |

**Tu elección:** `[ ]`

---

## E. Backend / API

| ID | Opción | Notas |
|----|--------|-------|
| **E1** ⭐ | Next.js Route Handlers (monolito modular) | Menos piezas para MVP |
| **E2** ○ | NestJS en `apps/api` | Mejor si el equipo crece o API muy grande |
| **E3** ○ | tRPC | Tipos end-to-end; menos REST/OpenAPI estándar |
| **E4** ○ | FastAPI (Python) | Polyrepo o monorepo híbrido |

**Tu elección:** `[ ]`

---

## F. Base de datos

| ID | Opción | Notas |
|----|--------|-------|
| **F1** ⭐ | PostgreSQL | Relacional, JSONB, robusto para auditoría |
| **F2** ○ | MySQL / MariaDB | Viable si ya lo usas en producción |
| **F3** △ | SQLite (dev) + PostgreSQL (prod) | Solo dev local simplificado |
| **F4** △ | MongoDB | Peor encaje para relaciones OT–proyecto–dossier |

**Tu elección:** `[ ]`

---

## G. ORM / acceso a datos

| ID | Opción | Notas |
|----|--------|-------|
| **G1** ⭐ | Prisma | Migraciones claras, buen DX, schema legible |
| **G2** ○ | Drizzle | Más ligero, SQL-first |
| **G3** ○ | TypeORM | Común pero DX inferior a Prisma |
| **G4** △ | SQL raw + Kysely | Máximo control, más verboso |

**Tu elección:** `[ ]`

---

## H. Autenticación

| ID | Opción | Notas |
|----|--------|-------|
| **H1** ⭐ | Auth.js (NextAuth v5) + credenciales/OAuth | Open source, control total |
| **H2** ○ | Clerk | Rápido MVP; vendor lock-in |
| **H3** ○ | Lucia Auth | Ligero, manual |
| **H4** ○ | JWT custom | Solo si sabes endurecer seguridad |

**Tu elección:** `[ ]`

---

## I. Autorización (RBAC)

| ID | Opción | Notas |
|----|--------|-------|
| **I1** ⭐ | Roles en DB + middleware + guards por ruta | Simple, transparente |
| **I2** ○ | CASL (abilities) | Flexible para permisos finos |
| **I3** ○ | Permisos en JWT | Cuidado con revocación |

**Tu elección:** `[ ]`

---

## J. Almacenamiento de archivos (evidencias, dossier)

| ID | Opción | Notas |
|----|--------|-------|
| **J1** ⭐ | S3-compatible (MinIO local / Cloudflare R2 prod) | Estándar industria |
| **J2** ○ | Disco local (dev) + S3 (prod) | Abstracción por env |
| **J3** △ | Base64 en PostgreSQL | Solo prototipo; no escala |

**Tu elección:** `[ ]`

---

## K. Validación y contratos API

| ID | Opción | Notas |
|----|--------|-------|
| **K1** ⭐ | Zod + OpenAPI generado (o documentado) | Alineado con spec-driven |
| **K2** ○ | Zod solo | Sin OpenAPI público |
| **K3** ○ | class-validator (Nest) | Si eliges Nest |

**Tu elección:** `[ ]`

---

## L. Hosting / deploy (MVP demo)

| ID | Opción | Notas |
|----|--------|-------|
| **L1** ⭐ | Vercel (web) + Neon/Supabase (Postgres) | Gratis tier, GitHub CI |
| **L2** ○ | Railway (todo en uno) | Simple, pago según uso |
| **L3** ○ | VPS Hetzner + Docker Compose | Control total, más ops |
| **L4** ○ | Solo local + Docker hasta fase 2 | Cero costo cloud inicial |

**Tu elección:** `[ ]`

---

## M. Testing (MVP)

| ID | Opción | Notas |
|----|--------|-------|
| **M1** ⭐ | Vitest (unit) + Playwright (e2e crítico) | Flujo OT punta a punta |
| **M2** ○ | Vitest solo | Más rápido, menos confianza UI |
| **M3** ○ | Jest + Cypress | Stack clásico |

**Tu elección:** `[ ]`

---

## N. Experiencia móvil en campo

| ID | Opción | Notas |
|----|--------|-------|
| **N1** ⭐ | Web responsive + PWA ligera (instalable) | Alineado con product brief |
| **N2** ○ | Solo responsive | Sin offline |
| **N3** △ | React Native / Expo después | Fase 2, mismo backend |

**Tu elección:** `[ ]`

---

## O. Idioma de la UI y specs

| ID | Opción |
|----|--------|
| **O1** ⭐ | UI español; código y docs técnicos en inglés |
| **O2** | Todo en español |
| **O3** | Todo en inglés (GitHub internacional) |

**Tu elección:** `[ ]`

---

## P. Licencia open source

| ID | Opción |
|----|--------|
| **P1** ⭐ | MIT |
| **P2** | Apache 2.0 |
| **P3** | Propietaria (repo público solo demo) |

**Tu elección:** `[ ]`

---

## Paquete recomendado por defecto (si no quieres elegir pieza a pieza)

**Preset Portfolio ⭐:** `A1, B1, C1, D1, E1, F1, G1, H1, I1, J1, K1, L1, M1, N1, O1, P1`

Responde **"Preset Portfolio"** o lista tus excepciones (ej. `Preset Portfolio pero L4 y O2`).

---

## Registro de decisiones

| Fecha | Bloques elegidos | Notas |
|-------|------------------|-------|
| | | |
