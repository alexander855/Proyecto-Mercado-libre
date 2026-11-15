// ====== src/errors/AppError.js ======
// Error de negocio: lleva junto el mensaje y el código HTTP.
// Los middlewares/infraestructura nunca lanzan errores "crudos":
// siempre se traducen a un AppError antes de llegar a la capa HTTP.

class AppError extends Error {
    constructor(mensaje, statusCode = 500, detalle = null) {
        super(mensaje);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.detalle = detalle;
    }

    static noEncontrado(mensaje = 'Recurso no encontrado') {
        return new AppError(mensaje, 404);
    }

    static sinAutorizacion(mensaje = 'No autorizado') {
        return new AppError(mensaje, 401);
    }

    static prohibido(mensaje = 'No tienes permisos para esta acción') {
        return new AppError(mensaje, 403);
    }

    static conflicto(mensaje = 'Conflicto con el recurso') {
        return new AppError(mensaje, 409);
    }

    static validacion(mensaje = 'Datos inválidos') {
        return new AppError(mensaje, 400);
    }
}

module.exports = { AppError };
