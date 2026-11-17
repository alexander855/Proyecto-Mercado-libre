const express = require('express');
const { authenticate } = require('../../middleware/auth');
const { direccionValidators } = require('../../validators/validators');
const validar = require('../../middleware/validar');

function crearDireccionRoutes({ direccionService }) {
    const router = express.Router();

    router.use(authenticate);

    router.get('/', direccionValidators.list, validar, async (req, res) => {
        res.json(await direccionService.listar(req.user, req.query));
    });

    router.post('/', direccionValidators.create, validar, async (req, res) => {
        res.status(201).json(await direccionService.crear(req.body, req.user));
    });

    router.get('/:id', direccionValidators.id, validar, async (req, res) => {
        res.json(await direccionService.obtenerPorId(req.params.id, req.user));
    });

    router.put('/:id', direccionValidators.update, validar, async (req, res) => {
        res.json(await direccionService.actualizar(req.params.id, req.body, req.user));
    });

    router.delete('/:id', direccionValidators.id, validar, async (req, res) => {
        res.json(await direccionService.eliminar(req.params.id, req.user));
    });

    return router;
}

module.exports = { crearDireccionRoutes };
