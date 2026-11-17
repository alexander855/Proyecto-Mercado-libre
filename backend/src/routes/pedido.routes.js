const express = require('express');
const { authenticate, authorizeRole } = require('../../middleware/auth');
const { pedidoValidators } = require('../../validators/validators');
const validar = require('../../middleware/validar');

function crearPedidoRoutes({ pedidoService }) {
    const router = express.Router();

    router.use(authenticate);

    router.get('/', pedidoValidators.list, validar, async (req, res) => {
        res.json(await pedidoService.listar(req.user, req.query));
    });

    router.post('/', pedidoValidators.create, validar, async (req, res) => {
        res.status(201).json(await pedidoService.crear(req.body, req.user));
    });

    router.get('/:id/proveedores', pedidoValidators.id, validar, async (req, res) => {
        res.json(await pedidoService.listarProveedores(req.params.id, req.user));
    });

    router.get('/:id', pedidoValidators.id, validar, async (req, res) => {
        res.json(await pedidoService.obtenerPorId(req.params.id, req.user));
    });

    router.put(
        '/:id',
        authorizeRole('admin'),
        pedidoValidators.update,
        validar,
        async (req, res) => {
            res.json(
                await pedidoService.actualizarEstado(req.params.id, req.body.estado)
            );
        }
    );

    router.delete(
        '/:id',
        authorizeRole('admin'),
        pedidoValidators.id,
        validar,
        async (req, res) => {
            res.json(await pedidoService.eliminar(req.params.id));
        }
    );

    return router;
}

module.exports = { crearPedidoRoutes };
