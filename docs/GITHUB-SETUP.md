# Configuración GitHub + agente (Cursor)

Repo: **https://github.com/alexanderfigueroachiri-tech/comms-integrator-hub**

---

## Qué necesito el agente en futuras sesiones

| Dato | Dónde está / cómo darlo |
|------|-------------------------|
| **Ruta del proyecto** | `C:\Users\alexd\Projects\comms-integrator-hub` — abrir esta carpeta como workspace en Cursor |
| **Repo remoto** | Ya configurado: `origin` → GitHub arriba |
| **Contexto de negocio** | Tus mensajes + `docs/specs/` |
| **Prioridad** | Tú (orquestador) — qué agente activar: spec, QA, arquitecto, etc. |
| **No hace falta** | Subir PDFs de 150 MB; tokens de producción en el chat |

Opcional pero útil:

- Capturas en `docs/screenshots/` para el README
- Excel anonimizado (5–10 filas) para calibrar metrados

---

## Cómo darme permiso para editar y subir a GitHub

### 1. Editar código (local)

- Abre el proyecto **comms-integrator-hub** como workspace (no Home).
- En Cursor, cuando el agente pida permisos de **escritura** o **red**, aprueba.
- Regla tuya: solo pide commit/push cuando quieras — dilo explícito: *"commit y push"*.

### 2. Push a GitHub (autenticación — una vez)

El agente **no puede** usar tu cuenta GitHub sin credenciales en **tu** máquina.

**Opción A — GitHub CLI (recomendada)**

```cmd
gh auth login
```

Elige: GitHub.com → HTTPS → Login with browser.

Verifica:

```cmd
gh auth status
```

**Opción B — Git Credential Manager**

Al hacer el primer `git push`, Windows puede abrir login de GitHub. Guarda credenciales.

**Opción C — Token personal (avanzado)**

1. GitHub → Settings → Developer settings → Personal access tokens  
2. Permisos: `repo`  
3. **No pegues el token en el chat.** Configúralo solo en tu terminal:

```cmd
gh auth login --with-token
```

(pega el token en la terminal local, no en Cursor)

### 3. Permisos del agente en Cursor

Cuando ejecute `git push` o `gh`:

- Aprueba **git_write** si pide modificar git.
- Aprueba **full_network** / **all** si el sandbox bloquea push.

Frase útil: *"Tienes permiso para commit y push a origin"*.

---

## Remote ya configurado

```bash
git remote add origin https://github.com/alexanderfigueroachiri-tech/comms-integrator-hub.git
git push -u origin master
```

(Si GitHub creó el repo con rama `main` vacía, puede hacer falta `git pull origin main --allow-unrelated-histories` antes del push, o push directo si está vacío.)

---

## Trabajo en paralelo (multi-agente)

Sí — desde **este chat** el orquestador puede pedir:

> "Lanza en paralelo: QA (tests Vitest), Arquitecto (ADR Prisma), Revisor (deuda técnica)"

El agente principal lanza sub-tareas y sintetiza resultados. Tú sigues aprobando specs y merges.

Ver roles y prompts: [AGENTS.md](../AGENTS.md)

---

## Checklist primera vez

- [ ] `gh auth login` completado
- [ ] Workspace = carpeta `comms-integrator-hub`
- [ ] `git push -u origin master` exitoso
- [ ] Actions verde en GitHub (pestaña Actions)
