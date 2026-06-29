# Spec — Modelo de datos (Core + Avance de obra)

**Versión:** 0.2  
**Estado:** Demo gerencial — alineado a `03-avance-obra-module.md`

---

## 1. Diagrama conceptual

```
Organization ──< Project ──< Contract
Project ──< System (07.14, 07, …)
System ──< PhaseDefinition (trencito configurable)
System ──< SystemDependency (DAG inter-sistema)
System ──< Metrado
Metrado ──< MetradoPhaseValue (valor por fase)
Project ──< Alert
```

**Diferido:** QuotationLine (cotización), TechnicalSheet (ficha técnica), WorkOrder (campo operativo).

---

## 2. Entidades demo

### Contract

| Campo | Tipo | Demo |
|-------|------|------|
| projectId | FK | |
| startDate | date | 2025-01-01 |
| endDate | date | 2025-06-30 |
| penaltyNote | string? | "Multa por retraso según cláusula X" |

### System

| Campo | Tipo | Demo |
|-------|------|------|
| projectId | FK | |
| code | string | `07.14` |
| name | string | SCE Horizontal Cobre |
| sortOrder | int | |

### PhaseDefinition

| Campo | Tipo | |
|-------|------|---|
| systemId | FK | |
| code | string | COMPATIBILIZACION |
| label | string | Compatibilización |
| sortOrder | int | 1-7 |
| valueType | enum | `BINARY` \| `TERNARY` \| `PERCENT` |

### SystemDependency

| Campo | Tipo | |
|-------|------|---|
| upstreamSystemId | FK | |
| downstreamSystemId | FK | |
| weight | float | 0-1 impacto |

### Metrado

| Campo | Tipo | |
|-------|------|---|
| systemId | FK | |
| code | string | SCE-H-0042 |
| nivel, bloque, ambiente, rotulado | string | |
| salidaTipo | enum | SIMPLE, DOBLE |

### MetradoPhaseValue

| Campo | Tipo | |
|-------|------|---|
| metradoId | FK | |
| phaseCode | string | |
| value | string/number | YES, DONE, 85… |

### Alert

| Campo | Tipo | |
|-------|------|---|
| projectId | FK | |
| severity | enum | INFO, WARNING, CRITICAL |
| code | string | A1, A2… |
| message | string | Lenguaje natural |
| systemId | FK? | |

---

## 3. Cálculos (packages/shared)

- `computeMetradoProgress(phases, values) → 0-100`
- `computeSystemProgress(metrados) → 0-100`
- `computeScheduledProgress(contract, today) → 0-100`
- `computeHealth(actual, scheduled) → good | warning | critical`
- `propagateDependencyRisk(systems, deps) → inherited flags`

Implementación en TypeScript puro — sin DB en demo v1 (JSON seed).

---

## 4. Seed demo

- 1 proyecto: Hospital Metropolitano Demo  
- 4 sistemas, 12 metrados SCE, fases parcialmente completas  
- Contrato 6 meses, "hoy" simulado en mes 5.5  
- 3–5 alertas generadas
