import { useState } from "react";
import "../css/Agregarcategoria.css";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from 'lucide-react';
import toast from "react-hot-toast";

function Agregarcategoria() {

  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    nombre: "",
    descripcion: "",
    estado: "activo"
  });

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value
    });
  };

  const guardarCategoria = async (e) => {
    e.preventDefault();

    try {
      const respuesta = await fetch(
        "http://localhost:3000/api/categorias",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formulario)
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "Error al crear categoría");
      }

      toast.success("Categoría creada correctamente");

      navigate("/Categorias");

      // Limpiar formulario
      setFormulario({
        nombre: "",
        descripcion: "",
        estado: "activo"
      });

    } catch (error) {
      console.error(error);
      toast.error("Error al crear la categoría");
    }
  };

  return (
    <div className="categoria">

      <h1>Nueva categoría</h1>

      <form onSubmit={guardarCategoria}>

        <div>
          <label>Nombre</label>

          <input
            type="text"
            name="nombre"
            value={formulario.nombre}
            onChange={manejarCambio}
            placeholder="Ej: Tecnología"
            required
          />
        </div>

        <div>
          <label>Descripción</label>

          <textarea
            name="descripcion"
            value={formulario.descripcion}
            onChange={manejarCambio}
            placeholder="Descripción de la categoría"
          />
        </div>

        <div>
          <label>Estado</label>

          <select
            name="estado"
            value={formulario.estado}
            onChange={manejarCambio}
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <button type="submit">
          Guardar categoría
        </button>

      </form>

    </div>
  );
}

export default Agregarcategoria;