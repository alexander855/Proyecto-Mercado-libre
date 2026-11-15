// ====== src/services/categoria.service.js ======
const { AppError } = require('../errors/AppError');

class CategoriaService {
    constructor({ categoriaRepository }) {
        this.categoriaRepository = categoriaRepository;
    }

    async listar() {
        return this.categoriaRepository.findAll();
    }

    async obtenerPorId(id) {
        const categoria = await this.categoriaRepository.findById(Number(id));
        if (!categoria) {
            throw AppError.noEncontrado('Categoría no encontrada');
        }
        return categoria;
    }

    async crear(datos) {
        const duplicada = await this.categoriaRepository.findByNombre(datos.nombre);
        if (duplicada) {
            throw AppError.conflicto('Ya existe una categoría con ese nombre');
        }

        const categoria = await this.categoriaRepository.create(datos);
        return { mensaje: 'Categoría creada exitosamente', categoria };
    }

    async actualizar(id, datos) {
        const idCategoria = Number(id);

        if (datos.nombre) {
            const duplicada = await this.categoriaRepository.findByNombre(datos.nombre, idCategoria);
            if (duplicada) {
                throw AppError.conflicto('Ya existe otra categoría con ese nombre');
            }
        }

        const categoria = await this.categoriaRepository.update(idCategoria, datos);
        if (!categoria) {
            throw AppError.noEncontrado('Categoría no encontrada');
        }

        return { mensaje: 'Categoría actualizada exitosamente', categoria };
    }

    async eliminar(id) {
        const categoria = await this.categoriaRepository.remove(Number(id));
        if (!categoria) {
            throw AppError.noEncontrado('Categoría no encontrada');
        }
        return { mensaje: 'Categoría eliminada correctamente', categoria };
    }
}

module.exports = { CategoriaService };
