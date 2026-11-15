// ====== src/routes/auth.routes.js ======
// Sólo mapeo HTTP -> servicio. No conoce la BD ni las reglas de negocio.
const express = require('express');
const { authenticate } = require('../../middleware/auth');
const { usuarioValidators } = require('../../validators/validators');
const validar = require('../../middleware/validar');

function crearAuthRoutes({ authService }) {
    const router = express.Router();

    // POST - Registro de nuevo usuario
    router.post('/register', usuarioValidators.register, validar, async (req, res) => {
        const { usuario, token } = await authService.registrar(req.body);
        res.status(201).json({
            mensaje: 'Usuario registrado exitosamente',
            usuario,
            token
        });
    });

    // POST - Login
    router.post('/login', usuarioValidators.login, validar, async (req, res) => {
        const { email, password } = req.body;
        const { usuario, token } = await authService.login(email, password);

        res.json({
            mensaje: 'Login exitoso',
            usuario,
            token
        });
    });

    // GET - Obtener datos del usuario actual
    router.get('/me', authenticate, async (req, res) => {
        res.json(await authService.obtenerActual(req.user.id_usuario));
    });

    // PUT - Cambiar contraseña
    router.put(
        '/change-password',
        authenticate,
        usuarioValidators.changePassword,
        validar,
        async (req, res) => {
            const { passwordActual, passwordNueva } = req.body;
            res.json(
                await authService.cambiarPassword(req.user.id_usuario, passwordActual, passwordNueva)
            );
        }
    );

    return router;
}

module.exports = { crearAuthRoutes };
