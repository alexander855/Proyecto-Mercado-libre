# Mercado Libre - Proyecto Web

Proyecto de comercio electrónico desarrollado con el objetivo de implementar una plataforma de compra y venta de productos, utilizando una arquitectura separada en frontend, backend y base de datos.

El proyecto se encuentra actualmente en desarrollo.

## Tecnologías utilizadas

### Frontend
- React
- JavaScript
- Vite

### Backend
- Node.js
- Express
- JavaScript
- API REST

### Base de datos
- PostgreSQL
- pgAdmin

### Contenedores
- Docker
- Docker Compose

## Arquitectura del proyecto

El sistema está organizado de la siguiente manera:

React (Frontend)
        |
        | Peticiones HTTP
        v
Node.js + Express (Backend)
        |
        | Consultas SQL
        v
PostgreSQL (Base de datos)

El frontend se comunica con el backend mediante una API REST desarrollada con Express.

El backend es el encargado de procesar las solicitudes y comunicarse con PostgreSQL.

## Estructura del proyecto

```text
Mercado libre/
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── errors/
│   │   ├── db.js
│   │   └── index.js
│   ├── middleware/
│   ├── validators/
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── layouts/
│   ├── tablas/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── openapi.yaml
└── README.md
```

## Base de datos

La base de datos utilizada es PostgreSQL.

Nombre de la base de datos:

```text
mercado_libre
```

Actualmente el modelo contiene las siguientes tablas:

- usuario
- proveedor
- categoria
- producto
- direccion
- carrito
- carrito_detalle
- pedido
- pedido_proveedor
- pedido_detalle
- pago

Las tablas utilizan claves primarias, claves foráneas y restricciones para mantener la integridad de los datos.

## API Backend

La API está desarrollada utilizando Node.js y Express.

Servidor local:

```text
http://localhost:3000
```

### Autenticación y roles

La API usa JWT. Las rutas protegidas esperan la cabecera:

```http
Authorization: Bearer <token>
```

El token se obtiene en `POST /api/auth/login` o `POST /api/auth/register` y dura 7 días.
Las contraseñas se almacenan con bcrypt y nunca se devuelven en las respuestas.

El registro público (`/api/auth/register`) siempre crea usuarios con rol `cliente`; cualquier
`rol` enviado en ese cuerpo se ignora. Solo un `admin` puede asignar roles privilegiados mediante
`POST /api/usuarios`.

| Acción | Público | cliente | vendedor | admin |
|---|:---:|:---:|:---:|:---:|
| Ver productos, proveedores y categorías | Sí | Sí | Sí | Sí |
| Registrarse | Sí | — | — | — |
| Editar el propio perfil | — | Sí | Sí | Sí |
| Cambiar el propio rol o estado | — | — | — | Sí |
| Crear o actualizar productos, proveedores y categorías | — | — | Sí | Sí |
| Eliminar productos, proveedores y categorías | — | — | — | Sí |
| Listar, crear o eliminar usuarios | — | — | — | Sí |
| Ver otros usuarios | — | — | — | Sí |

Los `PUT` de productos, proveedores, categorías y usuarios son **parciales**: solo se modifican
los campos enviados y el resto conserva su valor actual.

### Autenticación

```text
POST    /api/auth/register           Público. Crea un cliente y devuelve token
POST    /api/auth/login              Público. Devuelve token y datos del usuario
GET     /api/auth/me                 Token requerido. Usuario de la sesión
PUT     /api/auth/change-password    Token requerido. Cambia la contraseña
```

### Usuarios

Todas las rutas requieren token.

```text
GET     /api/usuarios                Solo admin
GET     /api/usuarios/:id            Dueño del perfil o admin
POST    /api/usuarios                Solo admin. Permite indicar rol y estado
PUT     /api/usuarios/:id            Dueño o admin (rol/estado solo admin)
DELETE  /api/usuarios/:id            Solo admin. No puede eliminarse a sí mismo
```

### Proveedores

```text
GET     /api/proveedores             Público
GET     /api/proveedores/:id         Público
POST    /api/proveedores             Admin o vendedor
PUT     /api/proveedores/:id         Admin o vendedor (parcial)
DELETE  /api/proveedores/:id         Solo admin
```

### Categorías

```text
GET     /api/categorias              Público
GET     /api/categorias/:id          Público
POST    /api/categorias              Admin o vendedor
PUT     /api/categorias/:id          Admin o vendedor (parcial)
DELETE  /api/categorias/:id          Solo admin
```

### Productos

```text
GET     /api/productos               Público. Incluye nombre de proveedor y categoría
GET     /api/productos/:id           Público
POST    /api/productos               Admin o vendedor
PUT     /api/productos/:id           Admin o vendedor (parcial)
DELETE  /api/productos/:id           Solo admin
```

Los errores de validación responden `400` con `{ "mensaje": "Error de validación", "errores": [...] }`.
Los errores de autenticación y permisos responden `401` y `403`; los conflictos de datos, `409`.

### Direcciones

Todas las rutas requieren token. Un `cliente` solo ve y modifica sus propias direcciones;
un `admin` puede indicar `id_usuario` al crear y filtrar por usuario al listar.

```text
GET     /api/direcciones             Lista (propias o todas si admin)
GET     /api/direcciones/:id         Propia o admin
POST    /api/direcciones             Crea una dirección
PUT     /api/direcciones/:id         Actualiza (parcial)
DELETE  /api/direcciones/:id         Elimina
```

### Carritos

```text
GET     /api/carritos                        Lista carritos
POST    /api/carritos                        Obtiene o crea el carrito activo (201 si se crea)
GET     /api/carritos/activo                 Carrito activo con ítems y subtotal
GET     /api/carritos/:id                    Detalle con ítems
PUT     /api/carritos/:id                    Cambia estado (activo/convertido/abandonado)
DELETE  /api/carritos/:id                    Elimina carrito e ítems
GET     /api/carritos/:id/items              Lista ítems
POST    /api/carritos/:id/items              Agrega ítem (valida stock)
PUT     /api/carritos/:id/items/:idDetalle   Cambia cantidad
DELETE  /api/carritos/:id/items/:idDetalle   Quita ítem
```

### Pedidos

```text
GET     /api/pedidos                 Lista (propios o todos si admin)
POST    /api/pedidos                 Crea un pedido desde el carrito activo
GET     /api/pedidos/:id             Pedido con proveedores y detalles
GET     /api/pedidos/:id/proveedores Pedidos de proveedor del pedido
PUT     /api/pedidos/:id             Solo admin. Cambia estado
DELETE  /api/pedidos/:id             Solo admin. Solo pendientes/cancelados sin pagos
```

Crear un pedido descuenta stock en una transacción y deja el carrito como `convertido`.
Cancelar un pedido restaura el stock.

### Pedidos de proveedor

```text
GET     /api/pedidos-proveedor/:id/detalles              Detalles del pedido de proveedor
GET     /api/pedidos-proveedor/:id/detalles/:idDetalle   Un detalle
GET     /api/pedidos-proveedor/:id                       Pedido de proveedor con detalles
PUT     /api/pedidos-proveedor/:id                       Solo admin. Cambia estado
```

### Pagos

```text
GET     /api/pagos              Lista (propios o todos si admin)
POST    /api/pagos              Registra un pago (no supera el saldo disponible)
GET     /api/pagos/:id          Pago propio o admin
PUT     /api/pagos/:id          Solo admin. Cambia estado
DELETE  /api/pagos/:id          Solo admin. No elimina pagos completados
```

Solo los pagos con estado `completado` cuentan como cobrados. Los pagos `pendiente` reservan
parte del saldo para evitar sobrepagos.

## Documentación de la API

La documentación de los endpoints se encuentra en:

```text
openapi.yaml
```

Este archivo utiliza la especificación OpenAPI para describir las rutas, métodos HTTP, parámetros y datos utilizados por la API.

## Docker

El proyecto utiliza Docker Compose para ejecutar los diferentes servicios.

Actualmente se utilizan contenedores para:

- PostgreSQL
- pgAdmin
- Backend Node.js + Express
- Frontend React

### Variables de entorno

El backend lee `backend/.env`, que no se versiona y está excluido de la imagen
mediante `backend/.dockerignore`. Hay una plantilla versionada en
`backend/.env.example`; cópiala antes de arrancar en local:

```bash
cp backend/.env.example backend/.env
```

```text
PORT=3000
JWT_SECRET=una-clave-larga-y-aleatoria
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
```

Docker Compose lo inyecta con `env_file` (opcional) y añade las variables de conexión
(`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) para la red interna.
`JWT_SECRET` es obligatorio.

- Ejecutando el backend con Node directamente, se lee `backend/.env`.
- En Docker, `JWT_SECRET` y `CORS_ORIGIN` se toman del entorno del host. Si no se define,
  Compose usa un secreto de desarrollo. En producción define uno propio:

```bash
JWT_SECRET="$(openssl rand -base64 48)" docker compose up -d --build
```

`CORS_ORIGIN` acepta varios orígenes separados por coma. Solo esos orígenes pueden
llamar a la API.

El frontend usa `VITE_API_URL` para apuntar al backend; si no se define, usa
`http://localhost:3000`.

> En Windows, los cambios dentro de `./backend` pueden no disparar `node --watch`
> por el bind mount. Después de editar el backend, ejecutar
> `docker restart mercado-backend`.

Para construir e iniciar el proyecto:

```bash
docker compose up -d --build
```

El esquema `Mercado libre.sql` se monta en `/docker-entrypoint-initdb.d/` y PostgreSQL lo
ejecuta automáticamente **solo la primera vez** que se crea el volumen `postgres_data`.
Si la base ya existía, el script no se vuelve a ejecutar; para recargarlo desde cero:

```bash
docker compose down -v
docker compose up -d --build
```

> `down -v` borra los datos de PostgreSQL y pgAdmin.

Para verificar los contenedores:

```bash
docker ps
```

Para detenerlos sin eliminarlos:

```bash
docker compose stop
```

Para volver a iniciarlos:

```bash
docker compose start
```

## Puertos utilizados

| Servicio | Puerto |
|---|---:|
| React | 5173 |
| Backend / Express | 3000 |
| PostgreSQL | 5432 |
| pgAdmin | 8080 |

## Acceso local

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:3000
```

pgAdmin:

```text
http://localhost:8080
```

## Estado actual

Actualmente están implementados:

- La estructura del proyecto, el esquema PostgreSQL y el entorno Docker.
- El backend con Node.js y Express, organizado en rutas, servicios, repositorios y validadores.
- CRUD de usuarios, proveedores, categorías y productos.
- Autenticación JWT con login, registro público, perfil y cambio de contraseña.
- Autorización por roles (`admin`, `vendedor`, `cliente`) en todas las escrituras.
- Revalidación del usuario en cada petición: cuentas eliminadas o inactivas pierden acceso
  de inmediato y los cambios de rol se aplican sin esperar a que expire el token.
- Actualizaciones parciales (`PUT`) y manejo centralizado de errores.
- Backend de direcciones, carritos, pedidos (con descuento/restauración de stock en
  transacción) y pagos (control de saldo y pagos pendientes).
- Formularios del frontend con token, registro público y gestión de usuarios para administradores.
- Pantalla de pagos: listado, filtro por estado, alta de pagos y, para administradores,
  cambio de estado y eliminación de pagos no completados.
- Interfaz oculta las acciones de escritura según el rol del usuario.

Quedan pendientes las pantallas del frontend para carrito, pedidos y direcciones
(el backend de esos módulos ya está listo).

## Próximos pasos

- Construir las pantallas de carrito, pedidos y direcciones en el frontend.
- Configurar `VITE_API_URL` por entorno para el frontend.
- Agregar pruebas automatizadas y un flujo de integración continua.
- Añadir búsqueda, filtros y paginación en los listados.
- Incorporar healthchecks, `helmet` y rate limiting.