const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { signToken, authenticate } = require("../../middleware/auth");
const { usuarioValidators } = require("../../validators/validators");
const validar = require("../../middleware/validar");


// POST - Registro de nuevo usuario

router.post( '/register',usuarioValidators.register, validar, async (req, res) => {
        try {
            const {
                nombre,
                apellido,
                email,
                password,
                telefono,
                rol
            } = req.body;

            const existe = await pool.query(
                'SELECT id_usuario FROM usuario WHERE email = $1',
                [email]
            );

            if (existe.rows.length > 0) {
                return res.status(409).json({
                    mensaje: 'Este email ya está registrado'
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const resultado = await pool.query(
                `INSERT INTO usuario 
                 (nombre, apellido, email, password, telefono, rol, estado)
                 VALUES ($1, $2, $3, $4, $5, $6, 'activo')
                 RETURNING id_usuario, nombre, apellido, email, telefono, rol, estado, fecha_registro`,
                [
                    nombre,
                    apellido,
                    email,
                    hashedPassword,
                    telefono || null,
                    rol || 'cliente'
                ]
            );

            const usuario = resultado.rows[0];

            // Generar token
            const token = signToken(usuario);

            res.status(201).json({
                mensaje: 'Usuario registrado exitosamente',
                usuario,
                token
            });

        } catch (error) {
            console.error('Error en registro:', error);

            if (error.code === '23505') {
                return res.status(409).json({
                    mensaje: 'Este email ya está registrado'
                });
            }

            res.status(500).json({
                mensaje: 'Error al registrar usuario'
            });
        }
    }
);


 // POST - Login

router.post('/login',usuarioValidators.login, validar, async (req, res) => {
        try {
            const { email, password } = req.body;

            // Buscar usuario por email
            const resultado = await pool.query(
                'SELECT * FROM usuario WHERE email = $1',
                [email]
            );

            if (resultado.rows.length === 0) {
                return res.status(401).json({
                    mensaje: 'Credenciales inválidas'
                });
            }

            const usuario = resultado.rows[0];

            if (usuario.estado && usuario.estado.toLowerCase() !== 'activo') {
                return res.status(403).json({
                    mensaje: 'Usuario inactivo. Contacta al administrador'
                });
            }

            // Verificar contraseña
            const passwordValida = await bcrypt.compare(password, usuario.password);
            
            if (!passwordValida) {
                return res.status(401).json({
                    mensaje: 'Credenciales inválidas'
                });
            }

            // Generar token
            const token = signToken(usuario);

            // No enviar el password en la respuesta
            const { password: _, ...usuarioSinPassword } = usuario;

            res.json({
                mensaje: 'Login exitoso',
                usuario: usuarioSinPassword,
                token
            });

        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({
                mensaje: 'Error al iniciar sesión'
            });
        }
    }
);


// GET - Obtener datos del usuario actual

router.get('/me', authenticate, async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT id_usuario, nombre, apellido, email, telefono, rol, estado, fecha_registro
             FROM usuario WHERE id_usuario = $1`,
            [req.user.id_usuario]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        res.json(resultado.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Error al obtener usuario'
        });
    }
});

// ============================================
// PUT - Cambiar contraseña
// ============================================
router.put('/change-password', authenticate, usuarioValidators.changePassword, validar, async (req, res) => {
        try {
            const { passwordActual, passwordNueva } = req.body;

            // Obtener usuario actual
            const resultado = await pool.query(
                'SELECT password FROM usuario WHERE id_usuario = $1',
                [req.user.id_usuario]
            );

            if (resultado.rows.length === 0) {
                return res.status(404).json({
                    mensaje: 'Usuario no encontrado'
                });
            }

            // Verificar contraseña actual
            const passwordValida = await bcrypt.compare(
                passwordActual,
                resultado.rows[0].password
            );

            if (!passwordValida) {
                return res.status(401).json({
                    mensaje: 'La contraseña actual es incorrecta'
                });
            }

            // Hashear nueva contraseña
            const hashedPassword = await bcrypt.hash(passwordNueva, 10);

            await pool.query(
                'UPDATE usuario SET password = $1 WHERE id_usuario = $2',
                [hashedPassword, req.user.id_usuario]
            );

            res.json({
                mensaje: 'Contraseña actualizada exitosamente'
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                mensaje: 'Error al cambiar contraseña'
            });
        }
    }
);

module.exports = router;