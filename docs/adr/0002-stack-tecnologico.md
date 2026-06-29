# ADR-0002: Stack tecnológico (Preset Portfolio)

**Estado:** Aceptado  
**Fecha:** 2025-06-15  
**Decisor:** Orquestador  
**Referencia:** [technology-menu.md](../decisions/technology-menu.md)

## Contexto

El MVP debe ser publicable en GitHub, escalable a más módulos, y con curva de aprendizaje razonable para un orquestador que construye mientras aprende.

## Decisión

Adoptar **Preset Portfolio**:

| Bloque | Elección | Tecnología |
|--------|----------|------------|
| A | A1 | Monorepo pnpm + Turborepo |
| B | B1 | TypeScript end-to-end |
| C | C1 | Next.js 15 (App Router) |
| D | D1 | Tailwind CSS + shadcn/ui |
| E | E1 | Next.js Route Handlers (API en mismo app) |
| F | F1 | PostgreSQL |
| G | G1 | Prisma |
| H | H1 | Auth.js (v5) |
| I | I1 | RBAC en DB + middleware |
| J | J1 | S3-compatible (MinIO local / R2 o S3 prod) |
| K | K1 | Zod + OpenAPI documentado |
| L | L1 | Vercel + Neon/Supabase (Postgres) |
| M | M1 | Vitest + Playwright (flujo crítico) |
| N | N1 | Web responsive + PWA ligera |
| O | O1 | UI español; código/docs técnicos inglés |
| P | P1 | Licencia MIT |

## Consecuencias

**Positivas**

- Un solo lenguaje (TS) y tipos compartidos en `packages/shared`.
- Deploy y portfolio alineados con estándar industria 2024–2025.
- Prisma + PostgreSQL facilitan relaciones OT–proyecto–auditoría.

**Negativas / riesgos**

- Next.js monolito puede crecer; si la API explota, evaluar extraer NestJS (ADR futuro).
- Auth.js requiere configuración cuidadosa de sesiones y CSRF.

## Fundamento (pedagógico)

- **Monorepo:** un repositorio, varios paquetes (`apps/web`, `packages/database`). Evita duplicar tipos entre front y back.
- **Next.js App Router:** carpetas = rutas; Server Components reducen JS al cliente; Route Handlers = API REST sin otro servidor.
- **Prisma:** el schema es la fuente de verdad de tablas; migraciones versionadas como el código.
- **RBAC en DB:** el rol vive en la base; cada request comprueba permisos en servidor, no solo en la UI.

## Pendiente

- ADR-0003: estrategia de worktrees (tras scaffold inicial).
- Scaffold de código solo tras aprobar `01-field-ops-module.md` v1.0.
