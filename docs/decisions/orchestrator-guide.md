# Guía del orquestador

Cómo guiarme de la mejor manera para que el proyecto escale sin caer en vibe coding.

---

## Tu rol en una frase

**Tú defines el qué y el porqué del negocio; yo propongo el cómo técnico y lo documento en specs/ADRs hasta que apruebes.**

---

## Formas efectivas de darme contexto

### 1. Historias de campo (las mejores)

Formato ideal:

> **Situación:** En sitio, el técnico termina la instalación del radio.  
> **Hoy:** Manda fotos por WhatsApp y el supervisor las pierde.  
> **Quiero:** Subir fotos a la OT, marcar checklist, y que el supervisor vea “pendiente validación” sin llamar.  
> **Excepción:** Si falta una foto obligatoria, no debe poder cerrar la OT.

Eso se convierte en flujo, reglas BR-00x y criterios de aceptación.

### 2. Decisiones binarias rápidas

Usa el menú `technology-menu.md`:

```
Preset Portfolio pero L4 (solo local) y O2 (todo español)
```

### 3. Referencias sin copiar

> “Similar al tablero de Monday pero solo columnas: Asignado / En campo / Cerrado”  
> “El dossier como una carpeta con estados: borrador → enviado → aprobado”

### 4. Límites explícitos

> “En MVP no quiero mapa GPS, solo dirección de texto”  
> “Máximo 5 fotos por OT en demo”

Los **no-objetivos** evitan scope creep.

### 5. Prioridad MoSCoW por bloque

Cuando el spec crezca, marca:

- **M** — Must have  
- **S** — Should have  
- **C** — Could have  
- **W** — Won’t have (esta fase)

---

## Menú de opciones — qué puedes pedir en cada mensaje

Elige una o combina (ej. *“3 + 6 + contexto de checklist”*):

| # | Opción | Qué obtienes |
|---|--------|--------------|
| **1** | Cerrar decisiones tech | ADR-0002 con tu selección del menú |
| **2** | Profundizar flujo OT | Pasos detallados + estados + permisos |
| **3** | Definir checklist de instalación | Ítems, obligatorios/opcionales, por tipo de obra |
| **4** | Modelar dossier | Tipos de documento, estados, quién aprueba |
| **5** | Matriz rol × permiso | Tabla técnico / supervisor / admin |
| **6** | Diagrama de estados | Máquina de estados OT y dossier |
| **7** | Entidades y campos | Borrador `02-data-model-core.md` |
| **8** | Mockups en texto | Wireframes ASCII o descripción pantalla por pantalla |
| **9** | Casos borde | Sin señal, OT cancelada, reasignación, rechazo supervisor |
| **10** | Estrategia worktrees | ADR-0003 + comandos git concretos |
| **11** | Revisar / aprobar spec | Cierro versión y marco listo para código |
| **12** | Preguntas que te hago a ti | Cuestionario corto cuando falte tu experiencia de campo |

---

## Ritmo de trabajo sugerido (sesiones)

```
Sesión A — Tech stack (menú) + convenciones ✅
Sesión B — Flujo OT completo con tu contexto real
Sesión C — Checklist + evidencias + dossier
Sesión D — Datos + permisos + casos borde
Sesión E — Aprobación spec v1.0 → ADRs → scaffold código
```

No saltamos a código hasta **11** con spec v1.0 aprobado.

---

## Plantilla de mensaje (copia y rellena)

```markdown
## Opciones elegidas
- Menú orquestador: 2, 3, 6
- Tech: Preset Portfolio (o lista A–P)

## Contexto de negocio
[Historia de campo o proceso actual]

## Quiero que se comporte así
[Comportamiento esperado]

## No quiero en esta fase
[Límites]

## Preguntas para ti
[Opcional]
```

---

## Señales de que vamos bien

- Cada feature nueva tiene número de regla (BR-xxx) o criterio de aceptación.
- Sabes explicar en una frase qué hace cada rol en la OT.
- Las tecnologías tienen ADR con *por qué*.
- Tú puedes decir “eso es W” y lo sacamos del MVP sin drama.

---

## Señales de alerta (frenar)

- “Implementa ya y vemos” → volvemos al spec.
- Dos módulos mezclados en un flujo → separamos bounded contexts.
- Función “por si acaso” sin actor ni flujo → Won’t have.
