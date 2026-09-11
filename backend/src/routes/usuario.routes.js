const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { authenticate, authorizeRole } = require('../../middleware/auth');
const { usuarioValidators } = require('../../validators/validators');
const validar = require('../../middleware/validar');

// Todas las rutas requieren autenticación
router.use(authenticate);


// GET - Listar todos los usuarios (solo admin)

router.get('/', authorizeRole('admin'), async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT id_usuario, nombre, apellido, email, telefono, rol, estado, fecha_registro
             FROM usuario ORDER BY id_usuario`
        );
        res.json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener usuarios' });
    }
});


// GET - Obtener un usuario por ID

router.get('/:id',usuarioValidators.id,validar,async (req, res) => {
        try {
            const { id } = req.params;

            
            if (req.user.id_usuario !== parseInt(id) && req.user.rol !== 'admin') {
                return res.status(403).json({
                    mensaje: 'No tienes permisos para ver este usuario'
                });
            }

            const resultado = await pool.query(
                `SELECT 
                id_usuario, 
                nombre, 
                apellido, 
                email, 
                telefono, 
                rol, 
                estado, 
                fecha_registro
                 FROM usuario WHERE id_usuario = $1`,
                [id]
            );

            if (resultado.rows.length === 0) {
                return res.status(404).json({ mensaje: 'Usuario no encontrado' });
            }

            res.json(resultado.rows[0]);

        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al obtener usuario' });
        }
    }
);


// PUT - Actualizar usuario

router.put('/:id', usuarioValidators.update, validar, async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, apellido, email, telefono, rol, estado } = req.body;

            
            if (req.user.id_usuario !== parseInt(id) && req.user.rol !== 'admin') {
                return res.status(403).json({
                    mensaje: 'No tienes permisos para actualizar este usuario'
                });
            }

            
            if ((rol || estado) && req.user.rol !== 'admin') {
                return res.status(403).json({
                    mensaje: 'Solo un administrador puede cambiar el rol o estado'
                });
            }

            
            if (email) {
                const emailEnUso = await pool.query(
                    'SELECT id_usuario FROM usuario WHERE email = $1 AND id_usuario != $2',
                    [email, id]
                );

                if (emailEnUso.rows.length > 0) {
                    return res.status(409).json({
                        mensaje: 'Este email ya está registrado por otro usuario'
                    });
                }
            }

            const resultado = await pool.query(
                `UPDATE usuario
                 SET
                    nombre = COALESCE($1, nombre),
                    apellido = COALESCE($2, apellido),
                    email = COALESCE($3, email),
                    telefono = COALESCE($4, telefono),
                    rol = COALESCE($5, rol),
                    estado = COALESCE($6, estado)
                 WHERE id_usuario = $7
                 RETURNING id_usuario, nombre, apellido, email, telefono, rol, estado, fecha_registro`,
                [nombre, apellido, email, telefono, rol, estado, id]
            );

            if (resultado.rows.length === 0) {
                return res.status(404).json({ mensaje: 'Usuario no encontrado' });
            }

            res.json({
                mensaje: 'Usuario actualizado exitosamente',
                usuario: resultado.rows[0]
            });

        } catch (error) {
            console.error(error);

            if (error.code === '23505') {
                return res.status(409).json({
                    mensaje: 'Este email ya está registrado'
                });
            }

            res.status(500).json({ mensaje: 'Error al actualizar usuario' });
        }
    }
);


// DELETE - Eliminar usuario (solo admin)

router.delete(
    '/:id',
    authorizeRole('admin'),
    usuarioValidators.id,
    validar,
    async (req, res) => {
        try {
            const { id } = req.params;

            
            if (req.user.id_usuario === parseInt(id)) {
                return res.status(400).json({
                    mensaje: 'No puedes eliminar tu propia cuenta'
                });
            }

            const resultado = await pool.query(
                `DELETE FROM usuario WHERE id_usuario = $1 
                 RETURNING id_usuario, nombre, apellido, email, rol`,
                [id]
            );

            if (resultado.rows.length === 0) {
                return res.status(404).json({ mensaje: 'Usuario no encontrado' });
            }

            res.json({
                mensaje: 'Usuario eliminado correctamente',
                usuario: resultado.rows[0]
            });

        } catch (error) {
            console.error(error);

            if (error.code === '23503') {
                return res.status(409).json({
                    mensaje: 'No se puede eliminar porque tiene registros asociados'
                });
            }

            res.status(500).json({ mensaje: 'Error al eliminar usuario' });
        }
    }
);

module.exports = router;