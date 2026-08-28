const express = require("express");
const router = express.Router();

const pool = require("../db");

//get para listar los usuarios

router.get("/", async (req, res) => {
    try{
        const resultado = await pool.query(
            "SELECT * FROM usuario ORDER BY id_usuario"
        );

        res.json(resultado.rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: "Error al obtener usuarios"
        });
    }
});

//get - obetener un usuario x id
router.get("/:id", async ( req, res) => {
    try{
        const { id } = req.params;

        const resultado = await pool.query(
            "SELECT * FROM usuario WHERE id_usuario = $1",
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: "usuario no encontrado"
            });

        }
        res.json (resultado.rows[0]);

    } catch (error){
        console.error(error);

        res.status(500).json({
            mensaje: "Error al obtener el usuario"
        });
    }
});

// post - crear nuevo usuario
router.post("/", async (req, res) => {
    try {

        const {
            nombre,
            apellido,
            email,
            password,
            telefono,
            rol,
            estado
        } = req.body;

        const resultado = await pool.query(
            `INSERT INTO usuario
            (
                nombre,
                apellido,
                email,
                password,
                telefono,
                rol,
                estado,
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [
                nombre,
                apellido,
                email,
                password,
                telefono,
                rol,
                estado
            ]
        );

        res.status(201).json(resultado.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: "Error al crear el usuario"
        });
    }
});

// PUT - actualizar usuario
router.put("/:id", async (req, res) => {
    try {

        const { id } = req.params;

        const {
            nombre,
            apellido,
            email,
            password,
            telefono,
            rol,
            estado
        } = req.body;

        const resultado = await pool.query(
            `UPDATE usuario
            SET
                nombre = $1,
                apellido = $2,
                email = $3,
                password = $4,
                telefono = $5,
                rol = $6,
                estado = $7
            WHERE id_usuario = $8
            RETURNING *`,
            [
                nombre,
                apellido,
                email,
                password,
                telefono,
                rol,
                estado,
                id
            ]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: "Usuario no encontrado"
            });
        }

        res.json(resultado.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: "Error al actualizar usuario"
        });
    }
});

//borrar al proveedor

router.delete("/:id", async (req, res) => {
    try{
        const { id } = req.params;
        const resultado = await pool.query(
            "DELETE FROM usuario WHERE id_usuario = $1 returning*",
            [id]
        );
        if (resultado.rows.length ===0 ){
            return res.status(404).json({
                mensaje: "Usuario no encontrado"
            });
        }
        res.json({
            mensaje: "Usuario eliminado correctamente",
            proveedor: resultado.rows[0]
        });

    }catch (error){
        console.error(error);

        res.status(500).json({
            mensaje: "Error al eliminar al Usuario"
        });
    }
});

module.exports = router;