const { BaseRepository } = require('./base.repository');

class DireccionRepository extends BaseRepository {
    constructor(pool) {
        super(pool, 'direccion', 'id_direccion');
    }

    async findAll(idUsuario = null) {
        if (idUsuario) {
            return this.query(
                'SELECT * FROM direccion WHERE id_usuario = $1 ORDER BY id_direccion',
                [idUsuario]
            );
        }
        return super.findAll();
    }

    async create({ id_usuario, departamento, ciudad, zona, direccion, referencia, telefono }) {
        const filas = await this.query(
            `INSERT INTO direccion
                (id_usuario, departamento, ciudad, zona, direccion, referencia, telefono)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [id_usuario, departamento, ciudad, zona, direccion, referencia, telefono]
        );
        return filas[0];
    }

    async update(id, datos) {
        const { departamento, ciudad, zona, direccion, referencia, telefono } = datos;
        const filas = await this.query(
            `UPDATE direccion
             SET departamento = COALESCE($1, departamento),
                 ciudad = COALESCE($2, ciudad),
                 zona = COALESCE($3, zona),
                 direccion = COALESCE($4, direccion),
                 referencia = COALESCE($5, referencia),
                 telefono = COALESCE($6, telefono)
             WHERE id_direccion = $7
             RETURNING *`,
            [departamento, ciudad, zona, direccion, referencia, telefono, id]
        );
        return filas[0] ?? null;
    }
}

module.exports = { DireccionRepository };
