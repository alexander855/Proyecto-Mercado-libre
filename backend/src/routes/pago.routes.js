const express = require('express');
const { authenticate, authorizeRole } = require('../../middleware/auth');
const { pagoValidators } = require('../../validators/validators');
const validar = require('../../middleware/validar');

function crearPagoRoutes({ pagoService }) {
    const router = express.Router();

    router.use(authenticate);

    router.get('/', pagoValidators.list, validar, async (req, res) => {
        res.json(await pagoService.listar(req.user, req.query));
    });

    router.post('/', pagoValidators.create, validar, async (req, res) => {
        res.status(201).json(await pagoService.crear(req.body, req.user));
    });

    router.get('/:id', pagoValidators.id, validar, async (req, res) => {
        res.json(await pagoService.obtenerPorId(req.params.id, req.user));
    });

    router.put(
        '/:id',
        authorizeRole('admin'),
        pagoValidators.update,
        validar,
        async (req, res) => {
            res.json(
                await pagoService.actualizarEstado(req.params.id, req.body.estado)
            );
        }
    );

    router.delete(
        '/:id',
        authorizeRole('admin'),
        pagoValidators.id,
        validar,
        async (req, res) => {
            res.json(await pagoService.eliminar(req.params.id, req.user));
        }
    );

    return router;
}

module.exports = { crearPagoRoutes };
