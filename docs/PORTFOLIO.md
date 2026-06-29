# Portfolio — IntegraCom Hub

Texto listo para copiar en LinkedIn, CV o README personal.

---

## Una línea

Dashboard gerencial spec-driven para integradoras de comunicaciones: avance de obra × tiempo contractual, 20 sistemas hospitalarios, trencitos BICSI/TIA.

---

## Párrafo corto (LinkedIn / about)

Construí **IntegraCom Hub**, un demo de intranet gerencial para proyectos hospitalarios de comunicaciones. Cruza **avance real vs plazo contractual** con semáforo BIEN/ATENCIÓN/MAL, red de dependencias entre ~20 sistemas (SCE, telefonía, clínico…) y drill-down a metrados con fases binarias alineadas a BICSI/TIA.

Stack: **Next.js 15**, **TypeScript**, **Tailwind**, **Recharts**, monorepo **pnpm**, motor de negocio testeable en `packages/shared` (Vitest), documentación **spec-driven** (specs + ADRs). Roadmap: PostgreSQL/Prisma, import Excel, RBAC.

Repo: https://github.com/alexanderfigueroachiri-tech/comms-integrator-hub

---

## Bullets para CV

- Diseño spec-driven: user stories, criterios de aceptación y ADRs antes de implementar
- Motor de salud contractual (`progress-engine`) con 20 tests Vitest
- UI gerencial: Command Center, curva S, grafo de dependencias SVG, alertas en lenguaje natural
- Dominio real: metrados SCE 07.14 (6 fases), niveles/bloques/ambientes, riesgo heredado upstream
- Arquitectura modular: `apps/web` + `packages/shared` + `packages/database` (Prisma)

---

## Tags sugeridos

`Next.js` `TypeScript` `Tailwind CSS` `Recharts` `pnpm` `Vitest` `Prisma` `PostgreSQL` `spec-driven` `construction-tech` `healthcare-it` `portfolio`

---

## Demo local (para entrevista)

```bash
git clone https://github.com/alexanderfigueroachiri-tech/comms-integrator-hub.git
cd comms-integrator-hub
pnpm install && pnpm dev
```

Abre la URL que indique la terminal (3000 o 3001). No requiere base de datos.

---

## Próximo en el repo (cuando retomes)

1. Tests Playwright e2e (checklist en `docs/specs/03-avance-obra-tests.md`)
2. Paridad seed ↔ PostgreSQL (Neon o Docker)
3. Import Excel metrados (fase C)
