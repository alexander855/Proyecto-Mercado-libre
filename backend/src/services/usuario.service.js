// ====== src/services/usuario.service.js ======
// Reglas de negocio y de autorización a nivel de recurso.
// Toma al "solicitante" (req.user) como dato, no a Express ni a la BD.

const { AppError } = require('../errors/AppError');
const bcrypt = require('bcryptjs');

class UsuarioService {
    constructor({ usuarioRepository }) {
        this.usuarioRepository = usuarioRepository;
    }

    async listar() {
        return this.usuarioRepository.findAll();
    }

    async crear({ nombre, apellido, email, password, telefono, rol, estado }) {
        if (await this.usuarioRepository.existeEmail(email)) {
            throw AppError.conflicto('Este email ya está registrado');
        }

        const passwordHasheada = await bcrypt.hash(password, 10);

        const usuario = await this.usuarioRepository.create({
            nombre,
            apellido,
            email,
            password: passwordHasheada,
            telefono: telefono || null,
            rol: rol || 'cliente',
            estado: estado || 'activo'
        });

        return { mensaje: 'Usuario creado exitosamente', usuario };
    }

    async obtenerPorId(id, solicitante) {
        const idUsuario = Number(id);

        if (solicitante.id_usuario !== idUsuario && solicitante.rol !== 'admin') {
            throw AppError.prohibido('No tienes permisos para ver este usuario');
        }

        const usuario = await this.usuarioRepository.findById(idUsuario);
        if (!usuario) {
            throw AppError.noEncontrado('Usuario no encontrado');
        }
        return usuario;
    }

    async actualizar(id, datos, solicitante) {
        const idUsuario = Number(id);

        if (solicitante.id_usuario !== idUsuario && solicitante.rol !== 'admin') {
            throw AppError.prohibido('No tienes permisos para actualizar este usuario');
        }

        if ((datos.rol || datos.estado) && solicitante.rol !== 'admin') {
            throw AppError.prohibido('Solo un administrador puede cambiar el rol o estado');
        }

        if (datos.email && (await this.usuarioRepository.existeEmail(datos.email, idUsuario))) {
            throw AppError.conflicto('Este email ya está registrado por otro usuario');
        }

        const usuario = await this.usuarioRepository.update(idUsuario, datos);
        if (!usuario) {
            throw AppError.noEncontrado('Usuario no encontrado');
        }

        return { mensaje: 'Usuario actualizado exitosamente', usuario };
    }

    async eliminar(id, solicitante) {
        const idUsuario = Number(id);

        if (solicitante.id_usuario === idUsuario) {
            throw AppError.validacion('No puedes eliminar tu propia cuenta');
        }

        const usuario = await this.usuarioRepository.remove(idUsuario);
        if (!usuario) {
            throw AppError.noEncontrado('Usuario no encontrado');
        }

        return { mensaje: 'Usuario eliminado correctamente', usuario };
    }
}

module.exports = { UsuarioService };
