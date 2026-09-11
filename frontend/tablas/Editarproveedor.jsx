import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/Agregarcategoria.css";


function Editarproveedor() {

  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formulario, setFormulario] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
    estado: "activo"
  });

  const [cargando, setCargando] = useState(true);

  // Obtener el proveedor
  useEffect(() => {

    const obtenerProveedor = async () => {

      try {

        const respuesta = await fetch(`http://localhost:3000/api/proveedores/${id}`);

        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(
            datos.mensaje || "Error al obtener el proveedor"
          );
        }

        setFormulario({
          nombre: datos.nombre || "",
          telefono: datos.telefono || "",
          email: datos.email || "",
          direccion: datos.direccion || "",
          estado: datos.estado || "activo"
        });

      } catch (error) {

        console.error(error);
        alert("Error al cargar el proveedor");

      } finally {

        setCargando(false);

      }
    };

    obtenerProveedor();

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
  const actualizarProveedor = async (e) => {

    e.preventDefault();

    try {

      const respuesta = await fetch(
        `http://localhost:3000/api/proveedores/${id}`,
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
          datos.mensaje || "Error al actualizar Proveedor"
        );
      }

      alert("Proveedor actualizado correctamente");

      // Regresar al inicio
      navigate("/Proveedores");

    } catch (error) {

      console.error(error);
      alert("Error al actualizar la categoría");

    }

  };


  if (cargando) {
    return <p>Cargando proveedor...</p>;
  }


  return (

    <div className="categoria">

      <h1>Editar Proveedor</h1>

      <form onSubmit={actualizarProveedor}>

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
          <label>Telefono</label>

          <input
            type="text"
            name="telefono"
            value={formulario.telefono}
            onChange={manejarCambio}
            required
          />
        </div>

        <div>
          <label>Email</label>

          <input
            type="text"
            name="email"
            value={formulario.email}
            onChange={manejarCambio}
            required
          />
        </div>

        <div>
          <label>Direccion</label>

          <input
            type="text"
            name="direccion"
            value={formulario.direccion}
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

          <button type="button" onClick={() => navigate("/Proveedores")}>
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

export default Editarproveedor;