// ====== src/repositories/proveedor.repository.js ======
const { BaseRepository } = require('./base.repository');

class ProveedorRepository extends BaseRepository {
    constructor(pool) {
        super(pool, 'proveedor', 'id_proveedor');
    }

    async findAll() {
        return this.query('SELECT * FROM proveedor ORDER BY id_proveedor');
    }

    async findByEmail(email, exceptoId = null) {
        const filas = exceptoId
            ? await this.query(
                'SELECT * FROM proveedor WHERE email = $1 AND id_proveedor != $2',
                [email, exceptoId]
            )
            : await this.query('SELECT * FROM proveedor WHERE email = $1', [email]);

        return filas[0] ?? null;
    }

    async create(datos) {
        const { nombre, telefono, email, direccion, estado } = datos;
        const filas = await this.query(
            `INSERT INTO proveedor (nombre, telefono, email, direccion, estado, fecha_registro)
             VALUES ($1, $2, $3, $4, $5, NOW())
             RETURNING *`,
            [nombre, telefono, email, direccion, estado]
        );
        return filas[0];
    }

    async update(id, datos) {
        const { nombre, telefono, email, direccion, estado } = datos;
        const filas = await this.query(
            `UPDATE proveedor
             SET nombre = $1,
                 telefono = $2,
                 email = $3,
                 direccion = $4,
                 estado = $5
             WHERE id_proveedor = $6
             RETURNING *`,
            [nombre, telefono, email, direccion, estado, id]
        );
        return filas[0] ?? null;
    }
}

module.exports = { ProveedorRepository };
