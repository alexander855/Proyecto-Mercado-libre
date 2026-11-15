// ====== src/routes/usuario.routes.js ======
// Sólo mapeo HTTP -> servicio. Las reglas de rol/permisos viven en UsuarioService.
const express = require('express');
const { authenticate, authorizeRole } = require('../../middleware/auth');
const { usuarioValidators } = require('../../validators/validators');
const validar = require('../../middleware/validar');

function crearUsuarioRoutes({ usuarioService }) {
    const router = express.Router();

    // Todas las rutas requieren autenticación
    router.use(authenticate);

    // GET - Listar todos los usuarios (solo admin)
    router.get('/', authorizeRole('admin'), async (req, res) => {
        res.json(await usuarioService.listar());
    });

    // GET - Obtener un usuario por ID
    router.get('/:id', usuarioValidators.id, validar, async (req, res) => {
        res.json(await usuarioService.obtenerPorId(req.params.id, req.user));
    });

    // PUT - Actualizar usuario
    router.put('/:id', usuarioValidators.update, validar, async (req, res) => {
        res.json(await usuarioService.actualizar(req.params.id, req.body, req.user));
    });

    // DELETE - Eliminar usuario (solo admin)
    router.delete(
        '/:id',
        authorizeRole('admin'),
        usuarioValidators.id,
        validar,
        async (req, res) => {
            res.json(await usuarioService.eliminar(req.params.id, req.user));
        }
    );

    return router;
}

module.exports = { crearUsuarioRoutes };
