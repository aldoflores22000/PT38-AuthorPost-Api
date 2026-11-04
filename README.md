# Api MiniBlog

API REST para gestionar autores y posts, hecha con Node.js, Express y PostgreSQL. Un autor puede tener muchos posts.

- **URL pública:** _pendiente: agregar la URL de Railway_
- **Documentación interactiva:** `/api-docs`

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
| DELETE | `/posts/:id` | Elimina un post | 204 | 400, 404, 500 |
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
```

Todos los errores tienen el mismo formato:

```json
{ "error": "El email ya está registrado", "status": 409 }
```

## Validaciones y errores

- **Autores:** `name` y `email` son obligatorios. El `email` debe tener un formato válido y ser único; se guarda en minúsculas.
- **Posts:** `title`, `content` y `author_id` son obligatorios. `author_id` debe ser un autor existente.
- **Ids en la URL:** deben ser enteros positivos.

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

Este proyecto se desarrolló con la ayuda de **Claude Code** (modelo Claude Opus 5.5), usando como referencia el proyecto de clase `Lecture7-doc-deploy` y la consigna de la entrega.

| Parte | Uso de la IA |
|---|---|
| Estructura, servicios, controladores y rutas | Generados por la IA siguiendo el estilo del proyecto de clase |
| Middleware de errores y validadores | Generados por la IA a partir de los códigos pedidos (23505 → 409, 23503 → 400) |
| Scripts SQL | Adaptados por la IA a partir de los del proyecto de clase, para poder repetirlos |
| Tests y documento OpenAPI | Generados por la IA |
| README | Redactado por la IA |

La IA ejecutó los tests y probó los endpoints contra una instalación local de PostgreSQL.
