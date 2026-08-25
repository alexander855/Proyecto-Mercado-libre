// conexion con la base de datos
const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.DB_HOST,
    host: process.env.DB_PORT,
    host: process.env.DB_USER,
    host: process.env.DB_PASSWORD,
    host: process.env.DB_NAME,

});

module.exports = pool;