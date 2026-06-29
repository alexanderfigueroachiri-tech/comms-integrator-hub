<p align="center">
  <strong>comms-integrator-hub</strong><br/>
  Intranet modular para integradoras de sistemas de comunicaciones
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://github.com/alexanderfigueroachiri-tech/comms-integrator-hub"><img src="https://img.shields.io/github/stars/alexanderfigueroachiri-tech/comms-integrator-hub?style=social" alt="GitHub" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript&logoColor=white" alt="TypeScript" /></a>
</p>

---

Plataforma de **control gerencial de avance de obra** para proyectos hospitalarios y telecom. Reemplaza el Excel del residente por trazabilidad auditable, **trencitos de dependencia** entre sistemas y un motor que responde: *¿75 % de avance estamos bien o mal?* — según el **tiempo contractual**.

Organización demo: **IntegraCom** (ficticia, sin datos reales de clientes).

## Capturas

| Command Center | Detalle SCE 07.14 |
|----------------|-------------------|
| ![Command Center](docs/screenshots/command-center.png) | ![SCE 07.14](docs/screenshots/sce-07-14.png) |
| KPIs, curva S, alertas, matriz 20 sistemas | Trencito 6 fases + tabla metrados |

Texto para LinkedIn/CV: [docs/PORTFOLIO.md](docs/PORTFOLIO.md)

## Problema que resuelve

Las integradoras de comunicaciones gestionan ~20 sistemas por obra (SCE, telefonía, DACI, HIS…) con:

- Metrados de cientos de filas en Excel
- Avance reportado por WhatsApp / correo
- Gerencia sin cruce **avance real × plazo × dependencias**
- Riesgo de penalidades por rezago invisible

Este demo muestra la **capa de decisión gerencial** — extensible a residente, fichas técnicas y valorización.

## Quick start

**Requisitos:** Node.js 20+, pnpm 9+

```bash
git clone https://github.com/alexanderfigueroachiri-tech/comms-integrator-hub.git
cd comms-integrator-hub
pnpm install
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000)

<details>
<summary>Página sin estilos (texto plano, links azules)</summary>

Suele ser un **servidor viejo** en el puerto 3000: HTML carga pero el CSS devuelve 404.

```powershell
# Windows — ver qué proceso usa el puerto 3000
netstat -ano | findstr ":3000"
# Matar el PID (ej. 26032) y reiniciar
Stop-Process -Id <PID> -Force
pnpm dev
```

Confirma en la terminal la URL exacta (`Local: http://localhost:3000`). Si Next.js usa **3001**, abre esa URL.

</details>

<details>
<summary>PostgreSQL opcional (fase B) — error <code>DATABASE_URL not found</code></summary>

La demo **no necesita DB** (`CIH_DATA_SOURCE=seed` por defecto). Solo si quieres persistencia:

```cmd
copy .env.example .env
pnpm db:up
pnpm db:push
pnpm db:seed
```

El `.env` va en la **raíz del repo**. Los scripts Prisma lo leen desde ahí.

Para usar la DB en la app: `CIH_DATA_SOURCE=db` en `.env` y reinicia `pnpm dev`.

Sin Docker: pon tu URL de Neon/Supabase en `DATABASE_URL`.

</details>

<details>
<summary>Windows — <code>pnpm</code> no reconocido</summary>

```cmd
set PATH=C:\Program Files\nodejs;%APPDATA%\npm;%PATH%
npm install -g pnpm@9.15.0
```

Guía completa: [docs/SETUP-WINDOWS.md](docs/SETUP-WINDOWS.md)

</details>

```bash
pnpm build   # build producción
pnpm start   # servir build
```

## Funcionalidades (demo v0.2)

- **20 sistemas** catalogados (`07` → `07.23`) con fases configurables por rubro (BICSI / NFPA / TIA)
- **SCE 07.14** — cableado estructurado horizontal: 6 fases binarias  
  `Compatibilización → Canalizado → Cableado → Ponchado → Plaqueado → Certificado`
- **Metrados** con atributos: Nivel (1–5), Bloque (A–E), Ambiente, tipo salida
- **Red de dependencias** interactiva (SVG) — hover resalta cadena, clic abre detalle
- **Gráficos Recharts** — curva S (avance vs tiempo), ranking de brechas
- **Motor de salud** — semáforo BIEN / ATENCIÓN / MAL + alertas en lenguaje natural
- **Tipos de valor extensibles:** `1` ternario · `2` binario · `3` continuo (metros)

## Arquitectura

```
comms-integrator-hub/
├── apps/web/                 # Next.js 15 — dashboard gerencial
├── packages/shared/          # Catálogo, motor de avance, seed demo
│   ├── system-catalog.ts     # 20 sistemas + dependencias
│   └── progress-engine.ts    # Cálculo salud contractual
├── packages/database/        # Prisma schema + seed (fase B, opcional)
└── docs/
    ├── specs/                # Spec-driven (contrato antes de código)
    └── adr/                  # Architecture Decision Records
```

Metodología: **spec-driven development** · monorepo pnpm · ver [AGENTS.md](AGENTS.md) para roles multi-agente.

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 15, React 19, Tailwind CSS |
| Gráficos | Recharts |
| Shared | TypeScript puro (motor de negocio testeable) |
| Tooling | pnpm workspaces, ESLint |

Roadmap: import CSV/Excel, auth RBAC, deploy Vercel. PostgreSQL + Prisma scaffold listo (opcional).

## Documentación

| Documento | Descripción |
|-----------|-------------|
| [docs/specs/03-avance-obra-module.md](docs/specs/03-avance-obra-module.md) | Spec módulo avance de obra |
| [docs/specs/00-product-brief.md](docs/specs/00-product-brief.md) | Visión y MVP |
| [docs/conventions.md](docs/conventions.md) | Convenciones y universalidades |
| [docs/adr/](docs/adr/) | Decisiones de arquitectura |
| [AGENTS.md](AGENTS.md) | Orquestación multi-agente (spec, QA, arquitecto, reviewer) |
| [docs/GITHUB-SETUP.md](docs/GITHUB-SETUP.md) | Configurar GitHub + permisos del agente |

## Roadmap

- [x] Demo gerencial v0.2 — 20 sistemas, Recharts, dependencias SVG
- [x] Spec + ADRs + LICENSE MIT + capturas portfolio
- [x] Tests Vitest motor de salud (20 tests)
- [x] Scaffold PostgreSQL + Prisma (`packages/database`, opcional)
- [ ] Playwright e2e
- [ ] Import metrados desde Excel/CSV
- [ ] Rol residente (actualización en campo)
- [ ] Fichas técnicas · Valorización

## Contribuir

1. Lee el spec del módulo que vas a tocar (`docs/specs/`).
2. Sigue [docs/conventions.md](docs/conventions.md).
3. No incluyas `.env`, credenciales ni datos reales de clientes.

## Licencia

[MIT](LICENSE) — uso comercial permitido. IntegraCom es marca demo; reemplaza branding por despliegue.

## Autor

Proyecto portfolio — integración de sistemas de comunicaciones en entorno hospitalario.  
Desarrollado con enfoque spec-driven y arquitectura modular extensible a producción.
