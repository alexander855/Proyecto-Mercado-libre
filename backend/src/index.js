require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { crearDependencias } = require('./dependencies');
const { crearAuthRoutes } = require('./routes/auth.routes');
const { crearUsuarioRoutes } = require('./routes/usuario.routes');
const { crearProductoRoutes } = require('./routes/producto.routes');
const { crearCategoriaRoutes } = require('./routes/categoria.routes');
const { crearProveedorRoutes } = require('./routes/proveedor.routes');
const { crearDireccionRoutes } = require('./routes/direccion.routes');
const { crearCarritoRoutes } = require('./routes/carrito.routes');
const { crearPedidoRoutes } = require('./routes/pedido.routes');
const { crearPedidoProveedorRoutes } = require('./routes/pedidoProveedor.routes');
const { crearPagoRoutes } = require('./routes/pago.routes');

const errorHandler = require('../middleware/errorHandler');

const app = express();

app.disable('x-powered-by');

const origenesPermitidos = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean);

app.use(cors({ origin: origenesPermitidos }));
app.use(express.json({ limit: '100kb' }));

const servicios = crearDependencias();

app.get('/', (req, res) => {
    res.json({ mensaje: 'API Mercado Libre funcionando aqui' });
});

app.use('/api/auth', crearAuthRoutes({ authService: servicios.authService }));
app.use('/api/usuarios', crearUsuarioRoutes({ usuarioService: servicios.usuarioService }));
app.use('/api/productos', crearProductoRoutes({ productoService: servicios.productoService }));
app.use('/api/proveedores', crearProveedorRoutes({ proveedorService: servicios.proveedorService }));
app.use('/api/categorias', crearCategoriaRoutes({ categoriaService: servicios.categoriaService }));
app.use('/api/direcciones', crearDireccionRoutes({ direccionService: servicios.direccionService }));
app.use('/api/carritos', crearCarritoRoutes({ carritoService: servicios.carritoService }));
app.use('/api/pedidos', crearPedidoRoutes({ pedidoService: servicios.pedidoService }));
app.use('/api/pedidos-proveedor', crearPedidoProveedorRoutes({ pedidoService: servicios.pedidoService }));
app.use('/api/pagos', crearPagoRoutes({ pagoService: servicios.pagoService }));

// 404 en JSON para cualquier ruta no registrada.
app.use((req, res) => {
    res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

// Middleware final: todos los errores (AppError o inesperados) salen por aquí.
app.use(errorHandler);

const PUERTO = process.env.PORT || 3000;

app.listen(PUERTO, '0.0.0.0', () => {
    console.log(`Servidor funcionando en puerto ${PUERTO}`);
});
