# ADR-0001: Spec-driven development

**Estado:** Aceptado  
**Fecha:** 2025-06-15  
**Decisores:** Orquestador + agente

## Contexto

Proyectos anteriores derivaron en "vibe coding": código sin contrato claro, difícil de escalar y de explicar en portfolio.

## Decisión

Todo desarrollo de aplicación sigue este orden:

1. Product brief y specs en `docs/specs/`.
2. Aprobación explícita del orquestador.
3. ADRs para decisiones de arquitectura no obvias.
4. Implementación acotada al spec aprobado.
5. Actualización de spec si el alcance cambia *(spec primero, luego código)*.

## Consecuencias

**Positivas**

- Transparencia para GitHub y entrevistas técnicas.
- Menor deuda por scope creep.
- Multi-agente puede trabajar en paralelo con contratos claros.

**Negativas**

- Más tiempo antes del primer pixel o endpoint.
- Requiere disciplina del orquestador para aprobar/rechazar specs.

## Fundamento (para el orquestador)

Un **spec** es el contrato entre negocio y código. No es documentación posterior: es el blueprint. En equipos maduros esto se acerca a **BDD** o **contract-first API**; aquí lo adaptamos a proyecto solo/ pequeño equipo con IA.
