// ====== middleware/validar.js ======
const { validationResult } = require('express-validator');

const validar = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Formatear errores para una mejor respuesta
    const erroresFormateados = errors.array().map(error => ({
      campo: error.path,
      mensaje: error.msg,
      valor: error.value || null
    }));

    return res.status(400).json({
      mensaje: 'Error de validación',
      errores: erroresFormateados
    });
  }
  
  next();
};

module.exports = validar;

