# Sistema CMS de IBGroup — Visión general

Monorepo con dos aplicaciones independientes bajo `core/`:

- **`core/client`** — sitio público de IBOutplacement (marketing, formularios de
  contacto) y el panel de administración (`/dashboard`), construidos con
  Next.js.
- **`core/server`** — API REST en ASP.NET Core que persiste todo en SQL
  Server vía Entity Framework Core: usuarios, posts de blog y consultas de
  contacto.

Para levantar ambos con Docker, ver [`docker-guide.md`](./docker-guide.md) y
[`bash-scripts-guide.md`](./bash-scripts-guide.md) (`scripts/setup.sh`,
`run.sh`, `clear.sh`).

## Cómo se conectan

El navegador **nunca** llama directamente al backend (`core/server`). Todo
pasa por `core/client`, que actúa como *backend-for-frontend*:

```
Navegador → Next.js (Route Handlers en app/api/**) → ASP.NET Core (core/server) → SQL Server
```

- El login (`POST /api/auth/login`) hace que el backend emita un JWT; el
  Route Handler de Next.js lo guarda como cookie **httpOnly** (`ib_auth_token`)
  — el JavaScript del navegador nunca tiene acceso al token.
- En cada request posterior, los Server Components y Route Handlers de
  Next.js leen esa cookie y reenvían el JWT como `Authorization: Bearer` al
  backend.
- Como el backend solo recibe tráfico servidor-a-servidor, no necesita CORS.
- Rutas protegidas del dashboard (p. ej. `/dashboard/usuarios`) se validan
  dos veces: el layout del dashboard exige una sesión válida, y el propio
  backend vuelve a exigir el rol correcto (`[Authorize(Roles = "Admin")]`) —
  la protección real vive en el backend, no solo en la UI.
- `BACKEND_URL` (env var de `core/client`) apunta al backend: `http://server:8080`
  dentro de Docker Compose, `http://localhost:8080` en desarrollo local.

## `core/client` — Next.js (App Router)

Next.js 16, React 19, TypeScript, Tailwind CSS 4. Formularios con
`react-hook-form` + `zod`; notificaciones con `sileo` (Toaster montado en
`app/layout.tsx`).

### Estructura de rutas (`app/`)

| Ruta | Grupo | Descripción |
| --- | --- | --- |
| `app/(site)/` | Sitio público | Home, `/servicios`, `/blog`, `/aliados`, `/calculadora`, `/contactenos`, `/estadisticas`, `/preguntas`, `/transparencia`. Contenido en gran parte estático (`app/lib/*-data.ts`). |
| `app/(auth)/ingresar` | Login | Página de ingreso al panel. |
| `app/dashboard/` | Panel admin | Protegido por `app/dashboard/layout.tsx` (redirige a `/ingresar` si no hay sesión válida). Sidebar persistente (`components/dashboard/Sidebar.tsx`); solo el contenido de cada módulo se recarga. |
| `app/api/` | Route Handlers | Puente autenticado/anónimo hacia el backend (ver tabla de módulos). |

### Módulos del dashboard

| Módulo | Ruta | Componente | Qué hace |
| --- | --- | --- | --- |
| Inicio | `/dashboard` | `dashboard/page.tsx` | Resumen de la cuenta activa. |
| Blog | `/dashboard/blog` | `BlogModule.tsx` | CRUD completo de posts (crear, editar, publicar/despublicar, eliminar). |
| Clientes | `/dashboard/clientes` | `ClientsModule.tsx` | Lista + detalle de las consultas recibidas por los formularios de contacto del sitio; permite eliminarlas. |
| Analíticas | `/dashboard/analiticas` | `RealAnalytics.tsx` | Métricas reales desde el backend: usuarios, posts totales/publicados/borrador, posts por mes. |
| Automatización IA | `/dashboard/automatizacion-ia` | `AiDraftGenerator.tsx` | Genera un borrador de post con IA (Anthropic) a partir de un tema; el borrador se guarda sin publicar en el módulo Blog. |
| Usuarios | `/dashboard/usuarios` | `UsersModule.tsx` | **Solo rol Admin.** Crea nuevos usuarios del panel (Admin o Editor) y lista los existentes. |

### Formularios públicos

`PersonasForm.tsx` y `EmpresasForm.tsx` (pestañas dentro de
`components/sections/Contact.tsx`, reutilizado en Home, `/servicios` y
`/contactenos`) validan con `zod` (`app/lib/validations/contact.ts`) y envían
a `POST /api/contact`, que reenvía al backend y guarda la consulta en la
tabla `ContactSubmissions` — visible luego en el módulo Clientes.

### Rutas de API relevantes (`app/api/`)

| Ruta | Auth | Reenvía a (backend) |
| --- | --- | --- |
| `POST /api/auth/login`, `POST /api/auth/logout` | — | `/api/auth/login` (emite/guarda la cookie JWT) |
| `POST /api/contact` | Anónimo | `POST /api/contact` |
| `POST /api/users` | Cookie (Admin) | `POST /api/users` |
| `POST /api/posts`, `PUT/DELETE /api/posts/[id]`, `POST /api/posts/generate` | Cookie | `/api/posts/*` |
| `DELETE /api/clients/[id]` | Cookie | `DELETE /api/contact/{id}` |

### Otras carpetas

- `app/components/ui/`, `layout/`, `sections/`, `charts/` — piezas del sitio
  público (Navbar, Footer, Hero, gráficos SVG hechos a mano, etc.).
- `app/components/forms/FormFields.tsx` — `TextField`, `SelectField`,
  `TextareaField` compartidos por todos los formularios.
- `app/lib/*.ts` — helpers server-side (`auth.ts`, `posts.ts`, `users.ts`,
  `clients.ts`, `analytics.ts`) que leen la cookie y llaman al backend;
  `app/lib/validations/*.ts` — esquemas `zod`.

## `core/server` — ASP.NET Core Web API

.NET 10, Minimal APIs (sin controladores MVC), Entity Framework Core 10 con
SQL Server. Sin capa de servicios/repositorios intermedia: los endpoints
usan `AppDbContext` directamente.

### Estructura

| Carpeta | Contenido |
| --- | --- |
| `Models/` | Entidades EF Core: `User`, `BlogPost`, `ContactSubmission`. |
| `Data/` | `AppDbContext` (mapeo de entidades) y `DbSeeder` (crea el usuario admin en el primer arranque si `Users` está vacía). |
| `Auth/` | JWT: `JwtOptions`, `JwtTokenService`, `Roles` (`Admin`, `Editor`), endpoints de login/`/me`, y endpoints de gestión de usuarios. |
| `Blog/` | Endpoints CRUD de posts, generación de slugs únicos (`SlugGenerator`). |
| `Contacts/` | Endpoint público de envío de contacto + endpoints autenticados de listado/eliminación (módulo Clientes). |
| `Analytics/` | Endpoint de métricas agregadas (`/api/analytics/summary`). |
| `Ai/` | `AiDraftGenerator`, cliente HTTP hacia la API de Anthropic para generar borradores de blog. |
| `Migrations/` | Historial de migraciones EF Core, aplicadas automáticamente al arrancar (`Database.MigrateAsync()` en `Program.cs`). |

### Endpoints

| Método y ruta | Auth | Descripción |
| --- | --- | --- |
| `POST /api/auth/login` | — | Verifica usuario/contraseña (`PasswordHasher<User>`), devuelve JWT. |
| `GET /api/auth/me` | JWT | Datos del usuario autenticado (usado por el layout del dashboard). |
| `GET /api/users`, `POST /api/users` | JWT, rol `Admin` | Listar/crear usuarios del panel. |
| `GET /api/posts`, `POST /api/posts`, `PUT/DELETE /api/posts/{id}` | JWT | CRUD de posts de blog. |
| `POST /api/posts/generate` | JWT | Genera un borrador con IA y lo guarda (`Published = false`). |
| `GET /api/analytics/summary` | JWT | Conteos de usuarios/posts y posts por mes. |
| `POST /api/contact` | — (público) | Recibe una consulta de los formularios del sitio. |
| `GET /api/contact`, `DELETE /api/contact/{id}` | JWT | Listar/eliminar consultas (módulo Clientes). |

### Autenticación

JWT firmado con HMAC (`Jwt:Key`, `Jwt:Issuer`, `Jwt:Audience` en
configuración / `.env` raíz). Los claims usan nombres cortos (`sub`, `name`,
`role`, `full_name`) mapeados 1:1 (`MapInboundClaims = false`), y
`RoleClaimType`/`NameClaimType` están configurados para que
`[Authorize(Roles = "Admin")]` y `ClaimsPrincipal.Identity.Name` funcionen
sin fricción.

### Base de datos

SQL Server vía `Microsoft.EntityFrameworkCore.SqlServer`. Al arrancar,
`Program.cs` aplica las migraciones pendientes y siembra un usuario admin
(`Seed:AdminUsername`/`AdminPassword`/`AdminFullName`, o sus equivalentes
`SEED_ADMIN_*` en `.env`) si la tabla `Users` está vacía.

El backend **nunca se conecta como `sa`**. Al arrancar el stack de Docker,
el servicio `db-init` (ver [`docker-guide.md`](./docker-guide.md)) ejecuta
`docker/database/init.sql` como `sa` para crear la base de datos y un login
de aplicación dedicado (`ibgroup_app` por defecto) con permisos `db_owner`
acotados únicamente a `IBGroupCMS` — nunca `sysadmin` a nivel de servidor.
El backend usa ese login desde el primer arranque.

## Ver también

- [`docker-guide.md`](./docker-guide.md) — Dockerfiles, `docker-compose.yml`, variables de entorno.
- [`bash-scripts-guide.md`](./bash-scripts-guide.md) — `scripts/setup.sh`, `run.sh`, `clear.sh`.
