# Api MiniBlog

API REST para gestionar autores, posts y comentarios, hecha con Node.js, Express y PostgreSQL. Un autor puede tener muchos posts, y un post puede tener muchos comentarios.


- **URL pública principal:**https://miniblog-api-fb6m.onrender.com/
 **Documentación interactiva:**https://miniblog-api-fb6m.onrender.com/api-docs

- **URL pública backup:** https://pt38-authorpost-api-production.up.railway.app/
- **Documentación interactiva:** https://pt38-authorpost-api-production.up.railway.app/api-docs
❤️ Health check: https://pt38-authorpost-api-production.up.railway.app/health

## Requisitos

- Node.js 20 o superior
- PostgreSQL 14 o superior

## Ejecutar en local

**1. Instala las dependencias**

```bash
npm install
```

**2. Crea las bases de datos**

Una es para la aplicación y otra para los tests, porque los tests borran los datos de la suya.

```bash
psql -U postgres -c "CREATE DATABASE miniblog"
psql -U postgres -c "CREATE DATABASE miniblog_test"
```

**3. Configura las variables de entorno**

```bash
cp .env.example .env
```

Abre `.env` y reemplaza `your_password` por tu contraseña de PostgreSQL:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/miniblog
TEST_DATABASE_URL=postgresql://postgres:your_password@localhost:5432/miniblog_test
DB_SSL=false
```

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DATABASE_URL` | Sí | Conexión a la base de datos de la aplicación |
| `TEST_DATABASE_URL` | Solo para tests | Conexión a la base de datos de tests; debe ser distinta de `DATABASE_URL` |
| `PORT` | No | Puerto del servidor; por defecto, 3000 |
| `DB_SSL` | No | `true` si tu proveedor exige SSL; por defecto, sin SSL |

**4. Crea las tablas y carga los datos de ejemplo**

```bash
npm run db:test-connection
npm run db:setup
npm run db:seed
```

Puedes repetir `db:setup` y `db:seed`: no borran datos ni duplican los registros de ejemplo.

**5. Inicia el servidor**

```bash
npm run dev
```

La API queda en `http://localhost:3000`. Para comprobarlo, abre `http://localhost:3000/authors`.

## Endpoints

| Método | Ruta | Descripción | Éxito | Errores |
|---|---|---|---|---|
| GET | `/authors` | Lista los autores | 200 | 500 |
| GET | `/authors/:id` | Obtiene un autor | 200 | 400, 404, 500 |
| POST | `/authors` | Crea un autor | 201 | 400, 409, 500 |
| PUT | `/authors/:id` | Actualiza un autor | 200 | 400, 404, 409, 500 |
| DELETE | `/authors/:id` | Elimina un autor y sus posts | 204 | 400, 404, 500 |
| GET | `/posts` | Lista los posts | 200 | 500 |
| GET | `/posts/:id` | Obtiene un post | 200 | 400, 404, 500 |
| GET | `/posts/author/:authorId` | Lista los posts de un autor, con sus datos | 200 | 400, 404, 500 |
| POST | `/posts` | Crea un post | 201 | 400, 500 |
| PUT | `/posts/:id` | Actualiza un post | 200 | 400, 404, 500 |
| DELETE | `/posts/:id` | Elimina un post y sus comentarios | 204 | 400, 404, 500 |
| GET | `/posts/:postId/comments` | Lista los comentarios de un post | 200 | 400, 404, 500 |
| GET | `/comments` | Lista los comentarios | 200 | 500 |
| POST | `/comments` | Crea un comentario | 201 | 400, 500 |
| GET | `/health` | Comprueba que el servicio está activo | 200 | |

`PUT` reemplaza el recurso, así que debes enviar todos los campos obligatorios. Si omites `bio`, queda en `null`. Si omites `published`, queda en `false`.

### Ejemplos

```bash
curl -X POST http://localhost:3000/authors \
  -H "Content-Type: application/json" \
  -d '{"name": "Laura Díaz", "email": "laura@example.com", "bio": "Backend"}'

curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{"title": "Mi post", "content": "Contenido", "author_id": 1, "published": true}'

curl -X POST http://localhost:3000/comments \
  -H "Content-Type: application/json" \
  -d '{"post_id": 1, "author_id": 2, "content": "Muy buen post"}'
```

Todos los errores tienen el mismo formato:

```json
{ "error": "El email ya está registrado", "status": 409 }
```

## Validaciones y errores

- **Autores:** `name` y `email` son obligatorios. El `email` debe tener un formato válido y ser único; se guarda en minúsculas.
- **Posts:** `title`, `content` y `author_id` son obligatorios. `author_id` debe ser un autor existente.
- **Comentarios:** `post_id`, `author_id` y `content` son obligatorios. El post y el autor deben existir.
- **Ids en la URL:** deben ser enteros positivos.

### Qué pasa al eliminar

| Se elimina | Efecto |
|---|---|
| Un post | Se eliminan sus comentarios |
| Un autor | Se eliminan sus posts y los comentarios de esos posts |
| Un autor con comentarios en posts ajenos | Esos comentarios se conservan con `author_id` en `null` |

El middleware [`errorHandler.js`](src/middlewares/errorHandler.js) centraliza los errores y traduce los códigos de PostgreSQL:

| Código de PostgreSQL | Significado | HTTP |
|---|---|---|
| `23505` | Valor único duplicado | 409 |
| `23503` | Clave foránea inválida | 400 |
| `23502` | Falta un valor obligatorio | 400 |
| `22P02` | Formato inválido | 400 |
| `22001` | Texto demasiado largo | 400 |
| `22003` | Número fuera de rango | 400 |

Cualquier otro error responde 500 con un mensaje genérico, sin exponer detalles internos.

## Tests

Los tests usan Vitest y Supertest. Necesitan que `TEST_DATABASE_URL` apunte a una base de datos existente; las tablas se crean solas.

```bash
npm test
```

> **Importante:** los tests vacían las tablas de `TEST_DATABASE_URL`. Por seguridad, no se ejecutan si esa variable falta o es igual a `DATABASE_URL`.

| Archivo | Qué cubre |
|---|---|
| `tests/authors.test.js` | CRUD de autores y sus errores, contra PostgreSQL |
| `tests/posts.test.js` | CRUD de posts y sus errores, contra PostgreSQL |
| `tests/comments.test.js` | Creación y listado de comentarios, sus errores y los borrados en cascada |
| `tests/app.test.js` | `/health`, rutas inexistentes y `/api-docs` |
| `tests/errorHandler.test.js` | Traducción de errores a códigos HTTP |
| `tests/validators.test.js` | Reglas de validación |

## Documentación OpenAPI

Con el servidor en marcha, abre `http://localhost:3000/api-docs` para usar Swagger UI. El archivo fuente es [`src/docs/openapi.yaml`](src/docs/openapi.yaml).

## Despliegue en Railway

**1. Sube el proyecto a un repositorio público de GitHub.** El archivo `.env` queda fuera gracias a `.gitignore`.

**2. Crea el proyecto en [Railway](https://railway.com).** Elige **New Project → Deploy from GitHub repo** y selecciona el repositorio.

**3. Agrega la base de datos.** En el mismo proyecto, elige **New → Database → Add PostgreSQL**.

**4. Configura las variables.** En el servicio de la API, abre **Variables** y agrega:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |

`Postgres` es el nombre del servicio de base de datos. Si le cambiaste el nombre, usa el tuyo. Railway define `PORT` automáticamente, así que no debes agregarlo.

**5. Crea las tablas.** En el servicio de PostgreSQL, abre **Variables** y copia `DATABASE_PUBLIC_URL`. Luego ejecuta en tu computadora:

```powershell
# PowerShell
$env:DATABASE_URL="pega_aqui_la_url_publica"; npm run db:setup; npm run db:seed
```

```bash
# Bash
DATABASE_URL="pega_aqui_la_url_publica" npm run db:setup
DATABASE_URL="pega_aqui_la_url_publica" npm run db:seed
```

Si la conexión exige SSL, define también `DB_SSL=true`.

**6. Genera la URL pública.** En el servicio de la API, abre **Settings → Networking → Generate Domain**.

**7. Comprueba el despliegue.**

- `https://tu-app.up.railway.app/health` responde `{"status":"ok"}`.
- `https://tu-app.up.railway.app/authors` devuelve los autores.
- `https://tu-app.up.railway.app/api-docs` muestra la documentación.

### Actualizar un despliegue que ya existe

Si cambias el esquema, primero aplícalo en la base de datos de Railway y después sube el código. Así la API nueva nunca se ejecuta sin sus tablas:

```powershell
$env:DATABASE_URL="pega_aqui_la_url_publica"
npm run db:setup
npm run db:seed
Remove-Item Env:DATABASE_URL
git push
```

`db:setup` y `db:seed` no borran datos: solo crean lo que falta.

### URL interna y URL pública

| URL | Dónde se usa | Variable en Railway |
|---|---|---|
| Interna | Entre servicios del mismo proyecto; es la que usa la API | `DATABASE_URL` |
| Pública | Desde fuera de Railway, por ejemplo tu computadora | `DATABASE_PUBLIC_URL` |

### Despliegue en Render

El proceso es equivalente: crea un **Web Service** con `npm install` como comando de build y `npm start` como comando de inicio, y una base de datos **PostgreSQL**. Usa la **Internal Database URL** como `DATABASE_URL` del servicio y la **External Database URL** con `DB_SSL=true` para ejecutar los scripts desde tu computadora.

## Estructura del proyecto

```text
src/
├── app.js            Configuración de Express
├── index.js          Inicio del servidor
├── config/           Conexión a PostgreSQL (pool)
├── controllers/      Manejo de peticiones y respuestas HTTP
├── db/               Scripts SQL y utilidades de base de datos
├── docs/             Documento OpenAPI
├── middlewares/      Errores, rutas inexistentes y validación de ids
├── routes/           Definición de rutas
├── services/         Consultas SQL parametrizadas
└── utils/            Errores HTTP y validadores
tests/                Tests con Vitest y Supertest
```

## Registro del uso de IA

Este proyecto se desarrolló con la ayuda de **Claude Code** (modelo Claude Opus 5.5).

| Parte | Uso de la IA |
|---|---|
| Estructura, servicios, controladores y rutas | con ayuda de Claude Code |
| Middleware de errores y validadores |  pedidos (23505 → 409, 23503 → 400) |
| Scripts SQL | Adaptados por la IA  |
| Tests y documento OpenAPI | Generados por la IA |
| Extra credit de comentarios (tabla, endpoints, tests y OpenAPI) | ayudados por lo IA |
| README | Redaccion ayudado por la IA |

La IA ejecutó los tests y probó los endpoints contra una instalación local de PostgreSQL.
