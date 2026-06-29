# Diagramas — Trencitos de dependencia

**Proyecto demo:** Hospital IntegraCom  
**Spec:** [03-avance-obra-module.md](../specs/03-avance-obra-module.md)

---

## 1. Inter-sistema (vista gerencia)

```mermaid
flowchart LR
    subgraph Infraestructura
        SCE["07.14 SCE Horizontal Cobre"]
    end

    subgraph Comunicaciones
        TEL["07 Telefonía IP"]
        ENF["07.04 Llamada enfermeras"]
    end

    subgraph Seguridad
        DACI["07.05 DACI"]
    end

    SCE -->|"100% peso"| TEL
    TEL -->|"100% peso"| ENF
    SCE -.->|"40% peso canalización"| DACI

    style SCE fill:#ef4444,color:#fff
    style TEL fill:#eab308,color:#000
    style ENF fill:#22c55e,color:#fff
    style DACI fill:#22c55e,color:#fff
```

**Leyenda demo (estado en seed):**
- 🔴 SCE — rezagado vs contrato (cuello de botella)
- 🟡 Telefonía — atención por upstream
- 🟢 Enfermeras / DACI — ok relativo (dependen parcialmente de SCE)

---

## 2. Intra-sistema — SCE horizontal cobre (7 fases)

```mermaid
flowchart LR
    C1[COMPATIBILIZACION] --> C2[CANALIZADO]
    C2 --> C3[CABLEADO]
    C3 --> C4[ROTULADO]
    C4 --> C5[PLAQUEADO]
    C5 --> C6[PATCH CORD]
    C6 --> C7[CERTIFICADO]

    style C1 fill:#22c55e,color:#fff
    style C2 fill:#22c55e,color:#fff
    style C3 fill:#eab308,color:#000
    style C4 fill:#ef4444,color:#fff
    style C5 fill:#94a3b8,color:#000
    style C6 fill:#94a3b8,color:#000
    style C7 fill:#94a3b8,color:#000
```

**Lectura gerencial:** cuello de botella en **ROTULADO** (muchas salidas sin rotular bloquean certificación aguas abajo).

---

## 3. Cruce tiempo × avance (concepto)

```mermaid
xychart-beta
    title "Avance vs Tiempo contractual — SCE 07.14"
    x-axis "Mes del proyecto" [1, 2, 3, 4, 5, 6]
    y-axis "Porcentaje" 0 --> 100
    line "Programado (contrato)" [17, 33, 50, 67, 83, 100]
    line "Real (avance obra)" [15, 28, 42, 58, 75, 75]
```

**Día equivalente ~5.5:** 75 % avance vs ~92 % tiempo → 🔴 MAL (penalidad).

---

## 4. Flujo de datos (demo)

```mermaid
flowchart TB
    CON[Contrato + fechas] --> ENG[Motor de salud]
    MET[Metrados + fases] --> ENG
    DEP[Dependencias trencito] --> ENG
    ENG --> DASH[Command Center]
    ENG --> ALT[Alertas]
    ENG --> TRN[Visual trenes]
```

---

## 5. Ficha técnica vs avance (alcance)

```mermaid
flowchart LR
    PART[Partida en spec técnica] -.->|"futuro"| FT[Ficha técnica]
    FT -.->|"libera obra"| MET[Metrado / avance]
    MET --> VAL[Valorización]

    style FT fill:#334155,color:#fff,stroke-dasharray: 5 5
    style VAL fill:#334155,color:#fff,stroke-dasharray: 5 5
```

**MVP implementa solo** bloque central (metrado → avance → visualización).
