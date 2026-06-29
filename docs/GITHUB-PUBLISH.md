# Publicar en GitHub

## Qué se sube (verificado)

Solo código fuente, docs y lockfile. **No** se incluyen:

- `node_modules/`, `.next/`, builds
- `.env`, credenciales, bases de datos locales
- Datos reales de clientes (solo seed demo IntegraCom)

## Pasos (una vez)

### 1. Autenticarse en GitHub CLI

```cmd
gh auth login
```

Elige: GitHub.com → HTTPS → Login with browser.

### 2. Crear repo y push

Desde la raíz del proyecto:

```cmd
cd C:\Users\alexd\Projects\comms-integrator-hub
gh repo create comms-integrator-hub --public --source=. --remote=origin --description "Intranet gerencial de avance de obra para integradoras de comunicaciones" --push
```

Si el repo ya existe en tu cuenta:

```cmd
git remote add origin https://github.com/TU_USUARIO/comms-integrator-hub.git
git branch -M main
git push -u origin main
```

### 3. Actualizar README

Reemplaza `TU_USUARIO` en el clone URL del README con tu usuario real de GitHub.

## CI

Tras el push, GitHub Actions ejecutará build automático (`.github/workflows/ci.yml`).
