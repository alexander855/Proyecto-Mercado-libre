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
│   │   ├── db.js
│   │   └── index.js
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
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

Actualmente se están implementando operaciones CRUD para las diferentes entidades del sistema.

### Usuarios

```text
GET     /api/usuarios
GET     /api/usuarios/:id
POST    /api/usuarios
PUT     /api/usuarios/:id
DELETE  /api/usuarios/:id
```

### Proveedores

```text
GET     /api/proveedores
GET     /api/proveedores/:id
POST    /api/proveedores
PUT     /api/proveedores/:id
DELETE  /api/proveedores/:id
```

### Categorías

```text
GET     /api/categorias
GET     /api/categorias/:id
POST    /api/categorias
PUT     /api/categorias/:id
DELETE  /api/categorias/:id
```

### Productos

```text
GET     /api/productos
GET     /api/productos/:id
POST    /api/productos
PUT     /api/productos/:id
DELETE  /api/productos/:id
```

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

Para construir e iniciar el proyecto:

```bash
docker compose up -d --build
```

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

Actualmente se encuentra implementada la estructura inicial del proyecto, la base de datos PostgreSQL, el entorno Docker, el backend con Node.js y Express y el frontend con React.

También se está trabajando en la implementación de los CRUD y endpoints de la API REST.

## Próximos pasos

- Completar los CRUD de las tablas restantes.
- Completar la documentación OpenAPI.
- Implementar la interfaz gráfica con React.
- Conectar las diferentes interfaces del frontend con la API.
- Agregar validaciones y manejo de errores.
- Mejorar la seguridad de usuarios y contraseñas.