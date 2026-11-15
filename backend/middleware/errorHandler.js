// ====== middleware/errorHandler.js ======
// Punto único de salida de TODOS los errores del backend.
// Las rutas/servicios ya no hacen try/catch: lanzan AppError (o SQL falla)
// y Express 5 los envía aquí.
//
// Principio Abierto/Cerrado: para soportar un tipo de error nuevo basta con
// agregar una rama aquí (o una subclase de AppError); NO hay que modificar
// las 5 rutas.

const { AppError } = require('../src/errors/AppError');

const ERRORES_SQL = {
    '23505': { status: 409, mensaje: 'El registro ya existe (valor duplicado)' },
    '23503': { status: 409, mensaje: 'No se puede eliminar porque tiene registros asociados' },
    '23502': { status: 400, mensaje: 'Falta un campo obligatorio' }
};

function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            mensaje: err.message,
            ...(err.detalle ? { detalle: err.detalle } : {})
        });
    }

    const errorSql = ERRORES_SQL[err.code];
    if (errorSql) {
        return res.status(errorSql.status).json({ mensaje: errorSql.mensaje });
    }

    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ mensaje: 'JSON mal formado en el cuerpo de la petición' });
    }

    console.error('Error no controlado:', err);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
}

module.exports = errorHandler;
