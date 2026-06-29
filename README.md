# comms-integrator-hub

Intranet modular para integradoras de sistemas de comunicaciones — **vista gerencial de avance de obra**.

**Organización demo:** IntegraCom *(ficticia)*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Demo en vivo (local)

```bash
pnpm install
pnpm dev
# → http://localhost:3000
```

> Windows: si `pnpm` no se reconoce, ver [docs/SETUP-WINDOWS.md](docs/SETUP-WINDOWS.md)

## Qué muestra el demo

- **20 sistemas hospitalarios** (07 → 07.23) con fases configurables
- **SCE 07.14** con 6 fases binarias: Compat → Canalizado → Cableado → Ponchado → Plaqueado → Certificado
- **Red de dependencias** interactiva (SVG, no Mermaid)
- **Gráficos Recharts**: curva S, brecha por sistema
- **Motor de salud**: cruza avance real vs tiempo contractual → BIEN / ATENCIÓN / MAL
- **Metrados** con Nivel (1–5), Bloque (A–E), Ambiente

## Stack

Next.js 15 · TypeScript · Tailwind · Recharts · Monorepo pnpm

## Estructura

```
apps/web/              Dashboard gerencial
packages/shared/       Catálogo sistemas, motor de avance, seed demo
docs/specs/            Spec-driven (leer antes de codear)
docs/adr/              Decisiones de arquitectura
```

## Documentación clave

| Doc | Contenido |
|-----|-----------|
| [03-avance-obra-module.md](docs/specs/03-avance-obra-module.md) | Spec módulo avance de obra |
| [system-catalog.ts](packages/shared/src/system-catalog.ts) | 20 sistemas + fases + dependencias |
| [conventions.md](docs/conventions.md) | Tipos de valor: 1=ternario, 2=binario, 3=continuo |

## Roadmap

- [x] Demo gerencial v0.2 — 20 sistemas, gráficos, dependencias
- [ ] PostgreSQL + Prisma
- [ ] Import metrados Excel/CSV
- [ ] Residente actualiza fases (reemplaza Excel)
- [ ] Fichas técnicas · Valorización

## Licencia

MIT — ver [LICENSE](LICENSE)
