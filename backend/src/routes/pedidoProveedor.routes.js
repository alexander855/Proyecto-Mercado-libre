const express = require('express');
const { authenticate, authorizeRole } = require('../../middleware/auth');
const { pedidoProveedorValidators } = require('../../validators/validators');
const validar = require('../../middleware/validar');

function crearPedidoProveedorRoutes({ pedidoService }) {
    const router = express.Router();

    router.use(authenticate);

    router.get('/:id/detalles', pedidoProveedorValidators.id, validar, async (req, res) => {
        res.json(
            await pedidoService.listarDetallesProveedor(req.params.id, req.user)
        );
    });

    router.get(
        '/:id/detalles/:idDetalle',
        pedidoProveedorValidators.detalle,
        validar,
        async (req, res) => {
            res.json(
                await pedidoService.obtenerDetalle(req.params.idDetalle, req.user)
            );
        }
    );

    router.get('/:id', pedidoProveedorValidators.id, validar, async (req, res) => {
        res.json(await pedidoService.obtenerProveedor(req.params.id, req.user));
    });

    router.put(
        '/:id',
        authorizeRole('admin'),
        pedidoProveedorValidators.update,
        validar,
        async (req, res) => {
            res.json(
                await pedidoService.actualizarEstadoProveedor(
                    req.params.id,
                    req.body.estado
                )
            );
        }
    );

    return router;
}

module.exports = { crearPedidoProveedorRoutes };
