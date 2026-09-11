// ====== validators.js ======
const { body, param, query } = require('express-validator');

// Validaciones para Proveedores
const proveedorValidators = {
  create: [
    body('nombre').trim().notEmpty().withMessage('El nombre del proveedor es requerido').isLength({ min: 2, max: 150 }).withMessage('El nombre debe tener entre 2 y 150 caracteres'),
    body('email').notEmpty().withMessage('El email es requerido').isEmail().withMessage('Email inválido').normalizeEmail().withMessage('Formato de email no válido'),
    body('telefono').optional().isLength({ min: 7, max: 20 }).withMessage('El teléfono debe tener entre 7 y 20 dígitos').matches(/^[0-9+\-\s()]+$/).withMessage('El teléfono contiene caracteres inválidos'),
    body('direccion').optional().trim().isLength({ max: 255 }).withMessage('La dirección no puede exceder los 255 caracteres')
  ],
  update: [
    param('id').isInt({ min: 1 }).withMessage('ID de proveedor inválido'),
    body('nombre').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío').isLength({ min: 2, max: 150 }).withMessage('El nombre debe tener entre 2 y 150 caracteres'),
    body('email').optional().isEmail().withMessage('Email inválido').normalizeEmail(),
    body('telefono').optional().isLength({ min: 7, max: 20 }).withMessage('El teléfono debe tener entre 7 y 20 dígitos').matches(/^[0-9+\-\s()]+$/).withMessage('El teléfono contiene caracteres inválidos'),
    body('direccion').optional().trim().isLength({ max: 255 }).withMessage('La dirección no puede exceder los 255 caracteres')
  ],

  id: [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de proveedor inválido')
  ],

  list: [
    query('page').optional().isInt({ min: 1 }).withMessage('La página debe ser un número positivo'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('El límite debe ser entre 1 y 100'),
    query('sortBy').optional().isIn(['nombre', 'email', 'created_at', 'updated_at']).withMessage('Campo de ordenamiento inválido'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Orden debe ser asc o desc')
  ]
};

// Validaciones para Productos (tus validaciones actuales mejoradas)
const productoValidators = {
  create: [
    body('id_proveedor').isInt({ min: 1 }).withMessage('El proveedor debe ser un número entero positivo'),
    body('id_categoria').isInt({ min: 1 }).withMessage('La categoría debe ser un número entero positivo'),
    body('nombre').trim().notEmpty().withMessage('El nombre del producto es requerido').isLength({ min: 3, max: 150 }).withMessage('El nombre debe tener entre 3 y 150 caracteres'),
    body('descripcion').optional().trim().isLength({ max: 500 }).withMessage('La descripción no puede exceder los 500 caracteres'),
    body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número mayor o igual a 0').toFloat(),
    body('stock').isInt({ min: 0 }).withMessage('El stock debe ser un número entero mayor o igual a 0').toInt(),
    body('imagen').optional().trim().isURL().withMessage('La imagen debe ser una URL válida').isLength({ max: 255 }).withMessage('La URL de la imagen no puede exceder los 255 caracteres'),
    body('estado').optional().trim().isIn(['disponible', 'agotado']).withMessage('Estado inválido')
  ],

  update: [
    param('id').isInt({ min: 1 }).withMessage('ID de producto inválido'),
    body('id_proveedor').optional().isInt({ min: 1 }).withMessage('El proveedor debe ser un número entero positivo'),
    body('id_categoria').optional().isInt({ min: 1 }).withMessage('La categoría debe ser un número entero positivo'),
    body('nombre').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío').isLength({ min: 3, max: 150 }).withMessage('El nombre debe tener entre 3 y 150 caracteres'),
    body('descripcion').optional().trim().isLength({ max: 500 }).withMessage('La descripción no puede exceder los 500 caracteres'),
    body('precio').optional().isFloat({ min: 0 }).withMessage('El precio debe ser un número mayor o igual a 0').toFloat(),
    body('stock').optional().isInt({ min: 0 }).withMessage('El stock debe ser un número entero mayor o igual a 0').toInt(),
    body('imagen').optional().trim().isURL().withMessage('La imagen debe ser una URL válida').isLength({ max: 255 }).withMessage('La URL de la imagen no puede exceder los 255 caracteres'),
    body('estado').optional().trim().isIn(['activo', 'inactivo', 'disponible', 'agotado']).withMessage('Estado inválido')
  ],

  id: [
    param('id').isInt({ min: 1 }).withMessage('ID de producto inválido')
  ],

  list: [
    query('page').optional().isInt({ min: 1 }).withMessage('La página debe ser un número positivo'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('El límite debe ser entre 1 y 100'),
    query('categoria').optional().isInt({ min: 1 }).withMessage('ID de categoría inválido'),
    query('proveedor').optional().isInt({ min: 1 }).withMessage('ID de proveedor inválido'),
    query('estado').optional().isIn(['activo', 'inactivo', 'disponible', 'agotado']).withMessage('Estado inválido')
  ]
};

// Validación de email más estricta
const emailValidators = {
  email: [
    body('email').notEmpty().withMessage('El email es requerido').isEmail().withMessage('Email inválido').normalizeEmail().withMessage('Formato de email no válido')
  ]
};

const categoriaValidators = {
  create: [
    body('nombre').trim().notEmpty().withMessage('El nombre de la categoría es requerido').isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres').matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_]+$/).withMessage('El nombre solo puede contener letras, números, espacios, guiones y guiones bajos'),
    body('descripcion').optional({ values: 'falsy' }).trim().isLength({ max: 500 }).withMessage('La descripción no puede exceder los 500 caracteres'),
    body('estado').optional({ values: 'falsy' }).trim().toLowerCase().isIn(['activo', 'inactivo']).withMessage('El estado debe ser "activo" o "inactivo"')
  ],

  update: [
    param('id').isInt({ min: 1 }).withMessage('ID de categoría inválido'),
    body('nombre').optional({ values: 'falsy' }).trim().notEmpty().withMessage('El nombre no puede estar vacío').isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres').matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_]+$/).withMessage('El nombre solo puede contener letras, números, espacios, guiones y guiones bajos'),
    body('descripcion').optional({ values: 'falsy' }).trim().isLength({ max: 500 }).withMessage('La descripción no puede exceder los 500 caracteres'),
    body('estado').optional({ values: 'falsy' }).trim().toLowerCase().isIn(['activo', 'inactivo']).withMessage('El estado debe ser "activo" o "inactivo"')
  ],

  
  id: [
    param('id').isInt({ min: 1 }).withMessage('ID de categoría inválido')
  ],

  
  list: [
    query('page').optional().isInt({ min: 1 }).withMessage('La página debe ser un número positivo'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('El límite debe ser entre 1 y 100'),
    query('estado').optional().isIn(['activo', 'inactivo']).withMessage('Estado inválido'),
    query('sortBy').optional().isIn(['nombre', 'id_categoria', 'fecha_registro']).withMessage('Campo de ordenamiento inválido'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Orden debe ser asc o desc')
  ]
};

const usuarioValidators = {
    register: [
        body('nombre').trim().notEmpty().withMessage('El nombre es requerido').isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres').matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras'),
        body('apellido').trim().notEmpty().withMessage('El apellido es requerido').isLength({ min: 2, max: 100 }).withMessage('El apellido debe tener entre 2 y 100 caracteres').matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El apellido solo puede contener letras'),
        body('email').trim().notEmpty().withMessage('El email es requerido').isEmail().withMessage('Email inválido').normalizeEmail().isLength({ max: 150 }).withMessage('El email no puede exceder los 150 caracteres'),
        body('password').notEmpty().withMessage('La contraseña es requerida').isLength({ min: 6, max: 100 }).withMessage('La contraseña debe tener entre 6 y 100 caracteres'),
        body('telefono').optional({ values: 'falsy' }).trim().isLength({ max: 30 }).withMessage('El teléfono no puede exceder los 30 caracteres').matches(/^[0-9+\-\s()]+$/).withMessage('El teléfono contiene caracteres inválidos'),
        body('rol').optional({ values: 'falsy' }).trim().toLowerCase().isIn(['admin', 'vendedor', 'usuario', 'cliente']).withMessage('Rol inválido')
    ],

    login: [
        body('email').trim().notEmpty().withMessage('El email es requerido').isEmail().withMessage('Email inválido').normalizeEmail(),
        body('password').notEmpty().withMessage('La contraseña es requerida')
    ],

    update: [
        param('id').isInt({ min: 1 }).withMessage('ID de usuario inválido'),
        body('nombre').optional({ values: 'falsy' }).trim().notEmpty().isLength({ min: 2, max: 100 }).matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),
        body('apellido').optional({ values: 'falsy' }).trim().notEmpty().isLength({ min: 2, max: 100 }).matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),
        body('email').optional({ values: 'falsy' }).isEmail().normalizeEmail().isLength({ max: 150 }),
        body('telefono').optional({ values: 'falsy' }).trim().isLength({ max: 30 }).matches(/^[0-9+\-\s()]+$/),
        body('rol').optional({ values: 'falsy' }).trim().toLowerCase().isIn(['admin', 'vendedor', 'usuario', 'cliente']),
        body('estado').optional({ values: 'falsy' }).trim().toLowerCase().isIn(['activo', 'inactivo'])
    ],

    changePassword: [
        body('passwordActual').notEmpty().withMessage('La contraseña actual es requerida'),
        body('passwordNueva').notEmpty().withMessage('La nueva contraseña es requerida').isLength({ min: 6, max: 100 }).withMessage('La contraseña debe tener entre 6 y 100 caracteres')
    ],

    id: [
        param('id').isInt({ min: 1 }).withMessage('ID de usuario inválido')
    ]
};


module.exports = { 
  proveedorValidators, 
  productoValidators, 
  emailValidators,
  categoriaValidators,
  usuarioValidators 
};