import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Agregarcategoria.css";
import toast from "react-hot-toast";
import { API_URL, authHeaders } from "../src/api";

const FORMULARIO_INICIAL = {
  nombre: "",
  apellido: "",
  email: "",
  password: "",
  telefono: "",
  rol: "cliente",
  estado: "activo"
};

function Agregarusuario() {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
    if (errores[name]) {
      setErrores({ ...errores, [name]: "" });
    }
  };

  const guardarUsuario = async (e) => {
    e.preventDefault();

    if (cargando) return;

    setCargando(true);
    setErrores({});

    try {
      const respuesta = await fetch(`${API_URL}/api/usuarios`, {
        method: "POST",
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
        throw new Error(datos.mensaje || "Error al crear usuario");
      }

      toast.success("Usuario creado correctamente");
      navigate("/usuarios");
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="categoria">
      <h1>Nuevo usuario</h1>

      <form onSubmit={guardarUsuario}>
        <div>
          <label>Nombre *</label>
          <input
            type="text"
            name="nombre"
            value={formulario.nombre}
            onChange={manejarCambio}
            placeholder="Ej: Juan"
            required
          />
        </div>

        <div>
          <label>Apellido *</label>
          <input
            type="text"
            name="apellido"
            value={formulario.apellido}
            onChange={manejarCambio}
            placeholder="Ej: Pérez"
            required
          />
        </div>

        <div>
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formulario.email}
            onChange={manejarCambio}
            placeholder="juan@ejemplo.com"
            required
          />
        </div>

        <div>
          <label>Contraseña *</label>
          <input
            type="password"
            name="password"
            value={formulario.password}
            onChange={manejarCambio}
            placeholder="Mínimo 6 caracteres"
            minLength={6}
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
            placeholder="Ej: 78945612"
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
          <button type="submit" disabled={cargando}>
            {cargando ? "Guardando..." : "Guardar usuario"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Agregarusuario;
