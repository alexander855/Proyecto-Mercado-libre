require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { crearDependencias } = require('./dependencies');
const { crearAuthRoutes } = require('./routes/auth.routes');
const { crearUsuarioRoutes } = require('./routes/usuario.routes');
const { crearProductoRoutes } = require('./routes/producto.routes');
const { crearCategoriaRoutes } = require('./routes/categoria.routes');
const { crearProveedorRoutes } = require('./routes/proveedor.routes');

const errorHandler = require('../middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

const servicios = crearDependencias();

app.get('/', (req, res) => {
    res.json({ mensaje: 'API Mercado Libre funcionando aqui' });
});

app.use('/api/auth', crearAuthRoutes({ authService: servicios.authService }));
app.use('/api/usuarios', crearUsuarioRoutes({ usuarioService: servicios.usuarioService }));
app.use('/api/productos', crearProductoRoutes({ productoService: servicios.productoService }));
app.use('/api/proveedores', crearProveedorRoutes({ proveedorService: servicios.proveedorService }));
app.use('/api/categorias', crearCategoriaRoutes({ categoriaService: servicios.categoriaService }));

// Middleware final: todos los errores (AppError o inesperados) salen por aquí.
app.use(errorHandler);

const PUERTO = process.env.PORT || 3000;

app.listen(PUERTO, '0.0.0.0', () => {
    console.log(`Servidor funcionando en puerto ${PUERTO}`);
});
