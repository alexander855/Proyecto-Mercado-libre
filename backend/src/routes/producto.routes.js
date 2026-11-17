// ====== src/routes/producto.routes.js ======
const express = require('express');
const { authenticate, authorizeRole } = require('../../middleware/auth');
const { productoValidators } = require('../../validators/validators');
const validar = require('../../middleware/validar');

function crearProductoRoutes({ productoService }) {
    const router = express.Router();

    // GET - Listar todos los productos
    router.get('/', async (req, res) => {
        res.json(await productoService.listar());
    });

    // GET - Obtener un producto por ID
    router.get('/:id', productoValidators.id, validar, async (req, res) => {
        res.json(await productoService.obtenerPorId(req.params.id));
    });

    // POST - Crear producto (solo admin/vendedor)
    router.post(
        '/',
        authenticate,
        authorizeRole('admin', 'vendedor'),
        productoValidators.create,
        validar,
        async (req, res) => {
            res.status(201).json(await productoService.crear(req.body));
        }
    );

    // PUT - Actualizar producto (solo admin/vendedor)
    router.put(
        '/:id',
        authenticate,
        authorizeRole('admin', 'vendedor'),
        productoValidators.update,
        validar,
        async (req, res) => {
            res.json(await productoService.actualizar(req.params.id, req.body));
        }
    );

    // DELETE - Eliminar producto (solo admin)
    router.delete(
        '/:id',
        authenticate,
        authorizeRole('admin'),
        productoValidators.id,
        validar,
        async (req, res) => {
            res.json(await productoService.eliminar(req.params.id));
        }
    );

    return router;
}

module.exports = { crearProductoRoutes };
