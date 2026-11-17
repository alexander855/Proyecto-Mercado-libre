// ====== src/routes/proveedor.routes.js ======
const express = require('express');
const { authenticate, authorizeRole } = require('../../middleware/auth');
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

    // POST - Crear proveedor (solo admin/vendedor)
    router.post(
        '/',
        authenticate,
        authorizeRole('admin', 'vendedor'),
        proveedorValidators.create,
        validar,
        async (req, res) => {
            res.status(201).json(await proveedorService.crear(req.body));
        }
    );

    // PUT - Actualizar proveedor (solo admin/vendedor)
    router.put(
        '/:id',
        authenticate,
        authorizeRole('admin', 'vendedor'),
        proveedorValidators.update,
        validar,
        async (req, res) => {
            res.json(await proveedorService.actualizar(req.params.id, req.body));
        }
    );

    // DELETE - Eliminar proveedor (solo admin)
    router.delete(
        '/:id',
        authenticate,
        authorizeRole('admin'),
        proveedorValidators.id,
        validar,
        async (req, res) => {
            res.json(await proveedorService.eliminar(req.params.id));
        }
    );

    return router;
}

module.exports = { crearProveedorRoutes };
