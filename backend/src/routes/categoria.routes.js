// ====== src/routes/categoria.routes.js ======
const express = require('express');
const { authenticate, authorizeRole } = require('../../middleware/auth');
const { categoriaValidators } = require('../../validators/validators');
const validar = require('../../middleware/validar');

function crearCategoriaRoutes({ categoriaService }) {
    const router = express.Router();

    // GET - Listar categorías
    router.get('/', async (req, res) => {
        res.json(await categoriaService.listar());
    });

    // GET - Obtener una categoría por ID
    router.get('/:id', categoriaValidators.id, validar, async (req, res) => {
        res.json(await categoriaService.obtenerPorId(req.params.id));
    });

    // POST - Crear categoría (solo admin/vendedor)
    router.post(
        '/',
        authenticate,
        authorizeRole('admin', 'vendedor'),
        categoriaValidators.create,
        validar,
        async (req, res) => {
            res.status(201).json(await categoriaService.crear(req.body));
        }
    );

    // PUT - Actualizar categoría (solo admin/vendedor)
    router.put(
        '/:id',
        authenticate,
        authorizeRole('admin', 'vendedor'),
        categoriaValidators.update,
        validar,
        async (req, res) => {
            res.json(await categoriaService.actualizar(req.params.id, req.body));
        }
    );

    // DELETE - Eliminar categoría (solo admin)
    router.delete(
        '/:id',
        authenticate,
        authorizeRole('admin'),
        categoriaValidators.id,
        validar,
        async (req, res) => {
            res.json(await categoriaService.eliminar(req.params.id));
        }
    );

    return router;
}

module.exports = { crearCategoriaRoutes };
