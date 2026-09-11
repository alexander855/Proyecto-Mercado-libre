const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'agenda-dev-secret-change-in-production';

// Middleware para verificar que el usuario esté autenticado
function authenticate(req, res, next) {
    const header = req.headers.authorization;
    
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Unauthorized',
            mensaje: 'Token de autenticación requerido'
        });
    }

    try {
        const token = header.slice(7);
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({
            error: 'Unauthorized',
            mensaje: 'Token inválido o expirado'
        });
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