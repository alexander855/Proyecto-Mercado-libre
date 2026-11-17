// ====== src/repositories/base.repository.js ======
// Contrato base (abstracción) de todas las repositorios.
// La capa de servicios depende de ESTE contrato, nunca de `pg` directamente.
//
// Contrato garantizado (se respeta en todas las subclases -> Liskov):
//   findAll()   -> Promise<Array>
//   findById()  -> Promise<Objeto | null>
//   remove()    -> Promise<Objeto | null>

class BaseRepository {
    constructor(pool, tabla, pk) {
        this.pool = pool;
        this.tabla = tabla;
        this.pk = pk;
    }

    async query(sql, params = []) {
        const resultado = await this.pool.query(sql, params);
        return resultado.rows;
    }

    async transaction(callback) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const resultado = await callback(client);
            await client.query('COMMIT');
            return resultado;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async findAll() {
        return this.query(`SELECT * FROM ${this.tabla} ORDER BY ${this.pk}`);
    }

    async findById(id) {
        const filas = await this.query(
            `SELECT * FROM ${this.tabla} WHERE ${this.pk} = $1`,
            [id]
        );
        return filas[0] ?? null;
    }

    async remove(id) {
        const filas = await this.query(
            `DELETE FROM ${this.tabla} WHERE ${this.pk} = $1 RETURNING *`,
            [id]
        );
        return filas[0] ?? null;
    }
}

module.exports = { BaseRepository };
