import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/Agregarcategoria.css";
import toast from "react-hot-toast";


function Editarcategoria() {

  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formulario, setFormulario] = useState({
    nombre: "",
    descripcion: "",
    estado: "activo"
  });

  const [cargando, setCargando] = useState(true);

  // Obtener la categoría
  useEffect(() => {

    const obtenerCategoria = async () => {

      try {

        const respuesta = await fetch(`http://localhost:3000/api/categorias/${id}`);

        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(
            datos.mensaje || "Error al obtener la categoría"
          );
        }

        setFormulario({
          nombre: datos.nombre || "",
          descripcion: datos.descripcion || "",
          estado: datos.estado || "activo"
        });

      } catch (error) {

        console.error(error);
        toast.error("Error al cargar la categoría");

      } finally {

        setCargando(false);

      }
    };

    obtenerCategoria();

  }, [id]);


  // Cambiar los campos
  const manejarCambio = (e) => {

    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value
    });

  };


  // Actualizar categoría
  const actualizarCategoria = async (e) => {

    e.preventDefault();

    try {

      const respuesta = await fetch(
        `http://localhost:3000/api/categorias/${id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(formulario)
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje || "Error al actualizar categoría"
        );
      }

      toast.success("Categoría actualizada correctamente");

      // Regresar al inicio
      navigate("/Categorias");

    } catch (error) {

      console.error(error);
      toast.error("Error al actualizar la categoría");

    }

  };


  if (cargando) {
    return <p>Cargando categoría...</p>;
  }


  return (

    <div className="categoria">

      <h1>Editar categoría</h1>

      <form onSubmit={actualizarCategoria}>

        <div>
          <label>Nombre</label>

          <input
            type="text"
            name="nombre"
            value={formulario.nombre}
            onChange={manejarCambio}
            required
          />
        </div>


        <div>
          <label>Descripción</label>

          <textarea
            name="descripcion"
            value={formulario.descripcion}
            onChange={manejarCambio}
          />
        </div>


        <div>
          <label>Estado</label>

          <select
            name="estado"
            value={formulario.estado}
            onChange={manejarCambio}
          >

            <option value="activo">
              Activo
            </option>

            <option value="inactivo">
              Inactivo
            </option>

          </select>
        </div>


        <div className="botones">

          <button type="button" onClick={() => navigate("/Categorias")}>
            Cancelar
          </button>

          <button type="submit">
            Guardar cambios
          </button>

        </div>

      </form>

    </div>

  );

}

export default Editarcategoria;