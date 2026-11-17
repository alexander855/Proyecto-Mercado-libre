const { AppError } = require('../errors/AppError');

class DireccionService {
    constructor({ direccionRepository }) {
        this.direccionRepository = direccionRepository;
    }

    async listar(solicitante, filtros = {}) {
        const idUsuario =
            solicitante.rol === 'admin'
                ? filtros.id_usuario
                    ? Number(filtros.id_usuario)
                    : null
                : solicitante.id_usuario;

        return this.direccionRepository.findAll(idUsuario);
    }

    async obtenerPorId(id, solicitante) {
        const direccion = await this.direccionRepository.findById(Number(id));
        if (!direccion) {
            throw AppError.noEncontrado('Dirección no encontrada');
        }
        this.verificarPropietario(direccion, solicitante);
        return direccion;
    }

    async crear(datos, solicitante) {
        const idUsuario =
            solicitante.rol === 'admin' && datos.id_usuario
                ? Number(datos.id_usuario)
                : solicitante.id_usuario;

        const direccion = await this.direccionRepository.create({
            ...datos,
            id_usuario: idUsuario
        });

        return { mensaje: 'Dirección creada exitosamente', direccion };
    }

    async actualizar(id, datos, solicitante) {
        const direccionActual = await this.direccionRepository.findById(Number(id));
        if (!direccionActual) {
            throw AppError.noEncontrado('Dirección no encontrada');
        }
        this.verificarPropietario(direccionActual, solicitante);

        const { id_usuario, ...permitidos } = datos;
        const direccion = await this.direccionRepository.update(Number(id), permitidos);

        return { mensaje: 'Dirección actualizada exitosamente', direccion };
    }

    async eliminar(id, solicitante) {
        const direccionActual = await this.direccionRepository.findById(Number(id));
        if (!direccionActual) {
            throw AppError.noEncontrado('Dirección no encontrada');
        }
        this.verificarPropietario(direccionActual, solicitante);

        const direccion = await this.direccionRepository.remove(Number(id));
        return { mensaje: 'Dirección eliminada correctamente', direccion };
    }

    verificarPropietario(direccion, solicitante) {
        if (
            solicitante.rol !== 'admin' &&
            direccion.id_usuario !== solicitante.id_usuario
        ) {
            throw AppError.prohibido('No tienes permisos para acceder a esta dirección');
        }
    }
}

module.exports = { DireccionService };
