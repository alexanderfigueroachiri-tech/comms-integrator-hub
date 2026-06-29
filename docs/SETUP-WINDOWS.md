# Setup en Windows

## Problema: `pnpm` no se reconoce

Node.js **sí está instalado** (`C:\Program Files\nodejs\`), pero a veces no aparece en el PATH de CMD/PowerShell hasta reiniciar la terminal o agregar las rutas manualmente.

## Solución rápida (esta sesión de CMD)

```cmd
set PATH=C:\Program Files\nodejs;%APPDATA%\npm;%PATH%
cd C:\Users\alexd\Projects\comms-integrator-hub
pnpm install
pnpm dev
```

Abre **http://localhost:3000**

## Si `pnpm` sigue sin existir

Instálalo una vez:

```cmd
set PATH=C:\Program Files\nodejs;%PATH%
npm install -g pnpm@9.15.0
set PATH=%APPDATA%\npm;%PATH%
pnpm -v
```

## PATH permanente (recomendado)

1. Win + R → `sysdm.cpl` → **Opciones avanzadas** → **Variables de entorno**
2. En **Path** del usuario, agregar:
   - `C:\Program Files\nodejs`
   - `%APPDATA%\npm`
3. Cerrar **todas** las ventanas de CMD/PowerShell y abrir una nueva.

## Comandos del proyecto

| Comando | Acción |
|---------|--------|
| `pnpm dev` | Servidor desarrollo |
| `pnpm build` | Build producción |
| `pnpm start` | Servir build |

## Verificar Node

```cmd
node -v
npm -v
pnpm -v
```

Deberías ver versiones (ej. Node v24.x, pnpm 9.x).
