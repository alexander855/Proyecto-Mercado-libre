// ====== src/repositories/producto.repository.js ======
const { BaseRepository } = require('./base.repository');

class ProductoRepository extends BaseRepository {
    constructor(pool) {
        super(pool, 'producto', 'id_producto');
    }

    // Misma firma que el contrato base (findAll -> Array) pero con JOIN:
    // el consumidor no cambia de forma, solo recibe más campos (Liskov).
    async findAll() {
        return this.query(
            `SELECT p.id_producto,
                    pr.nombre AS proveedor,
                    c.nombre AS categoria,
                    p.nombre AS nombre,
                    p.descripcion,
                    p.precio,
                    p.stock,
                    p.imagen,
                    p.estado,
                    p.fecha_publicacion
             FROM producto p
             INNER JOIN categoria c ON p.id_categoria = c.id_categoria
             INNER JOIN proveedor pr ON p.id_proveedor = pr.id_proveedor
             ORDER BY p.id_producto`
        );
    }

    async create(datos) {
        const {
            id_proveedor, id_categoria, nombre, descripcion,
            precio, stock, imagen, estado = 'disponible'
        } = datos;

        const filas = await this.query(
            `INSERT INTO producto
                (id_proveedor, id_categoria, nombre, descripcion, precio, stock, imagen, estado, fecha_publicacion)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
             RETURNING *`,
            [id_proveedor, id_categoria, nombre, descripcion, precio, stock, imagen, estado]
        );
        return filas[0];
    }

    async update(id, datos) {
        const {
            id_proveedor, id_categoria, nombre, descripcion,
            precio, stock, imagen, estado
        } = datos;

        const filas = await this.query(
            `UPDATE producto
             SET id_proveedor = COALESCE($1, id_proveedor),
                 id_categoria = COALESCE($2, id_categoria),
                 nombre = COALESCE($3, nombre),
                 descripcion = COALESCE($4, descripcion),
                 precio = COALESCE($5, precio),
                 stock = COALESCE($6, stock),
                 imagen = COALESCE($7, imagen),
                 estado = COALESCE($8, estado)
             WHERE id_producto = $9
             RETURNING *`,
            [id_proveedor, id_categoria, nombre, descripcion, precio, stock, imagen, estado, id]
        );
        return filas[0] ?? null;
    }
}

module.exports = { ProductoRepository };
