// ====== src/dependencies.js ======
// RAÍZ DE COMPOSICIÓN (Composition Root).
// Único lugar del sistema que "arma" el grafo de objetos: aquí se concretan
// las abstracciones (interfaces) y se inyectan en los consumidores.
// Ninguna otra capa importa `pg` ni conoce las clases concretas (DIP).

const pool = require('./db');

const { UsuarioRepository } = require('./repositories/usuario.repository');
const { ProductoRepository } = require('./repositories/producto.repository');
const { CategoriaRepository } = require('./repositories/categoria.repository');
const { ProveedorRepository } = require('./repositories/proveedor.repository');
const { DireccionRepository } = require('./repositories/direccion.repository');
const { CarritoRepository } = require('./repositories/carrito.repository');
const { PedidoRepository } = require('./repositories/pedido.repository');
const { PedidoProveedorRepository } = require('./repositories/pedidoProveedor.repository');
const { PagoRepository } = require('./repositories/pago.repository');

const { AuthService } = require('./services/auth.service');
const { UsuarioService } = require('./services/usuario.service');
const { ProductoService } = require('./services/producto.service');
const { CategoriaService } = require('./services/categoria.service');
const { ProveedorService } = require('./services/proveedor.service');
const { DireccionService } = require('./services/direccion.service');
const { CarritoService } = require('./services/carrito.service');
const { PedidoService } = require('./services/pedido.service');
const { PagoService } = require('./services/pago.service');

const { signToken } = require('../middleware/auth');

function crearDependencias() {
    // Capa 1: repositorios (infraestructura / acceso a datos)
    const usuarioRepository = new UsuarioRepository(pool);
    const productoRepository = new ProductoRepository(pool);
    const categoriaRepository = new CategoriaRepository(pool);
    const proveedorRepository = new ProveedorRepository(pool);
    const direccionRepository = new DireccionRepository(pool);
    const carritoRepository = new CarritoRepository(pool);
    const pedidoRepository = new PedidoRepository(pool);
    const pedidoProveedorRepository = new PedidoProveedorRepository(pool);
    const pagoRepository = new PagoRepository(pool);

    // Capa 2: servicios (reglas de negocio) -> dependen de interfaces, no de SQL
    const authService = new AuthService({ usuarioRepository, generarToken: signToken });
    const usuarioService = new UsuarioService({ usuarioRepository });
    const productoService = new ProductoService({ productoRepository });
    const categoriaService = new CategoriaService({ categoriaRepository });
    const proveedorService = new ProveedorService({ proveedorRepository });
    const direccionService = new DireccionService({ direccionRepository });
    const carritoService = new CarritoService({ carritoRepository, productoRepository });
    const pedidoService = new PedidoService({
        pedidoRepository,
        pedidoProveedorRepository
    });
    const pagoService = new PagoService({ pagoRepository, pedidoRepository });

    return {
        authService,
        usuarioService,
        productoService,
        categoriaService,
        proveedorService,
        direccionService,
        carritoService,
        pedidoService,
        pagoService
    };
}

module.exports = { crearDependencias };
