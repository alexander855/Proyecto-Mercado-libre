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

const { AuthService } = require('./services/auth.service');
const { UsuarioService } = require('./services/usuario.service');
const { ProductoService } = require('./services/producto.service');
const { CategoriaService } = require('./services/categoria.service');
const { ProveedorService } = require('./services/proveedor.service');

const { signToken } = require('../middleware/auth');

function crearDependencias() {
    // Capa 1: repositorios (infraestructura / acceso a datos)
    const usuarioRepository = new UsuarioRepository(pool);
    const productoRepository = new ProductoRepository(pool);
    const categoriaRepository = new CategoriaRepository(pool);
    const proveedorRepository = new ProveedorRepository(pool);

    // Capa 2: servicios (reglas de negocio) -> dependen de interfaces, no de SQL
    const authService = new AuthService({ usuarioRepository, generarToken: signToken });
    const usuarioService = new UsuarioService({ usuarioRepository });
    const productoService = new ProductoService({ productoRepository });
    const categoriaService = new CategoriaService({ categoriaRepository });
    const proveedorService = new ProveedorService({ proveedorRepository });

    return {
        authService,
        usuarioService,
        productoService,
        categoriaService,
        proveedorService
    };
}

module.exports = { crearDependencias };
