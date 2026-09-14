# Scripts de automatización (`scripts/`)

Tres scripts de bash cubren el ciclo de vida completo del entorno Docker del
proyecto: instalación inicial, arranque diario y limpieza total. Todos
resuelven la raíz del repositorio automáticamente (a partir de su propia
ubicación), así que pueden invocarse desde cualquier directorio:

```bash
./scripts/setup.sh
./scripts/run.sh
./scripts/clear.sh
```

## `setup.sh` — instalación desde cero

Prepara el proyecto por completo, incluso en una máquina donde todavía no
existe el repositorio local.

1. **Clona el repositorio si hace falta.** Si el script se ejecuta dentro de
   una copia ya clonada, la reutiliza. Si no encuentra el proyecto (por
   ejemplo, al ejecutarse de forma remota), clona
   `https://github.com/ArcGabicho/sistema-cms-ibgroup.git` en
   `./sistema-cms-ibgroup`. Esto permite bootstrapear una máquina nueva con
   una sola línea:

   ```bash
   curl -fsSL https://raw.githubusercontent.com/ArcGabicho/sistema-cms-ibgroup/master/scripts/setup.sh | bash
   ```

2. **Crea `.env` en la raíz** a partir de `.env.example`, si todavía no
   existe. Si `openssl` está disponible, genera automáticamente una
   `JWT_KEY` y un `APP_DB_PASSWORD` únicos para esa instalación (nunca
   reutiliza los del ejemplo). El resto de valores (contraseña de `sa`,
   usuario admin) se copian tal cual desde `.env.example` — revísalos antes
   de exponer el entorno fuera de tu máquina.

3. **Instala dependencias locales**, solo útiles para trabajar fuera de
   Docker (linting, `dotnet ef`, etc. — los contenedores instalan las suyas
   de forma independiente):
   - `npm install` en `core/client`, si `npm` está disponible.
   - `dotnet restore` en `core/server`, si `dotnet` está disponible.
   - Si alguna herramienta no está instalada, el script continúa e imprime
     un aviso; no es necesaria para levantar el stack con Docker.

4. **Construye las imágenes sin caché** (`docker compose build --no-cache`)
   y **levanta los contenedores** (`docker compose up -d`), dejando el
   entorno funcionando en `http://localhost:3000` (frontend) y
   `http://localhost:8080` (backend).

Ejecútalo la primera vez que trabajes en el proyecto, o cuando quieras
reconstruir todo desde cero (por ejemplo, después de `clear.sh`).

## `run.sh` — arranque local del día a día

Levanta el stack ya construido, sin reconstruir imágenes:

```bash
./scripts/run.sh          # docker compose up -d
./scripts/run.sh --build  # reconstruye imágenes antes de levantar
```

Falla con un mensaje claro si no encuentra `.env` en la raíz (te pide correr
`setup.sh` primero). Al terminar, imprime las URLs del backend y frontend, y
el estado (`ps`) de los contenedores.

Usa `--build` después de modificar un `Dockerfile`, `package.json` o
`server.csproj`, para que los cambios se reflejen en las imágenes.

## `clear.sh` — limpieza total (destructivo)

Elimina **todo lo creado por este proyecto**: contenedores, imágenes
(incluida la de SQL Server) y volúmenes con nombre — esto último borra los
datos de la base de datos de forma permanente. Equivale a:

```bash
docker compose -f docker/docker-compose.yml --env-file .env \
  down --volumes --rmi all --remove-orphans
```

Por ser irreversible, pide confirmación interactiva antes de ejecutarse:

```bash
./scripts/clear.sh
# Esto eliminará los contenedores, imágenes y volúmenes de este proyecto,
# incluyendo los datos de la base de datos SQL Server. No se puede deshacer.
# ¿Continuar? [y/N]
```

Para uso no interactivo (CI, scripts encadenados), omite la confirmación con
`-y` o `--yes`:

```bash
./scripts/clear.sh --yes
```

El script solo toca los recursos definidos en
`docker/docker-compose.yml` (contenedores, imágenes y volúmenes de este
proyecto) — nunca ejecuta una limpieza global de Docker (`docker system
prune`), así que no afecta a otros proyectos que corran en la misma máquina.

## Flujo típico

```bash
./scripts/setup.sh   # una vez, o tras un clear.sh
./scripts/run.sh      # cada vez que quieras trabajar
# ...
./scripts/clear.sh    # cuando quieras empezar de cero
```
