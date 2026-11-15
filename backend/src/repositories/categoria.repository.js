// ====== src/repositories/categoria.repository.js ======
const { BaseRepository } = require('./base.repository');

class CategoriaRepository extends BaseRepository {
    constructor(pool) {
        super(pool, 'categoria', 'id_categoria');
    }

    async findAll() {
        return this.query('SELECT * FROM categoria ORDER BY id_categoria');
    }

    async findByNombre(nombre, exceptoId = null) {
        const filas = exceptoId
            ? await this.query(
                'SELECT * FROM categoria WHERE LOWER(nombre) = LOWER($1) AND id_categoria != $2',
                [nombre, exceptoId]
            )
            : await this.query('SELECT * FROM categoria WHERE LOWER(nombre) = LOWER($1)', [nombre]);

        return filas[0] ?? null;
    }

    async create({ nombre, descripcion, estado = 'activo' }) {
        const filas = await this.query(
            `INSERT INTO categoria (nombre, descripcion, estado)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [nombre, descripcion, estado]
        );
        return filas[0];
    }

    async update(id, datos) {
        const { nombre, descripcion, estado } = datos;
        const filas = await this.query(
            `UPDATE categoria
             SET nombre = COALESCE($1, nombre),
                 descripcion = COALESCE($2, descripcion),
                 estado = COALESCE($3, estado)
             WHERE id_categoria = $4
             RETURNING *`,
            [nombre, descripcion, estado, id]
        );
        return filas[0] ?? null;
    }
}

module.exports = { CategoriaRepository };
