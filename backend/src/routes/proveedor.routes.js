// ====== src/routes/proveedor.routes.js ======
const express = require('express');
const { proveedorValidators } = require('../../validators/validators');
const validar = require('../../middleware/validar');

function crearProveedorRoutes({ proveedorService }) {
    const router = express.Router();

    // GET - Listar proveedores
    router.get('/', async (req, res) => {
        res.json(await proveedorService.listar());
    });

    // GET - Obtener un proveedor por ID
    router.get('/:id', proveedorValidators.id, validar, async (req, res) => {
        res.json(await proveedorService.obtenerPorId(req.params.id));
    });

    // POST - Crear proveedor
    router.post('/', proveedorValidators.create, validar, async (req, res) => {
        res.status(201).json(await proveedorService.crear(req.body));
    });

    // PUT - Actualizar proveedor
    router.put('/:id', proveedorValidators.update, validar, async (req, res) => {
        res.json(await proveedorService.actualizar(req.params.id, req.body));
    });

    // DELETE - Eliminar proveedor
    router.delete('/:id', proveedorValidators.id, validar, async (req, res) => {
        res.json(await proveedorService.eliminar(req.params.id));
    });

    return router;
}

module.exports = { crearProveedorRoutes };
