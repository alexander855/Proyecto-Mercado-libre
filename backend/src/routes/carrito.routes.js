const express = require('express');
const { authenticate } = require('../../middleware/auth');
const { carritoValidators } = require('../../validators/validators');
const validar = require('../../middleware/validar');

function crearCarritoRoutes({ carritoService }) {
    const router = express.Router();

    router.use(authenticate);

    router.get('/', carritoValidators.list, validar, async (req, res) => {
        res.json(await carritoService.listar(req.user, req.query));
    });

    router.post('/', async (req, res) => {
        const { creado, ...resultado } = await carritoService.crear(req.user);
        res.status(creado ? 201 : 200).json(resultado);
    });

    router.get('/activo', async (req, res) => {
        res.json(await carritoService.obtenerActivo(req.user));
    });

    router.get('/:id', carritoValidators.id, validar, async (req, res) => {
        res.json(await carritoService.obtenerPorId(req.params.id, req.user));
    });

    router.put('/:id', carritoValidators.update, validar, async (req, res) => {
        res.json(await carritoService.actualizar(req.params.id, req.body, req.user));
    });

    router.delete('/:id', carritoValidators.id, validar, async (req, res) => {
        res.json(await carritoService.eliminar(req.params.id, req.user));
    });

    router.get('/:id/items', carritoValidators.id, validar, async (req, res) => {
        res.json(await carritoService.listarDetalles(req.params.id, req.user));
    });

    router.post('/:id/items', carritoValidators.itemCreate, validar, async (req, res) => {
        res.status(201).json(
            await carritoService.agregarDetalle(req.params.id, req.body, req.user)
        );
    });

    router.put(
        '/:id/items/:idDetalle',
        carritoValidators.itemUpdate,
        validar,
        async (req, res) => {
            res.json(
                await carritoService.actualizarDetalle(
                    req.params.id,
                    req.params.idDetalle,
                    req.body,
                    req.user
                )
            );
        }
    );

    router.delete(
        '/:id/items/:idDetalle',
        carritoValidators.itemIds,
        validar,
        async (req, res) => {
            res.json(
                await carritoService.eliminarDetalle(
                    req.params.id,
                    req.params.idDetalle,
                    req.user
                )
            );
        }
    );

    return router;
}

module.exports = { crearCarritoRoutes };
