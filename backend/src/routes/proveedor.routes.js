const express = require("express");
const router = express.Router();
const pool = require("../db");
const  { proveedorValidators } = require ("../../validators/validators");
const validar = require ("../../middleware/validar");

//get para listar los proveedores

router.get("/", async (req, res) => {
    try{
        const resultado = await pool.query(
            "SELECT * FROM proveedor ORDER BY id_proveedor"
        );

        res.json(resultado.rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: "Error al obtener proveedores"
        });
    }
});

//get - obetener un proveedor x id
router.get("/:id", proveedorValidators.id, validar, async ( req, res) => {
    try{
        const { id } = req.params;

        const resultado = await pool.query(
            "SELECT * FROM proveedor WHERE id_proveedor = $1",
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: "Porveedor no encontrado"
            });

        }
        res.json (resultado.rows[0]);

    } catch (error){
        console.error(error);

        res.status(500).json({
            mensaje: "Error al obtener el proveedor"
        });
    }
});

//post crear nuevo proveedor
router.post("/", proveedorValidators.create, validar, async (req, res) =>{
    try{

        const {
            nombre,
            telefono,
            email,
            direccion,
            estado
        } = req.body;

        const resultado = await pool.query(
            ` INSERT INTO proveedor
            (
            nombre,
            telefono,
            email,
            direccion,
            estado,
            fecha_registro
            )
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING   
            *`,
            [
                nombre,
                telefono,
                email,
                direccion,
                estado
            ]
        );
        res.status(201).json({
                mensaje: "Proveedor creado exitosamente",
                proveedor: resultado.rows[0]
            });

        const emailExistente = await pool.query(
                "SELECT * FROM proveedor WHERE email = $1",
                [email]
            );

            if (emailExistente.rows.length > 0) {
                return res.status(409).json({
                    mensaje: "Este email ya está registrado"
                });
            }
        

    } catch (error){
        console.error(error);

        res.status(500).json({
            mensaje: " Error al crear el proveedor"
        });
    }
});



//put - actualizar proveedor
router.put("/:id", proveedorValidators.update, validar, async (req, res) =>{
    try{
        const { id } = req.params;
        const {
            nombre,
            telefono,
            email,
            direccion,
            estado
        } = req.body;

        const resultado = await pool.query(
            ` UPDATE proveedor
            SET
             nombre = $1,
             telefono = $2,
             email = $3,
             direccion = $4,
             estado = $5
             WHERE id_proveedor = $6
             Returning
            *`,
            [
                nombre,
                telefono,
                email,
                direccion,
                estado,
                id
            ]
        );

        if (resultado.rows.length ===0){
            return res.status(404).json({
                mensaje: "Proveedor no encontrado"
            });
        }
        res.json(resultado.rows[0]);

    }catch (error){
        console.error(error);
        res.status(500).json({
            mensaje: "Error al actualizar proveedor"
        });
    }
});

//borrar al proveedor

router.delete("/:id", proveedorValidators.id, validar, async (req, res) => {
    try{
        const { id } = req.params;
        const resultado = await pool.query(
            "DELETE FROM proveedor WHERE id_proveedor = $1 returning*",
            [id]
        );
        if (resultado.rows.length ===0 ){
            return res.status(404).json({
                mensaje: "Proeveedor no encontrado"
            });
        }
        res.json({
            mensaje: "Proveedor eliminado correctamente",
            proveedor: resultado.rows[0]
        });

    }catch (error){
        console.error(error);

        if (error.code === '23503') {
                return res.status(409).json({
                    mensaje: "No se puede eliminar el proveedor porque tiene productos asociados"
                });
            }
        res.status(500).json({
            mensaje: "Error al eliminar al proveedor"
        });
    }
});

module.exports = router;