// ====== src/routes/producto.routes.js ======
const express = require('express');
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

    // POST - Crear producto
    router.post('/', productoValidators.create, validar, async (req, res) => {
        res.status(201).json(await productoService.crear(req.body));
    });

    // PUT - Actualizar producto
    router.put('/:id', productoValidators.update, validar, async (req, res) => {
        res.json(await productoService.actualizar(req.params.id, req.body));
    });

    // DELETE - Eliminar producto
    router.delete('/:id', productoValidators.id, validar, async (req, res) => {
        res.json(await productoService.eliminar(req.params.id));
    });

    return router;
}

module.exports = { crearProductoRoutes };
