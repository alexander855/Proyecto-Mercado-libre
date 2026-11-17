const { BaseRepository } = require('./base.repository');

class PedidoProveedorRepository extends BaseRepository {
    constructor(pool) {
        super(pool, 'pedido_proveedor', 'id_pedido_proveedor');
    }

    async findAllByPedido(idPedido) {
        return this.query(
            `SELECT pp.id_pedido_proveedor,
                    pp.id_pedido,
                    pp.id_proveedor,
                    pr.nombre AS proveedor,
                    pp.subtotal,
                    pp.estado
             FROM pedido_proveedor pp
             INNER JOIN proveedor pr ON pr.id_proveedor = pp.id_proveedor
             WHERE pp.id_pedido = $1
             ORDER BY pp.id_pedido_proveedor`,
            [idPedido]
        );
    }

    async findByIdConPedido(id) {
        const filas = await this.query(
            `SELECT pp.id_pedido_proveedor,
                    pp.id_pedido,
                    pp.id_proveedor,
                    pr.nombre AS proveedor,
                    pp.subtotal,
                    pp.estado,
                    p.id_usuario
             FROM pedido_proveedor pp
             INNER JOIN proveedor pr ON pr.id_proveedor = pp.id_proveedor
             INNER JOIN pedido p ON p.id_pedido = pp.id_pedido
             WHERE pp.id_pedido_proveedor = $1`,
            [id]
        );
        return filas[0] ?? null;
    }

    async findDetalles(idPedidoProveedor) {
        return this.query(
            `SELECT pd.id_detalle,
                    pd.id_pedido_proveedor,
                    pd.id_producto,
                    p.nombre AS producto,
                    p.imagen,
                    pd.cantidad,
                    pd.precio_unitario,
                    pd.subtotal
             FROM pedido_detalle pd
             INNER JOIN producto p ON p.id_producto = pd.id_producto
             WHERE pd.id_pedido_proveedor = $1
             ORDER BY pd.id_detalle`,
            [idPedidoProveedor]
        );
    }

    async findDetalleConPedido(idDetalle) {
        const filas = await this.query(
            `SELECT pd.id_detalle,
                    pd.id_pedido_proveedor,
                    pd.id_producto,
                    pr.nombre AS producto,
                    pr.imagen,
                    pd.cantidad,
                    pd.precio_unitario,
                    pd.subtotal,
                    p.id_usuario
             FROM pedido_detalle pd
             INNER JOIN pedido_proveedor pp ON pp.id_pedido_proveedor = pd.id_pedido_proveedor
             INNER JOIN pedido p ON p.id_pedido = pp.id_pedido
             INNER JOIN producto pr ON pr.id_producto = pd.id_producto
             WHERE pd.id_detalle = $1`,
            [idDetalle]
        );
        return filas[0] ?? null;
    }

    async updateEstado(id, estado) {
        const filas = await this.query(
            `UPDATE pedido_proveedor
             SET estado = $1
             WHERE id_pedido_proveedor = $2
             RETURNING *`,
            [estado, id]
        );
        return filas[0] ?? null;
    }
}

module.exports = { PedidoProveedorRepository };
