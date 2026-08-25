//aqui es dnd se hace el crud

const express = require("express");
const router = express.Router();

const pool = require("../db");

//get crud listar todo los productos
router.get("/", async (req, res)  => {
    try {
        const resultado = await pool.query(
            "SELECT * FROM producto ORDEN BY id_producto"
        );
        res.json(resultado.rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: "Error al obtener producto"
        });

    }
});

//get obtener un producto x id
router.get("/:id", async (req, res) => {
    try{
        const { id } = req.params;
        const  resultado = await pool.query(
            "SELECT * FROM producto WHERE id_producto = $1",
            [id]
        );

        if (resultado.rows.length === 0 ){
            return res.status(404).json({
                mensaje: "Porducto no encontrado"
            });
        }
        res.json(resultado.rows[0]);

    } catch(error) {
        console.error(error);

        res.status(500).json({
            mensaje: "Error al obtener el producto"
        });

    }
});

//Post crear producto
router.post("/", async (req, res) => {
    try{
        const {
            id_proveedor,
            id_categoria,
            nombre,
            descripcion,
            precio,
            stock,
            imagen,
            estado
        } = req.body;

        const resultado = await pool.query(
            `INSERT INTO producto
            (
            id_proveedor,
            id_categoria,
            nombre,
            descripcion,
            precio,
            stock,
            imagen,
            estado,
            fecha_publicacion
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
            RETURNING *`,
            [
                id_proveedor,
                id_categoria,
                nombre,
                descripcion,
                precio,
                stock,
                imagen,
                estado
            ]
        );

        res.status(201).json(resultado.rows[0]);

    } catch (error){
        console.error(error);

        res.status(500).json ({
            mensaje: "Error al crear producto"

        });
    }
});

//PUT actualizar producto
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const {
            id_proveedor,
            id_categoria,
            nombre,
            descripcion,
            precio,
            stock,
            imagen,
            estado
        } = req.body;
        const resultado = await pool.query(
            `UPDATE producto
            SET
            id_proveedor = $1,
            id_categoria = $2,
            nombre = $3,
            descripcion = $4,
            precio = $5,
            stock = $6,
            imagen = $7,
            estado = $8
            WHERE id_producto = $9
            RETURNING *`,
            [
            id_proveedor,
            id_categoria,
            nombre,
            descripcion,
            precio,
            stock,
            imagen,
            estado,
            id
            ]
        );

        if(resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: "producto no encontrado"
            });
        }

        res.json(resultado.rows[0]);

    } catch (error){
        console.error(error);

        res.status(500).json({
            mensaje: "Error al actualizar producto"
        });
    }
});


//eliminar producto

router. delete("/:id", async (req, res) => {
    try{
        const { id } = req.params;

        const resultado = await pool.query(
            "DELETE FROM producto WHERE id_producto = $1 RETURNING",
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: " Producto no encontrado"
            });
        }

        res.json({
            mensaje: "Producto eliminado correctamente",
            producto: resultado.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: "Error al eliminar producto"
        });

    }
});

module.exports = router;