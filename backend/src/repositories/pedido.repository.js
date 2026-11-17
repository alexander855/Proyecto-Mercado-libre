const { BaseRepository } = require('./base.repository');
const { AppError } = require('../errors/AppError');

function redondear(valor) {
    return Math.round((Number(valor) + Number.EPSILON) * 100) / 100;
}

class PedidoRepository extends BaseRepository {
    constructor(pool) {
        super(pool, 'pedido', 'id_pedido');
    }

    async findAll(idUsuario = null, estado = null) {
        return this.query(
            `SELECT * FROM pedido
             WHERE ($1::int IS NULL OR id_usuario = $1)
               AND ($2::text IS NULL OR estado = $2)
             ORDER BY id_pedido`,
            [idUsuario, estado]
        );
    }

    async findByIdConDetalles(id) {
        const pedido = await this.findById(Number(id));
        if (!pedido) {
            return null;
        }

        const proveedores = await this.query(
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
            [id]
        );

        const detalles = await this.query(
            `SELECT pd.id_detalle,
                    pd.id_pedido_proveedor,
                    pd.id_producto,
                    p.nombre AS producto,
                    p.imagen,
                    pd.cantidad,
                    pd.precio_unitario,
                    pd.subtotal
             FROM pedido_detalle pd
             INNER JOIN pedido_proveedor pp ON pp.id_pedido_proveedor = pd.id_pedido_proveedor
             INNER JOIN producto p ON p.id_producto = pd.id_producto
             WHERE pp.id_pedido = $1
             ORDER BY pd.id_detalle`,
            [id]
        );

        return {
            ...pedido,
            proveedores: proveedores.map((proveedor) => ({
                ...proveedor,
                detalles: detalles.filter(
                    (detalle) =>
                        detalle.id_pedido_proveedor === proveedor.id_pedido_proveedor
                )
            }))
        };
    }

    async crearDesdeCarrito({ idUsuario, idDireccion, costoEnvio = 0, descuento = 0 }) {
        return this.transaction(async (client) => {
            const direccion = await client.query(
                `SELECT id_direccion FROM direccion
                 WHERE id_direccion = $1 AND id_usuario = $2`,
                [idDireccion, idUsuario]
            );
            if (!direccion.rows[0]) {
                throw AppError.validacion('La dirección no pertenece al usuario');
            }

            const carritoResultado = await client.query(
                `SELECT * FROM carrito
                 WHERE id_usuario = $1 AND estado = 'activo'
                 ORDER BY id_carrito DESC
                 LIMIT 1
                 FOR UPDATE`,
                [idUsuario]
            );
            const carrito = carritoResultado.rows[0];
            if (!carrito) {
                throw AppError.validacion('No hay un carrito activo para crear el pedido');
            }

            const itemsResultado = await client.query(
                `SELECT cd.id_producto,
                        cd.cantidad,
                        p.nombre,
                        p.precio,
                        p.stock,
                        p.estado,
                        p.id_proveedor
                 FROM carrito_detalle cd
                 INNER JOIN producto p ON p.id_producto = cd.id_producto
                 WHERE cd.id_carrito = $1
                 ORDER BY p.id_producto, cd.id_detalle
                 FOR UPDATE OF p, cd`,
                [carrito.id_carrito]
            );
            const items = itemsResultado.rows;
            if (items.length === 0) {
                throw AppError.validacion('El carrito está vacío');
            }

            for (const item of items) {
                if (item.estado === 'agotado' || Number(item.stock) < item.cantidad) {
                    throw AppError.conflicto(
                        `Stock insuficiente para "${item.nombre}"`
                    );
                }
            }

            const subtotalProductos = redondear(
                items.reduce(
                    (total, item) => total + Number(item.precio) * item.cantidad,
                    0
                )
            );
            const envio = redondear(costoEnvio);
            const descuentoAplicado = redondear(descuento);
            const total = redondear(subtotalProductos + envio - descuentoAplicado);

            if (total < 0) {
                throw AppError.validacion(
                    'El descuento no puede superar el subtotal más el envío'
                );
            }

            const pedidoResultado = await client.query(
                `INSERT INTO pedido
                    (id_usuario, id_direccion, estado, subtotal_productos, costo_envio, descuento, total)
                 VALUES ($1, $2, 'pendiente', $3, $4, $5, $6)
                 RETURNING *`,
                [idUsuario, idDireccion, subtotalProductos, envio, descuentoAplicado, total]
            );
            const pedido = pedidoResultado.rows[0];

            const grupos = new Map();
            for (const item of items) {
                const subtotal = redondear(Number(item.precio) * item.cantidad);
                if (!grupos.has(item.id_proveedor)) {
                    grupos.set(item.id_proveedor, { subtotal: 0, items: [] });
                }
                const grupo = grupos.get(item.id_proveedor);
                grupo.subtotal = redondear(grupo.subtotal + subtotal);
                grupo.items.push({
                    id_producto: item.id_producto,
                    cantidad: item.cantidad,
                    precio_unitario: Number(item.precio),
                    subtotal
                });
            }

            for (const [idProveedor, grupo] of grupos) {
                const proveedorResultado = await client.query(
                    `INSERT INTO pedido_proveedor
                        (id_pedido, id_proveedor, subtotal, estado)
                     VALUES ($1, $2, $3, 'pendiente')
                     RETURNING id_pedido_proveedor`,
                    [pedido.id_pedido, idProveedor, grupo.subtotal]
                );
                const idPedidoProveedor = proveedorResultado.rows[0].id_pedido_proveedor;

                for (const item of grupo.items) {
                    await client.query(
                        `INSERT INTO pedido_detalle
                            (id_pedido_proveedor, id_producto, cantidad, precio_unitario, subtotal)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [
                            idPedidoProveedor,
                            item.id_producto,
                            item.cantidad,
                            item.precio_unitario,
                            item.subtotal
                        ]
                    );
                }
            }

            for (const item of items) {
                await client.query(
                    `UPDATE producto
                     SET stock = stock - $1,
                         estado = CASE WHEN stock - $1 <= 0 THEN 'agotado' ELSE estado END
                     WHERE id_producto = $2`,
                    [item.cantidad, item.id_producto]
                );
            }

            await client.query(
                `UPDATE carrito SET estado = 'convertido' WHERE id_carrito = $1`,
                [carrito.id_carrito]
            );

            return pedido;
        });
    }

    async cambiarEstado(id, estado) {
        return this.transaction(async (client) => {
            const pedidoResultado = await client.query(
                'SELECT * FROM pedido WHERE id_pedido = $1 FOR UPDATE',
                [id]
            );
            const pedido = pedidoResultado.rows[0];
            if (!pedido) {
                return null;
            }
            if (pedido.estado === estado) {
                return pedido;
            }
            if (pedido.estado === 'cancelado' && estado !== 'cancelado') {
                throw AppError.conflicto('Un pedido cancelado no puede reactivarse');
            }

            if (estado === 'cancelado' && pedido.estado !== 'cancelado') {
                await this.restaurarStock(client, id);
                await client.query(
                    `UPDATE pedido_proveedor SET estado = 'cancelado' WHERE id_pedido = $1`,
                    [id]
                );
            }

            const actualizado = await client.query(
                `UPDATE pedido SET estado = $1 WHERE id_pedido = $2 RETURNING *`,
                [estado, id]
            );
            return actualizado.rows[0];
        });
    }

    async eliminar(id) {
        return this.transaction(async (client) => {
            const pedidoResultado = await client.query(
                'SELECT * FROM pedido WHERE id_pedido = $1 FOR UPDATE',
                [id]
            );
            const pedido = pedidoResultado.rows[0];
            if (!pedido) {
                return null;
            }
            if (!['pendiente', 'cancelado'].includes(pedido.estado)) {
                throw AppError.conflicto(
                    'Solo se pueden eliminar pedidos pendientes o cancelados'
                );
            }

            const pagos = await client.query(
                'SELECT COUNT(*)::int AS total FROM pago WHERE id_pedido = $1',
                [id]
            );
            if (pagos.rows[0].total > 0) {
                throw AppError.conflicto(
                    'No se puede eliminar un pedido con pagos registrados'
                );
            }

            if (pedido.estado === 'pendiente') {
                await this.restaurarStock(client, id);
            }

            await client.query(
                `DELETE FROM pedido_detalle
                 WHERE id_pedido_proveedor IN (
                     SELECT id_pedido_proveedor FROM pedido_proveedor WHERE id_pedido = $1
                 )`,
                [id]
            );
            await client.query(
                'DELETE FROM pedido_proveedor WHERE id_pedido = $1',
                [id]
            );
            const eliminado = await client.query(
                'DELETE FROM pedido WHERE id_pedido = $1 RETURNING *',
                [id]
            );
            return eliminado.rows[0];
        });
    }

    async restaurarStock(client, idPedido) {
        const detalles = await client.query(
            `SELECT pd.id_producto, pd.cantidad
             FROM pedido_detalle pd
             INNER JOIN pedido_proveedor pp ON pp.id_pedido_proveedor = pd.id_pedido_proveedor
             WHERE pp.id_pedido = $1
             ORDER BY pd.id_producto`,
            [idPedido]
        );

        for (const detalle of detalles.rows) {
            await client.query(
                `UPDATE producto
                 SET stock = stock + $1,
                     estado = CASE WHEN estado = 'agotado' THEN 'disponible' ELSE estado END
                 WHERE id_producto = $2`,
                [detalle.cantidad, detalle.id_producto]
            );
        }
    }
}

module.exports = { PedidoRepository };
