// ====== src/services/producto.service.js ======
const { AppError } = require('../errors/AppError');

class ProductoService {
    constructor({ productoRepository }) {
        this.productoRepository = productoRepository;
    }

    async listar() {
        return this.productoRepository.findAll();
    }

    async obtenerPorId(id) {
        const producto = await this.productoRepository.findById(Number(id));
        if (!producto) {
            throw AppError.noEncontrado('Producto no encontrado');
        }
        return producto;
    }

    async crear(datos) {
        return this.productoRepository.create(datos);
    }

    async actualizar(id, datos) {
        const producto = await this.productoRepository.update(Number(id), datos);
        if (!producto) {
            throw AppError.noEncontrado('Producto no encontrado');
        }
        return producto;
    }

    async eliminar(id) {
        const producto = await this.productoRepository.remove(Number(id));
        if (!producto) {
            throw AppError.noEncontrado('Producto no encontrado');
        }
        return { mensaje: 'Producto eliminado correctamente', producto };
    }
}

module.exports = { ProductoService };
