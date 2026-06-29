# Spec — Avance de Obra (Módulo gerencial)

**Versión:** 0.2 (demo IntegraCom)  
**Módulo:** `progress`  
**Estado:** Aprobado para demo — calibrar en producción por proyecto  
**Organización demo:** IntegraCom

---

## 1. Propósito

Dar **poder de decisión a gerencia** cruzando:

- Plazos del **contrato** (y cotización como referencia económica).
- **Avance real** por metrado y por fase del trencito.
- **Dependencias** entre fases (intra-sistema) y entre sistemas (inter-sistema).

> *"El reporte que habla solo"* — gerencia ve en segundos si **75 % de avance** es bueno o malo según **fecha contractual** y **cadena de dependencias**.

### 1.1 Demo vs producción

| Demo (GitHub) | Producción (cliente) |
|---------------|----------------------|
| 3–4 sistemas genéricos | ~20+ sistemas del hospital |
| 7 fases SCE cobre horizontal | Fases calibradas por spec técnica |
| Metrados seed (~12 salidas) | Excel 700+ filas importado |
| Fechas y % editables en config | Contrato + metrado real |
| Solo rol **GERENCIA** | RBAC completo |

**Principio:** demostrar **utilidad + customizabilidad**, sin asumir datos reales del escaneo 150 MB.

---

## 2. Glosario (distinciones obligatorias)

| Término | Qué es | MVP demo |
|---------|--------|----------|
| **Contrato** | Marco legal, plazos, penalidades | Fechas inicio/fin, % multa |
| **Cotización** | Precios y unidades por partida (*a mano alzada*) | Referenciada, no UI detallada |
| **Partida** | Código + ítem en **especificaciones técnicas** (qué se instala) | Ej. `7.14.3 CABLEADO HORIZONTAL CAT 6A` |
| **Ficha técnica** | Validación de que el **producto** cumple spec antes de obra | **Fuera de MVP UI** |
| **Cuadro de cumplimientos** | Producto vs requisito | **Fuera de MVP UI** |
| **Sistema** | Agrupación contractual (SCE, telefonía, DACI…) | 4 sistemas demo |
| **Metrado** | Unidad granular de avance (salida, tramo, punto) | Atributos + fases |
| **Fase / estado de avance** | Columna del antiguo Excel | Trencito configurable |
| **Trencito** | DAG de dependencias | Visual principal |

---

## 3. Actores MVP

| Rol | Alcance demo |
|-----|--------------|
| **GERENCIA** | Vista única: dashboards, trenes, alertas, drill-down metrados |

Sin residente, sin ingeniería, sin valorización automática en v0.2.

---

## 4. Sistemas demo (subset hospital)

Códigos alineados a carpetas reales del proyecto:

| Código | Sistema | Notas demo |
|--------|---------|------------|
| `07.14` | Cableado estructurado — horizontal cobre | **Foco principal** |
| `07` | Telefonía IP | Depende de SCE horizontal |
| `07.04` | Llamada a enfermeras | Depende de telefonía + SCE |
| `07.05` | DACI (incendios) | Parcialmente paralelo a canalización |

Otros (CCTV, acceso, etc.) — fase 2.

---

## 5. Sistema foco: SCE horizontal cobre (`07.14`)

### 5.1 Partidas (catálogo demo — no metrados)

Referencia visual del proyecto; no se trackea avance por partida de material en v0.2:

- `7.14.3` CABLEADO HORIZONTAL CATEGORIA 6A  
- `7.14.9` FACEPLATE SIMPLE  
- `7.14.10` FACEPLATE DOBLE  
- …

### 5.2 Metrado — atributos

| Atributo | Tipo | Ejemplo |
|----------|------|---------|
| `nivel` | string | Piso 2 |
| `bloque` | string | Bloque B |
| `ambiente` | string | Consultorio 204 |
| `rotulado` | string | ID TIA-606 (demo) |
| `salidaTipo` | enum | `SIMPLE` \| `DOBLE` |
| `codigo` | string | SCE-H-0042 |

### 5.3 Fases del trencito (orden fijo demo)

Alineadas a práctica BICSI/TIA (ver §8) y vocabulario de obra:

| Orden | Fase | Tipo (código) | Valores demo |
|-------|------|---------------|--------------|
| 1 | COMPATIBILIZACION | BINARY (2) | `NO` · `YES` |
| 2 | CANALIZADO | BINARY (2) | `NO` · `YES` |
| 3 | CABLEADO | BINARY (2) | `NO` · `YES` |
| 4 | PONCHADO | BINARY (2) | `NO` · `YES` |
| 5 | PLAQUEADO | BINARY (2) | `NO` · `YES` |
| 6 | CERTIFICADO | BINARY (2) | `NO` · `YES` |

**Codificación tipos:** 1=ternario · 2=binario · 3=continuo (metros, etc.)

**Regla BR-A01:** fase *n* no puede avanzar si fase *n−1* ≠ YES (binario).

**Regla BR-A02:** % sistema = promedio ponderado de metrados × fases (peso igual en demo).

---

## 6. Trencitos inter-sistema (demo)

```
[07.14 SCE Horizontal] ──► [07 Telefonía IP] ──► [07.04 Llamada enfermeras]
         │
         └──► (canalización compartida) ──► [07.05 DACI]  (parcial, 40% peso)
```

Gerencia ve: si SCE va mal, telefonía y enfermeras **heredan riesgo** (alerta cascada).

---

## 7. Motor de salud gerencial

### 7.1 Progreso programado (contrato)

```
scheduledPct = (hoy - inicioContrato) / (finContrato - inicioContrato) × 100
```

### 7.2 Progreso real (sistema)

```
actualPct = avg(metradoProgress)  // 0-100 por metrado según fases
```

### 7.3 Semáforo

| Condición | Estado | Mensaje tipo |
|-----------|--------|--------------|
| `actualPct >= scheduledPct` | 🟢 BIEN | "Avance acorde al contrato" |
| `actualPct >= scheduledPct - 10` | 🟡 ATENCIÓN | "Rezago leve — revisar trencito" |
| `actualPct < scheduledPct - 10` | 🔴 MAL | "Riesgo multa — X% avance vs Y% tiempo" |

**Ejemplo citado:** 75 % avance con 90 % tiempo consumido → 🔴 MAL.

### 7.4 Alertas automáticas (demo)

- **A1:** Sistema rezagado vs contrato.  
- **A2:** Fase bloqueada por dependencia intra-metado.  
- **A3:** Sistema downstream en riesgo por upstream.  
- **A4:** Días restantes < umbral y actualPct < 95 %.

---

## 8. Referencias internacionales (SCE)

| Estándar | Aplica a fase demo |
|----------|-------------------|
| **ANSI/BICSI N1** | Canalización, tendido, terminación, verificación |
| **BICSI ITSIMM** | Secuencia: pathways → pull → terminate → test |
| **ANSI/TIA-606-C** | Rotulado/administración (`ROTULADO`) |
| **Certificación** | Fluke/DSX — fase `CERTIFICADO` |

Sugerencia optimización: rotulado **antes** de certificar (TIA-606); compatibilización con otras disciplinas **antes** de canalizar (BICSI PM / coordination).

---

## 9. Pantallas MVP (solo gerencia)

| ID | Pantalla | Contenido |
|----|----------|-----------|
| G1 | **Command Center** | KPIs, alertas, timeline contrato |
| G2 | **Mapa de trenes** | DAG inter-sistema con semáforos |
| G3 | **Detalle sistema** | Trencito intra-sistema + % + fase cuello de botella |
| G4 | **Metrados** | Tabla filtrable (nivel, bloque, ambiente) |
| G5 | **Drill-down metrado** | 7 fases con estado actual |

**Fuera de MVP:** fichas técnicas, cotización editable, valorización.

---

## 10. Criterios de aceptación demo

### AC-D01 — Reporte que habla solo
- **Given** proyecto demo con contrato 180 días, día 120  
- **When** gerencia abre Command Center  
- **Then** ve semáforo global y mensaje en lenguaje natural (no solo %)

### AC-D02 — Trencito SCE
- **Given** sistema 07.14  
- **When** abre detalle  
- **Then** ve 6 fases en orden con nodo crítico resaltado

### AC-D03 — Dependencia cascada
- **Given** SCE en 🔴  
- **When** ve mapa de trenes  
- **Then** telefonía muestra badge "riesgo heredado"

---

## 11. Customizabilidad (producción)

Config JSON/YAML por proyecto (futuro `packages/config`):

```yaml
systems:
  - code: "07.14"
    phases:
      - id: COMPATIBILIZACION
        type: ternary
        dependsOn: []
```

Import metrados: CSV/Excel con mapeo de columnas — fase 2.

---

## 12. Historial

| Versión | Cambios |
|---------|---------|
| 0.2 | Spec demo gerencial + SCE + trenes + motor salud |
