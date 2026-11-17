const jwt = require('jsonwebtoken');
const pool = require('../src/db');

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no está definido. Configúralo en backend/.env o en el entorno.');
}

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware para verificar que el usuario esté autenticado.
// Además del token, se revalida el usuario en la BD para que una cuenta
// eliminada, inactiva o con rol cambiado pierda el acceso de inmediato.
async function authenticate(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Unauthorized',
            mensaje: 'Token de autenticación requerido'
        });
    }

    let payload;
    try {
        payload = jwt.verify(header.slice(7), JWT_SECRET);
    } catch {
        return res.status(401).json({
            error: 'Unauthorized',
            mensaje: 'Token inválido o expirado'
        });
    }

    try {
        const { rows } = await pool.query(
            'SELECT id_usuario, email, rol, estado FROM usuario WHERE id_usuario = $1',
            [payload.id_usuario]
        );
        const usuario = rows[0];

        if (!usuario) {
            return res.status(401).json({
                error: 'Unauthorized',
                mensaje: 'La cuenta ya no existe'
            });
        }

        if (usuario.estado && usuario.estado.toLowerCase() !== 'activo') {
            return res.status(403).json({
                error: 'Forbidden',
                mensaje: 'Usuario inactivo. Contacta al administrador'
            });
        }

        req.user = { ...payload, ...usuario };
        return next();
    } catch (error) {
        return next(error);
    }
}

// Middleware para verificar rol (ej: solo admin)
function authorizeRole(...rolesPermitidos) {
    return (req, res, next) => {
        if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
            return res.status(403).json({
                error: 'Forbidden',
                mensaje: 'No tienes permisos para esta acción'
            });
        }
        next();
    };
}

// Firmar token con los datos del usuario
function signToken(usuario) {
    return jwt.sign(
        {
            id_usuario: usuario.id_usuario,
            email: usuario.email,
            rol: usuario.rol,
            nombre: usuario.nombre,
            apellido: usuario.apellido
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

module.exports = { authenticate, authorizeRole, signToken, JWT_SECRET };