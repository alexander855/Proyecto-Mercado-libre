const { BaseRepository } = require('./base.repository');

class PagoRepository extends BaseRepository {
    constructor(pool) {
        super(pool, 'pago', 'id_pago');
    }

    async findAll(idUsuario = null, idPedido = null) {
        return this.query(
            `SELECT pg.*
             FROM pago pg
             INNER JOIN pedido p ON p.id_pedido = pg.id_pedido
             WHERE ($1::int IS NULL OR p.id_usuario = $1)
               AND ($2::int IS NULL OR pg.id_pedido = $2)
             ORDER BY pg.id_pago`,
            [idUsuario, idPedido]
        );
    }

    async findByIdConPedido(id) {
        const filas = await this.query(
            `SELECT pg.*,
                    p.id_usuario,
                    p.total AS total_pedido,
                    p.estado AS estado_pedido
             FROM pago pg
             INNER JOIN pedido p ON p.id_pedido = pg.id_pedido
             WHERE pg.id_pago = $1`,
            [id]
        );
        return filas[0] ?? null;
    }

    async sumarPorEstados(idPedido, estados) {
        const filas = await this.query(
            `SELECT COALESCE(SUM(monto), 0)::numeric(10,2) AS total
             FROM pago
             WHERE id_pedido = $1
               AND estado = ANY($2::text[])`,
            [idPedido, estados]
        );
        return filas[0].total;
    }

    // Solo los pagos completados cuentan como dinero cobrado.
    async sumarPagado(idPedido) {
        return this.sumarPorEstados(idPedido, ['completado']);
    }

    // Los pagos pendientes se reservan para no permitir sobrepagos.
    async sumarPendiente(idPedido) {
        return this.sumarPorEstados(idPedido, ['pendiente']);
    }

    async create({ id_pedido, metodo_pago, monto, estado = 'pendiente' }) {
        const filas = await this.query(
            `INSERT INTO pago (id_pedido, metodo_pago, monto, estado)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [id_pedido, metodo_pago, monto, estado]
        );
        return filas[0];
    }

    async updateEstado(id, estado) {
        const filas = await this.query(
            `UPDATE pago SET estado = $1 WHERE id_pago = $2 RETURNING *`,
            [estado, id]
        );
        return filas[0] ?? null;
    }
}

module.exports = { PagoRepository };
