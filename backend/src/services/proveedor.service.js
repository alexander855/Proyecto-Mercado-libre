// ====== src/services/proveedor.service.js ======
const { AppError } = require('../errors/AppError');

class ProveedorService {
    constructor({ proveedorRepository }) {
        this.proveedorRepository = proveedorRepository;
    }

    async listar() {
        return this.proveedorRepository.findAll();
    }

    async obtenerPorId(id) {
        const proveedor = await this.proveedorRepository.findById(Number(id));
        if (!proveedor) {
            throw AppError.noEncontrado('Proveedor no encontrado');
        }
        return proveedor;
    }

    async crear(datos) {
        // Antes la verificación de email se hacía DESPUÉS del INSERT (código muerto).
        if (datos.email) {
            const duplicado = await this.proveedorRepository.findByEmail(datos.email);
            if (duplicado) {
                throw AppError.conflicto('Este email ya está registrado');
            }
        }

        const proveedor = await this.proveedorRepository.create(datos);
        return { mensaje: 'Proveedor creado exitosamente', proveedor };
    }

    async actualizar(id, datos) {
        const idProveedor = Number(id);

        if (datos.email) {
            const duplicado = await this.proveedorRepository.findByEmail(datos.email, idProveedor);
            if (duplicado) {
                throw AppError.conflicto('Este email ya está registrado por otro proveedor');
            }
        }

        const proveedor = await this.proveedorRepository.update(idProveedor, datos);
        if (!proveedor) {
            throw AppError.noEncontrado('Proveedor no encontrado');
        }

        return proveedor;
    }

    async eliminar(id) {
        const proveedor = await this.proveedorRepository.remove(Number(id));
        if (!proveedor) {
            throw AppError.noEncontrado('Proveedor no encontrado');
        }
        return { mensaje: 'Proveedor eliminado correctamente', proveedor };
    }
}

module.exports = { ProveedorService };
