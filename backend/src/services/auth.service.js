// ====== src/services/auth.service.js ======
// Reglas de negocio de autenticación/registro.
// No conoce Express ni SQL: sólo el repositorio y el generador de token (DIP).

const bcrypt = require('bcryptjs');
const { AppError } = require('../errors/AppError');

class AuthService {
    constructor({ usuarioRepository, generarToken }) {
        this.usuarioRepository = usuarioRepository;
        this.generarToken = generarToken;
    }

    async registrar({ nombre, apellido, email, password, telefono }) {
        const existe = await this.usuarioRepository.existeEmail(email);
        if (existe) {
            throw AppError.conflicto('Este email ya está registrado');
        }

        const passwordHasheada = await bcrypt.hash(password, 10);

        // El registro público siempre crea clientes. Un admin se asigna
        // únicamente desde POST /api/usuarios con un token de administrador.
        const usuario = await this.usuarioRepository.create({
            nombre,
            apellido,
            email,
            password: passwordHasheada,
            telefono: telefono || null,
            rol: 'cliente'
        });

        return { usuario, token: this.generarToken(usuario) };
    }

    async login(email, password) {
        const usuario = await this.usuarioRepository.findByEmail(email);

        if (!usuario) {
            throw AppError.sinAutorizacion('Credenciales inválidas');
        }

        if (usuario.estado && usuario.estado.toLowerCase() !== 'activo') {
            throw AppError.prohibido('Usuario inactivo. Contacta al administrador');
        }

        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) {
            throw AppError.sinAutorizacion('Credenciales inválidas');
        }

        const { password: _, ...usuarioSinPassword } = usuario;

        return {
            usuario: usuarioSinPassword,
            token: this.generarToken(usuario)
        };
    }

    async obtenerActual(idUsuario) {
        const usuario = await this.usuarioRepository.findById(idUsuario);
        if (!usuario) {
            throw AppError.noEncontrado('Usuario no encontrado');
        }
        return usuario;
    }

    async cambiarPassword(idUsuario, passwordActual, passwordNueva) {
        const credenciales = await this.usuarioRepository.findCredenciales(idUsuario);
        if (!credenciales) {
            throw AppError.noEncontrado('Usuario no encontrado');
        }

        const passwordValida = await bcrypt.compare(passwordActual, credenciales.password);
        if (!passwordValida) {
            throw AppError.sinAutorizacion('La contraseña actual es incorrecta');
        }

        const passwordHasheada = await bcrypt.hash(passwordNueva, 10);
        await this.usuarioRepository.updatePassword(idUsuario, passwordHasheada);

        return { mensaje: 'Contraseña actualizada exitosamente' };
    }
}

module.exports = { AuthService };
