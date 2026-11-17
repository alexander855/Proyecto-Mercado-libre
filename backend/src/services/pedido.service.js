const { AppError } = require('../errors/AppError');

class PedidoService {
    constructor({ pedidoRepository, pedidoProveedorRepository }) {
        this.pedidoRepository = pedidoRepository;
        this.pedidoProveedorRepository = pedidoProveedorRepository;
    }

    async listar(solicitante, filtros = {}) {
        const idUsuario =
            solicitante.rol === 'admin'
                ? filtros.id_usuario
                    ? Number(filtros.id_usuario)
                    : null
                : solicitante.id_usuario;

        return this.pedidoRepository.findAll(idUsuario, filtros.estado || null);
    }

    async obtenerPorId(id, solicitante) {
        const pedido = await this.pedidoRepository.findByIdConDetalles(Number(id));
        if (!pedido) {
            throw AppError.noEncontrado('Pedido no encontrado');
        }
        this.verificarPropietario(pedido, solicitante);
        return pedido;
    }

    async crear(datos, solicitante) {
        const pedido = await this.pedidoRepository.crearDesdeCarrito({
            idUsuario: solicitante.id_usuario,
            idDireccion: Number(datos.id_direccion),
            costoEnvio: datos.costo_envio ?? 0,
            descuento: datos.descuento ?? 0
        });

        return {
            mensaje: 'Pedido creado exitosamente',
            pedido: await this.pedidoRepository.findByIdConDetalles(pedido.id_pedido)
        };
    }

    async actualizarEstado(id, estado) {
        const pedido = await this.pedidoRepository.cambiarEstado(Number(id), estado);
        if (!pedido) {
            throw AppError.noEncontrado('Pedido no encontrado');
        }
        return { mensaje: 'Estado del pedido actualizado', pedido };
    }

    async eliminar(id) {
        const pedido = await this.pedidoRepository.eliminar(Number(id));
        if (!pedido) {
            throw AppError.noEncontrado('Pedido no encontrado');
        }
        return { mensaje: 'Pedido eliminado correctamente', pedido };
    }

    async listarProveedores(idPedido, solicitante) {
        const pedido = await this.pedidoRepository.findById(Number(idPedido));
        if (!pedido) {
            throw AppError.noEncontrado('Pedido no encontrado');
        }
        this.verificarPropietario(pedido, solicitante);
        return this.pedidoProveedorRepository.findAllByPedido(pedido.id_pedido);
    }

    async obtenerProveedor(id, solicitante) {
        const proveedor = await this.obtenerProveedorAutorizado(id, solicitante);
        const detalles = await this.pedidoProveedorRepository.findDetalles(
            proveedor.id_pedido_proveedor
        );
        return { ...proveedor, detalles };
    }

    async actualizarEstadoProveedor(id, estado) {
        const proveedor = await this.pedidoProveedorRepository.updateEstado(
            Number(id),
            estado
        );
        if (!proveedor) {
            throw AppError.noEncontrado('Pedido de proveedor no encontrado');
        }
        return {
            mensaje: 'Estado del pedido de proveedor actualizado',
            pedido_proveedor: proveedor
        };
    }

    async listarDetallesProveedor(id, solicitante) {
        const proveedor = await this.obtenerProveedorAutorizado(id, solicitante);
        return this.pedidoProveedorRepository.findDetalles(
            proveedor.id_pedido_proveedor
        );
    }

    async obtenerDetalle(idDetalle, solicitante) {
        const detalle = await this.pedidoProveedorRepository.findDetalleConPedido(
            Number(idDetalle)
        );
        if (!detalle) {
            throw AppError.noEncontrado('Detalle de pedido no encontrado');
        }
        if (
            solicitante.rol !== 'admin' &&
            detalle.id_usuario !== solicitante.id_usuario
        ) {
            throw AppError.prohibido('No tienes permisos para ver este detalle');
        }
        const { id_usuario, ...detallePublico } = detalle;
        return detallePublico;
    }

    async obtenerProveedorAutorizado(id, solicitante) {
        const proveedor = await this.pedidoProveedorRepository.findByIdConPedido(
            Number(id)
        );
        if (!proveedor) {
            throw AppError.noEncontrado('Pedido de proveedor no encontrado');
        }
        if (
            solicitante.rol !== 'admin' &&
            proveedor.id_usuario !== solicitante.id_usuario
        ) {
            throw AppError.prohibido('No tienes permisos para ver este pedido');
        }
        return proveedor;
    }

    verificarPropietario(pedido, solicitante) {
        if (
            solicitante.rol !== 'admin' &&
            pedido.id_usuario !== solicitante.id_usuario
        ) {
            throw AppError.prohibido('No tienes permisos para acceder a este pedido');
        }
    }
}

module.exports = { PedidoService };
