const express = require("express");
const router = express.Router();
const { categoriaValidators } = require ("../../validators/validators");
const validar = require ("../../middleware/validar");

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
router.get( "/:id", categoriaValidators.id, validar,async (req, res) => {
        try {
            const { id } = req.params;

            const resultado = await pool.query(
                "SELECT * FROM categoria WHERE id_categoria = $1",
                [id]
            );

            if (resultado.rows.length === 0) {
                return res.status(404).json({
                    mensaje: "Categoría no encontrada"
                });
            }
            res.json(resultado.rows[0]);

        } catch (error) {
            console.error(error);
            res.status(500).json({
                mensaje: "Error al obtener la categoría"
            });
        }
    }
);

//post crear nueva categoria
router.post( "/", categoriaValidators.create, validar, async (req, res) => {
        try {
            const { nombre, descripcion, estado } = req.body;

            const nombreExistente = await pool.query(
                "SELECT * FROM categoria WHERE LOWER(nombre) = LOWER($1)",
                [nombre]
            );

            if (nombreExistente.rows.length > 0) {
                return res.status(409).json({
                    mensaje: "Ya existe una categoría con ese nombre"
                });
            }

            const resultado = await pool.query(
                `INSERT INTO categoria 
                (nombre, 
                descripcion, 
                estado)
                 VALUES ($1, $2, $3)
                 RETURNING *`,
                [nombre, descripcion, estado || 'activo']
            );

            res.status(201).json({
                mensaje: "Categoría creada exitosamente",
                categoria: resultado.rows[0]
            });

        } catch (error) {
            console.error(error);

            if (error.code === '23505') {
                return res.status(409).json({
                    mensaje: "Ya existe una categoría con ese nombre"
                });
            }

            res.status(500).json({
                mensaje: "Error al crear la categoría"
            });
        }
    }
);



//put - actualizar la categoria
router.put( "/:id", categoriaValidators.update, validar, async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, descripcion, estado } = req.body;

            if (nombre) {
                const nombreEnUso = await pool.query(
                    "SELECT * FROM categoria WHERE LOWER(nombre) = LOWER($1) AND id_categoria != $2",
                    [nombre, id]
                );

                if (nombreEnUso.rows.length > 0) {
                    return res.status(409).json({
                        mensaje: "Ya existe otra categoría con ese nombre"
                    });
                }
            }

            const resultado = await pool.query(
                `UPDATE categoria
                 SET
                    nombre = COALESCE($1, nombre),
                    descripcion = COALESCE($2, descripcion),
                    estado = COALESCE($3, estado)
                 WHERE id_categoria = $4
                 RETURNING *`,
                [nombre, descripcion, estado, id]
            );

            if (resultado.rows.length === 0) {
                return res.status(404).json({
                    mensaje: "Categoría no encontrada"
                });
            }

            res.json({
                mensaje: "Categoría actualizada exitosamente",
                categoria: resultado.rows[0]
            });

        } catch (error) {
            console.error(error);

            if (error.code === '23505') {
                return res.status(409).json({
                    mensaje: "Ya existe una categoría con ese nombre"
                });
            }

            res.status(500).json({
                mensaje: "Error al actualizar categoría"
            });
        }
    }
);


//Delete - borrar la categoria

router.delete( "/:id", categoriaValidators.id, validar, async (req, res) => {
        try {
            const { id } = req.params;

            const resultado = await pool.query(
                "DELETE FROM categoria WHERE id_categoria = $1 RETURNING *",
                [id]
            );

            if (resultado.rows.length === 0) {
                return res.status(404).json({
                    mensaje: "Categoría no encontrada"
                });
            }

            res.json({
                mensaje: "Categoría eliminada correctamente",
                categoria: resultado.rows[0]  
            });

        } catch (error) {
            console.error(error);

            if (error.code === '23503') {
                return res.status(409).json({
                    mensaje: "No se puede eliminar la categoría porque tiene productos asociados"
                });
            }

            res.status(500).json({
                mensaje: "Error al eliminar la categoría"
            });
        }
    }
);


module.exports = router;