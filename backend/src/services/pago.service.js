const { AppError } = require('../errors/AppError');

class PagoService {
    constructor({ pagoRepository, pedidoRepository }) {
        this.pagoRepository = pagoRepository;
        this.pedidoRepository = pedidoRepository;
    }

    async listar(solicitante, filtros = {}) {
        const idUsuario =
            solicitante.rol === 'admin'
                ? filtros.id_usuario
                    ? Number(filtros.id_usuario)
                    : null
                : solicitante.id_usuario;

        const idPedido = filtros.id_pedido ? Number(filtros.id_pedido) : null;
        return this.pagoRepository.findAll(idUsuario, idPedido);
    }

    async obtenerPorId(id, solicitante) {
        const pago = await this.obtenerPagoAutorizado(id, solicitante);
        const { id_usuario, total_pedido, estado_pedido, ...pagoPublico } = pago;
        return pagoPublico;
    }

    async crear(datos, solicitante) {
        const pedido = await this.pedidoRepository.findById(Number(datos.id_pedido));
        if (!pedido) {
            throw AppError.noEncontrado('Pedido no encontrado');
        }
        if (
            solicitante.rol !== 'admin' &&
            pedido.id_usuario !== solicitante.id_usuario
        ) {
            throw AppError.prohibido('No tienes permisos para pagar este pedido');
        }
        if (pedido.estado === 'cancelado') {
            throw AppError.conflicto('No se puede pagar un pedido cancelado');
        }

        const total = Number(pedido.total);
        const pagado = Number(
            await this.pagoRepository.sumarPagado(pedido.id_pedido)
        );
        const pendiente = Number(
            await this.pagoRepository.sumarPendiente(pedido.id_pedido)
        );
        const saldo = this.redondear(total - pagado);

        if (saldo <= 0) {
            throw AppError.conflicto('El pedido ya está pagado');
        }

        const disponible = this.redondear(saldo - pendiente);
        if (disponible <= 0) {
            throw AppError.conflicto(
                'Ya existe un pago pendiente que cubre el saldo del pedido'
            );
        }

        const monto =
            datos.monto === undefined ? saldo : this.redondear(datos.monto);

        if (monto <= 0) {
            throw AppError.validacion('El monto debe ser mayor a 0');
        }
        if (monto > disponible) {
            throw AppError.validacion(
                `El monto excede el saldo pendiente (${disponible.toFixed(2)})`
            );
        }

        const estado =
            solicitante.rol === 'admin' && datos.estado
                ? datos.estado
                : 'pendiente';

        const pago = await this.pagoRepository.create({
            id_pedido: pedido.id_pedido,
            metodo_pago: datos.metodo_pago,
            monto,
            estado
        });

        return { mensaje: 'Pago registrado exitosamente', pago };
    }

    async actualizarEstado(id, estado) {
        const pago = await this.pagoRepository.updateEstado(Number(id), estado);
        if (!pago) {
            throw AppError.noEncontrado('Pago no encontrado');
        }
        return { mensaje: 'Estado del pago actualizado', pago };
    }

    async eliminar(id, solicitante) {
        const pago = await this.obtenerPagoAutorizado(id, solicitante);
        if (pago.estado === 'completado') {
            throw AppError.conflicto('No se puede eliminar un pago completado');
        }

        const eliminado = await this.pagoRepository.remove(Number(id));
        return { mensaje: 'Pago eliminado correctamente', pago: eliminado };
    }

    async obtenerPagoAutorizado(id, solicitante) {
        const pago = await this.pagoRepository.findByIdConPedido(Number(id));
        if (!pago) {
            throw AppError.noEncontrado('Pago no encontrado');
        }
        if (
            solicitante.rol !== 'admin' &&
            pago.id_usuario !== solicitante.id_usuario
        ) {
            throw AppError.prohibido('No tienes permisos para ver este pago');
        }
        return pago;
    }

    redondear(valor) {
        return Math.round((Number(valor) + Number.EPSILON) * 100) / 100;
    }
}

module.exports = { PagoService };
