const { AppError } = require('../errors/AppError');

class CarritoService {
    constructor({ carritoRepository, productoRepository }) {
        this.carritoRepository = carritoRepository;
        this.productoRepository = productoRepository;
    }

    async listar(solicitante, filtros = {}) {
        const idUsuario =
            solicitante.rol === 'admin'
                ? filtros.id_usuario
                    ? Number(filtros.id_usuario)
                    : null
                : solicitante.id_usuario;

        return this.carritoRepository.findAll(idUsuario, filtros.estado || null);
    }

    async obtenerActivo(solicitante) {
        const carrito = await this.carritoRepository.findActivoByUsuario(
            solicitante.id_usuario
        );
        if (!carrito) {
            throw AppError.noEncontrado('No tienes un carrito activo');
        }
        return this.conDetalles(carrito);
    }

    async crear(solicitante) {
        let carrito = await this.carritoRepository.findActivoByUsuario(
            solicitante.id_usuario
        );
        let creado = false;

        if (!carrito) {
            carrito = await this.carritoRepository.create(solicitante.id_usuario);
            creado = true;
        }

        return {
            mensaje: 'Carrito activo obtenido correctamente',
            carrito: await this.conDetalles(carrito),
            creado
        };
    }

    async obtenerPorId(id, solicitante) {
        const carrito = await this.obtenerCarritoAutorizado(id, solicitante);
        return this.conDetalles(carrito);
    }

    async actualizar(id, datos, solicitante) {
        await this.obtenerCarritoAutorizado(id, solicitante);

        const carrito = await this.carritoRepository.update(Number(id), datos);
        return { mensaje: 'Carrito actualizado exitosamente', carrito };
    }

    async eliminar(id, solicitante) {
        await this.obtenerCarritoAutorizado(id, solicitante);

        const carrito = await this.carritoRepository.removeWithItems(Number(id));
        return { mensaje: 'Carrito eliminado correctamente', carrito };
    }

    async listarDetalles(id, solicitante) {
        await this.obtenerCarritoAutorizado(id, solicitante);
        return this.carritoRepository.findDetalles(Number(id));
    }

    async agregarDetalle(id, datos, solicitante) {
        const carrito = await this.obtenerCarritoAutorizado(id, solicitante);
        this.verificarCarritoActivo(carrito);

        const producto = await this.productoRepository.findById(
            Number(datos.id_producto)
        );
        if (!producto) {
            throw AppError.noEncontrado('Producto no encontrado');
        }
        this.verificarStock(producto, Number(datos.cantidad));

        const existente = await this.carritoRepository.findDetalleByProducto(
            carrito.id_carrito,
            producto.id_producto
        );
        const cantidad = existente
            ? existente.cantidad + Number(datos.cantidad)
            : Number(datos.cantidad);

        this.verificarStock(producto, cantidad);

        const detalle = existente
            ? await this.carritoRepository.updateDetalleCantidad(
                carrito.id_carrito,
                existente.id_detalle,
                cantidad
            )
            : await this.carritoRepository.addDetalle({
                id_carrito: carrito.id_carrito,
                id_producto: producto.id_producto,
                cantidad
            });

        return { mensaje: 'Producto agregado al carrito', detalle };
    }

    async actualizarDetalle(id, idDetalle, datos, solicitante) {
        const carrito = await this.obtenerCarritoAutorizado(id, solicitante);
        this.verificarCarritoActivo(carrito);

        const detalleActual = await this.carritoRepository.findDetalleById(
            carrito.id_carrito,
            Number(idDetalle)
        );
        if (!detalleActual) {
            throw AppError.noEncontrado('Ítem del carrito no encontrado');
        }

        const producto = await this.productoRepository.findById(
            detalleActual.id_producto
        );
        if (!producto) {
            throw AppError.noEncontrado('Producto no encontrado');
        }
        this.verificarStock(producto, Number(datos.cantidad));

        const detalle = await this.carritoRepository.updateDetalleCantidad(
            carrito.id_carrito,
            Number(idDetalle),
            Number(datos.cantidad)
        );

        return { mensaje: 'Cantidad actualizada exitosamente', detalle };
    }

    async eliminarDetalle(id, idDetalle, solicitante) {
        const carrito = await this.obtenerCarritoAutorizado(id, solicitante);
        this.verificarCarritoActivo(carrito);

        const detalle = await this.carritoRepository.removeDetalle(
            carrito.id_carrito,
            Number(idDetalle)
        );
        if (!detalle) {
            throw AppError.noEncontrado('Ítem del carrito no encontrado');
        }

        return { mensaje: 'Ítem eliminado del carrito', detalle };
    }

    async obtenerCarritoAutorizado(id, solicitante) {
        const carrito = await this.carritoRepository.findById(Number(id));
        if (!carrito) {
            throw AppError.noEncontrado('Carrito no encontrado');
        }
        if (
            solicitante.rol !== 'admin' &&
            carrito.id_usuario !== solicitante.id_usuario
        ) {
            throw AppError.prohibido('No tienes permisos para acceder a este carrito');
        }
        return carrito;
    }

    verificarCarritoActivo(carrito) {
        if (carrito.estado !== 'activo') {
            throw AppError.conflicto('Solo se puede modificar un carrito activo');
        }
    }

    verificarStock(producto, cantidad) {
        if (producto.estado === 'agotado' || Number(producto.stock) < 1) {
            throw AppError.conflicto('El producto no tiene stock disponible');
        }
        if (cantidad > Number(producto.stock)) {
            throw AppError.conflicto(
                `Stock insuficiente: solo hay ${producto.stock} unidades disponibles`
            );
        }
    }

    async conDetalles(carrito) {
        const detalles = await this.carritoRepository.findDetalles(carrito.id_carrito);
        const subtotal = detalles
            .reduce((total, detalle) => total + Number(detalle.subtotal), 0)
            .toFixed(2);

        return { ...carrito, detalles, subtotal };
    }
}

module.exports = { CarritoService };
