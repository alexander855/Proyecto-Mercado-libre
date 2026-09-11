import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Agregarcategoria.css";
import toast from "react-hot-toast";

function Agregarproveedor() {

  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
    estado: "activo"
  });

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value
    });
  };

  const guardarProveedor = async (e) => {
    e.preventDefault();

    try {
      const respuesta = await fetch(
        "http://localhost:3000/api/proveedores",
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
        throw new Error(datos.mensaje || "Error al agregar proveedor");
      }

      toast.success("Proveedor agregado correctamente");

      navigate("/Proveedores");

      // Limpiar formulario
      setFormulario({
        nombre: "",
        telefono: "",
        email: "",
        direccion: "",
        estado: "activo"
      });

    } catch (error) {
      console.error(error);
      toast.error("Error al crear la categoría");
    }
  };

  return (
    <div className="categoria">

      <h1>Nuevo Proveedor</h1>

      <form onSubmit={guardarProveedor}>

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
          <label>Telefono</label>

          <input
            type="text"
            name="telefono"
            value={formulario.telefono}
            onChange={manejarCambio}
            placeholder="Ej: 67861426"
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
            placeholder="@gmail.com"
          />
        </div>

        <div>
          <label>Direccion</label>

          <input
            type="text"
            name="direccion"
            value={formulario.direccion}
            onChange={manejarCambio}
            placeholder="Ej: calle 12 y 13"
            required
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
          Guardar proveedor
        </button>

      </form>

    </div>
  );
}

export default Agregarproveedor;