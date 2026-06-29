# ADR-0003: Demo gerencial primero (avance de obra)

**Estado:** Aceptado  
**Fecha:** 2025-06-15

## Contexto

El orquestador aportó dominio real: metrados, fases heterogéneas, trencitos, cotización, fichas técnicas. Para demo GitHub con &lt;2h, priorizar **valor gerencial visible** (cruces tiempo×avance, alertas) sobre OT operativas o fichas técnicas.

## Decisión

1. MVP demo = módulo **Avance de Obra** (`03-avance-obra-module.md`).
2. Rol único: **GERENCIA** (sin auth en demo v0.1).
3. Datos en `@cih/shared` seed JSON/TS — sin PostgreSQL hasta fase siguiente.
4. SCE horizontal cobre como sistema ancla; 3 sistemas satélite.
5. Fichas técnicas y valorización: explícitamente **fuera** de UI demo.

## Consecuencias

- Portfolio muestra dominio de negocio + visualización + arquitectura modular.
- Producción requerirá: import Excel 700 filas, config fases YAML, Prisma, RBAC.
