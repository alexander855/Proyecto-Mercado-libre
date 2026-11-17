const { BaseRepository } = require('./base.repository');

class CarritoRepository extends BaseRepository {
    constructor(pool) {
        super(pool, 'carrito', 'id_carrito');
    }

    async findAll(idUsuario = null, estado = null) {
        return this.query(
            `SELECT * FROM carrito
             WHERE ($1::int IS NULL OR id_usuario = $1)
               AND ($2::text IS NULL OR estado = $2)
             ORDER BY id_carrito`,
            [idUsuario, estado]
        );
    }

    async findActivoByUsuario(idUsuario) {
        const filas = await this.query(
            `SELECT * FROM carrito
             WHERE id_usuario = $1 AND estado = 'activo'
             ORDER BY id_carrito DESC
             LIMIT 1`,
            [idUsuario]
        );
        return filas[0] ?? null;
    }

    async create(idUsuario) {
        const filas = await this.query(
            `INSERT INTO carrito (id_usuario, estado)
             VALUES ($1, 'activo')
             RETURNING *`,
            [idUsuario]
        );
        return filas[0];
    }

    async update(id, datos) {
        const { estado } = datos;
        const filas = await this.query(
            `UPDATE carrito
             SET estado = COALESCE($1, estado)
             WHERE id_carrito = $2
             RETURNING *`,
            [estado, id]
        );
        return filas[0] ?? null;
    }

    async removeWithItems(id) {
        return this.transaction(async (client) => {
            await client.query('DELETE FROM carrito_detalle WHERE id_carrito = $1', [id]);
            const resultado = await client.query(
                'DELETE FROM carrito WHERE id_carrito = $1 RETURNING *',
                [id]
            );
            return resultado.rows[0] ?? null;
        });
    }

    async findDetalles(idCarrito) {
        return this.query(
            `SELECT cd.id_detalle,
                    cd.id_carrito,
                    cd.id_producto,
                    p.nombre,
                    p.imagen,
                    p.precio,
                    p.stock,
                    p.estado AS estado_producto,
                    cd.cantidad,
                    (p.precio * cd.cantidad)::numeric(10,2) AS subtotal
             FROM carrito_detalle cd
             INNER JOIN producto p ON p.id_producto = cd.id_producto
             WHERE cd.id_carrito = $1
             ORDER BY cd.id_detalle`,
            [idCarrito]
        );
    }

    async findDetalleById(idCarrito, idDetalle) {
        const filas = await this.query(
            `SELECT * FROM carrito_detalle
             WHERE id_carrito = $1 AND id_detalle = $2`,
            [idCarrito, idDetalle]
        );
        return filas[0] ?? null;
    }

    async findDetalleByProducto(idCarrito, idProducto) {
        const filas = await this.query(
            `SELECT * FROM carrito_detalle
             WHERE id_carrito = $1 AND id_producto = $2`,
            [idCarrito, idProducto]
        );
        return filas[0] ?? null;
    }

    async addDetalle({ id_carrito, id_producto, cantidad }) {
        const filas = await this.query(
            `INSERT INTO carrito_detalle (id_carrito, id_producto, cantidad)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [id_carrito, id_producto, cantidad]
        );
        return filas[0];
    }

    async updateDetalleCantidad(idCarrito, idDetalle, cantidad) {
        const filas = await this.query(
            `UPDATE carrito_detalle
             SET cantidad = $1
             WHERE id_carrito = $2 AND id_detalle = $3
             RETURNING *`,
            [cantidad, idCarrito, idDetalle]
        );
        return filas[0] ?? null;
    }

    async removeDetalle(idCarrito, idDetalle) {
        const filas = await this.query(
            `DELETE FROM carrito_detalle
             WHERE id_carrito = $1 AND id_detalle = $2
             RETURNING *`,
            [idCarrito, idDetalle]
        );
        return filas[0] ?? null;
    }
}

module.exports = { CarritoRepository };
