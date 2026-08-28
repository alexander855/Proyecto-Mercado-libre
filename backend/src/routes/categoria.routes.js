const express = require("express");
const router = express.Router();

const pool = require("../db");

//get para listar las categorias

router.get("/", async (req, res) => {
    try{
        const resultado = await pool.query(
            "SELECT * FROM categoria ORDER BY id_categoria"
        );

        res.json(resultado.rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: "Error al obtener categoria"
        });
    }
});

//get - obetener una categoria x id
router.get("/:id", async ( req, res) => {
    try{
        const { id } = req.params;

        const resultado = await pool.query(
            "SELECT * FROM categoria WHERE id_categoria = $1",
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: "categoria no encontrado"
            });

        }
        res.json (resultado.rows[0]);

    } catch (error){
        console.error(error);

        res.status(500).json({
            mensaje: "Error al obtener el categoria"
        });
    }
});

//post crear nueva categoria
router.post("/", async (req, res) => {
    try {

        const {
            nombre,
            descripcion,
            estado
        } = req.body;

        const resultado = await pool.query(
            `INSERT INTO categoria
            (
                nombre,
                descripcion,
                estado
            )
            VALUES ($1, $2, $3)
            RETURNING *`,
            [
                nombre,
                descripcion,
                estado
            ]
        );

        res.status(201).json(resultado.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: "Error al crear la categoria"
        });
    }
});



//put - actualizar la categoria
router.put("/:id", async (req, res) => {
    try {

        const { id } = req.params;

        const {
            nombre,
            descripcion,
            estado
        } = req.body;

        const resultado = await pool.query(
            `UPDATE categoria
            SET
                nombre = $1,
                descripcion = $2,
                estado = $3
            WHERE id_categoria = $4
            RETURNING *`,
            [
                nombre,
                descripcion,
                estado,
                id
            ]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: "Categoria no encontrada"
            });
        }

        res.json(resultado.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: "Error al actualizar categoria"
        });
    }
});


//Delete - borrar la categoria

router.delete("/:id", async (req, res) => {
    try{
        const { id } = req.params;
        const resultado = await pool.query(
            "DELETE FROM proveedor WHERE id_proveedor = $1 returning*",
            [id]
        );
        if (resultado.rows.length ===0 ){
            return res.status(404).json({
                mensaje: "Categoria no encontrado"
            });
        }
        res.json({
            mensaje: "Categoria eliminado correctamente",
            proveedor: resultado.rows[0]
        });

    }catch (error){
        console.error(error);

        res.status(500).json({
            mensaje: "Error al eliminar la categoria"
        });
    }
});

module.exports = router;