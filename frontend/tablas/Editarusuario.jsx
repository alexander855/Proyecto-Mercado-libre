import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/Agregarcategoria.css";
import toast from "react-hot-toast";
import { API_URL, authHeaders } from "../src/api";

function Editarusuario() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    rol: "cliente",
    estado: "activo"
  });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const obtenerUsuario = async () => {
      try {
        const respuesta = await fetch(`${API_URL}/api/usuarios/${id}`, {
          headers: authHeaders()
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(datos.mensaje || "Error al obtener el usuario");
        }

        setFormulario({
          nombre: datos.nombre || "",
          apellido: datos.apellido || "",
          email: datos.email || "",
          telefono: datos.telefono || "",
          rol: datos.rol || "cliente",
          estado: datos.estado || "activo"
        });
      } catch (error) {
        console.error("Error:", error);
        setError(error.message);
      } finally {
        setCargando(false);
      }
    };

    obtenerUsuario();
  }, [id]);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
    if (errores[name]) {
      setErrores({ ...errores, [name]: "" });
    }
  };

  const actualizarUsuario = async (e) => {
    e.preventDefault();

    if (guardando) return;

    setGuardando(true);
    setErrores({});

    try {
      const respuesta = await fetch(`${API_URL}/api/usuarios/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(formulario)
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        if (datos.errores) {
          const erroresMap = {};
          datos.errores.forEach((err) => {
            erroresMap[err.campo] = err.mensaje;
          });
          setErrores(erroresMap);
          toast.error("Corrige los campos marcados");
          return;
        }
        throw new Error(datos.mensaje || "Error al actualizar usuario");
      }

      toast.success("Usuario actualizado correctamente");
      navigate("/usuarios");
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <p>Cargando usuario...</p>;
  }

  if (error) {
    return (
      <div className="categoria">
        <h1>Error</h1>
        <p>{error}</p>
        <button onClick={() => navigate("/usuarios")}>Volver a usuarios</button>
      </div>
    );
  }

  return (
    <div className="categoria">
      <h1>Editar usuario</h1>

      <form onSubmit={actualizarUsuario}>
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
          <label>Apellido</label>
          <input
            type="text"
            name="apellido"
            value={formulario.apellido}
            onChange={manejarCambio}
            required
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formulario.email}
            onChange={manejarCambio}
            required
          />
        </div>

        <div>
          <label>Teléfono</label>
          <input
            type="text"
            name="telefono"
            value={formulario.telefono}
            onChange={manejarCambio}
          />
        </div>

        <div>
          <label>Rol</label>
          <select name="rol" value={formulario.rol} onChange={manejarCambio}>
            <option value="cliente">Cliente</option>
            <option value="usuario">Usuario</option>
            <option value="vendedor">Vendedor</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <div>
          <label>Estado</label>
          <select name="estado" value={formulario.estado} onChange={manejarCambio}>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        {Object.values(errores).some(Boolean) && (
          <div className="mensaje-error">
            {Object.entries(errores)
              .filter(([, mensaje]) => mensaje)
              .map(([campo, mensaje]) => (
                <p key={campo}>{mensaje}</p>
              ))}
          </div>
        )}

        <div className="botones">
          <button type="button" onClick={() => navigate("/usuarios")}>
            Cancelar
          </button>
          <button type="submit" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Editarusuario;
