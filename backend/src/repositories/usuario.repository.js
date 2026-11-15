// ====== src/repositories/usuario.repository.js ======
const { BaseRepository } = require('./base.repository');

const CAMPOS_PUBLICOS = `id_usuario, nombre, apellido, email, telefono, rol, estado, fecha_registro`;

class UsuarioRepository extends BaseRepository {
    constructor(pool) {
        super(pool, 'usuario', 'id_usuario');
    }

    // Misma firma/contrato que BaseRepository, distinta implementación (SELECT sin password)
    async findAll() {
        return this.query(`SELECT ${CAMPOS_PUBLICOS} FROM usuario ORDER BY id_usuario`);
    }

    async findById(id) {
        const filas = await this.query(
            `SELECT ${CAMPOS_PUBLICOS} FROM usuario WHERE id_usuario = $1`,
            [id]
        );
        return filas[0] ?? null;
    }

    async findByEmail(email) {
        const filas = await this.query('SELECT * FROM usuario WHERE email = $1', [email]);
        return filas[0] ?? null;
    }

    // Sólo los campos necesarios para verificar credenciales (ISP: no se
    // expone el hash de contraseña a toda la aplicación).
    async findCredenciales(id) {
        const filas = await this.query(
            'SELECT id_usuario, password FROM usuario WHERE id_usuario = $1',
            [id]
        );
        return filas[0] ?? null;
    }

    async existeEmail(email, exceptoId = null) {
        const filas = exceptoId
            ? await this.query(
                'SELECT id_usuario FROM usuario WHERE email = $1 AND id_usuario != $2',
                [email, exceptoId]
            )
            : await this.query('SELECT id_usuario FROM usuario WHERE email = $1', [email]);
        return filas.length > 0;
    }

    async create({ nombre, apellido, email, password, telefono = null, rol = 'cliente', estado = 'activo' }) {
        const filas = await this.query(
            `INSERT INTO usuario (nombre, apellido, email, password, telefono, rol, estado)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING ${CAMPOS_PUBLICOS}`,
            [nombre, apellido, email, password, telefono, rol, estado]
        );
        return filas[0];
    }

    async update(id, datos) {
        const { nombre, apellido, email, telefono, rol, estado } = datos;
        const filas = await this.query(
            `UPDATE usuario
             SET nombre = COALESCE($1, nombre),
                 apellido = COALESCE($2, apellido),
                 email = COALESCE($3, email),
                 telefono = COALESCE($4, telefono),
                 rol = COALESCE($5, rol),
                 estado = COALESCE($6, estado)
             WHERE id_usuario = $7
             RETURNING ${CAMPOS_PUBLICOS}`,
            [nombre, apellido, email, telefono, rol, estado, id]
        );
        return filas[0] ?? null;
    }

    async updatePassword(id, passwordHasheada) {
        const filas = await this.query(
            'UPDATE usuario SET password = $1 WHERE id_usuario = $2 RETURNING id_usuario',
            [passwordHasheada, id]
        );
        return filas[0] ?? null;
    }
}

module.exports = { UsuarioRepository };
