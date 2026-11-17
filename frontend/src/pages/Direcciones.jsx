import { useEffect, useState } from "react";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { API_URL, authHeaders, getUsuarioSesion } from "../api";

const FORM_VACIO = {
  id_usuario: "",
  departamento: "",
  ciudad: "",
  zona: "",
  direccion: "",
  referencia: "",
  telefono: "",
};

const CAMPOS = ["departamento", "ciudad", "zona", "direccion", "referencia", "telefono"];

function Direcciones() {
  const esAdmin = getUsuarioSesion().rol === "admin";

  const [direcciones, setDirecciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [formulario, setFormulario] = useState(FORM_VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [filtroUsuario, setFiltroUsuario] = useState("todos");

  useEffect(() => {
    const cargar = async () => {
      try {
        const respuesta = await fetch(`${API_URL}/api/direcciones`, {
          headers: authHeaders(),
        });
        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(datos.mensaje || "Error al obtener direcciones");
        }

        setDirecciones(Array.isArray(datos) ? datos : []);

        if (esAdmin) {
          const respuestaUsuarios = await fetch(`${API_URL}/api/usuarios`, {
            headers: authHeaders(),
          });
          const datosUsuarios = await respuestaUsuarios.json();

          if (respuestaUsuarios.ok && Array.isArray(datosUsuarios)) {
            setUsuarios(datosUsuarios);
          }
        }
      } catch (err) {
        console.error("Error al cargar direcciones:", err);
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [esAdmin]);

  const recargarDirecciones = async () => {
    const respuesta = await fetch(`${API_URL}/api/direcciones`, {
      headers: authHeaders(),
    });
    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(datos.mensaje || "Error al obtener direcciones");
    }

    setDirecciones(Array.isArray(datos) ? datos : []);
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
  };

  const limpiarFormulario = () => {
    setFormulario(FORM_VACIO);
    setEditandoId(null);
  };

  const guardarDireccion = async (e) => {
    e.preventDefault();

    if (!formulario.direccion.trim()) {
      toast.error("La dirección es requerida");
      return;
    }

    const cuerpo = {};

    CAMPOS.forEach((campo) => {
      const valor = formulario[campo].trim();

      if (valor !== "" || campo === "direccion") {
        cuerpo[campo] = valor;
      }
    });

    if (!editandoId && esAdmin && formulario.id_usuario) {
      cuerpo.id_usuario = Number(formulario.id_usuario);
    }

    setEnviando(true);

    try {
      const respuesta = await fetch(
        editandoId
          ? `${API_URL}/api/direcciones/${editandoId}`
          : `${API_URL}/api/direcciones`,
        {
          method: editandoId ? "PUT" : "POST",
          headers: authHeaders(),
          body: JSON.stringify(cuerpo),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "Error al guardar la dirección");
      }

      toast.success(
        editandoId ? "Dirección actualizada correctamente" : "Dirección creada correctamente"
      );

      limpiarFormulario();
      await recargarDirecciones();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const editarDireccion = (direccion) => {
    setEditandoId(direccion.id_direccion);
    setFormulario({
      id_usuario: String(direccion.id_usuario ?? ""),
      departamento: direccion.departamento ?? "",
      ciudad: direccion.ciudad ?? "",
      zona: direccion.zona ?? "",
      direccion: direccion.direccion ?? "",
      referencia: direccion.referencia ?? "",
      telefono: direccion.telefono ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminarDireccion = async (id) => {
    if (!window.confirm(`¿Estás seguro de eliminar la dirección #${id}?`)) {
      return;
    }

    try {
      const respuesta = await fetch(`${API_URL}/api/direcciones/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "Error al eliminar la dirección");
      }

      toast.success("Dirección eliminada correctamente");
      await recargarDirecciones();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (cargando) return <p className="cargando">Cargando direcciones...</p>;

  if (error) {
    return (
      <div>
        <header className="header">
          <div>
            <h1>Direcciones</h1>
            <p>Administración de direcciones</p>
          </div>
        </header>
        <section className="panel">
          <p className="error-mensaje">{error}</p>
        </section>
      </div>
    );
  }

  const direccionesFiltradas = direcciones.filter(
    (direccion) =>
      filtroUsuario === "todos" || String(direccion.id_usuario) === filtroUsuario
  );

  return (
    <div>
      <header className="header">
        <div>
          <h1>Direcciones</h1>
          <p>Administración de direcciones de envío</p>
        </div>
      </header>

      <div className="tarjetas">
        <div className="tarjeta">
          <h3>Direcciones</h3>
          <p className="numero">{direcciones.length}</p>
          <span>registradas</span>
        </div>
        <div className="tarjeta">
          <h3>Usuarios</h3>
          <p className="numero">
            {new Set(direcciones.map((direccion) => direccion.id_usuario)).size}
          </p>
          <span>con dirección</span>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>{editandoId ? `Editar dirección #${editandoId}` : "Nueva dirección"}</h2>
          {editandoId && (
            <button className="boton boton-cancelar" onClick={limpiarFormulario}>
              Cancelar edición
            </button>
          )}
        </div>

        <form className="formulario" onSubmit={guardarDireccion}>
          {esAdmin && !editandoId && (
            <div className="campo">
              <label>Usuario (opcional)</label>
              <select
                name="id_usuario"
                value={formulario.id_usuario}
                onChange={manejarCambio}
              >
                <option value="">Para mí</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id_usuario} value={usuario.id_usuario}>
                    {usuario.nombre} {usuario.apellido} · {usuario.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="campo">
            <label>Departamento</label>
            <input
              type="text"
              name="departamento"
              value={formulario.departamento}
              onChange={manejarCambio}
              placeholder="Ej: La Paz"
              maxLength={100}
            />
          </div>

          <div className="campo">
            <label>Ciudad</label>
            <input
              type="text"
              name="ciudad"
              value={formulario.ciudad}
              onChange={manejarCambio}
              placeholder="Ej: El Alto"
              maxLength={100}
            />
          </div>

          <div className="campo">
            <label>Zona</label>
            <input
              type="text"
              name="zona"
              value={formulario.zona}
              onChange={manejarCambio}
              placeholder="Ej: Villa Adela"
              maxLength={100}
            />
          </div>

          <div className="campo">
            <label>Dirección *</label>
            <input
              type="text"
              name="direccion"
              value={formulario.direccion}
              onChange={manejarCambio}
              placeholder="Ej: Av. 6 de marzo #123"
              maxLength={255}
              required
            />
          </div>

          <div className="campo">
            <label>Referencia</label>
            <input
              type="text"
              name="referencia"
              value={formulario.referencia}
              onChange={manejarCambio}
              placeholder="Ej: Frente a la plaza"
              maxLength={255}
            />
          </div>

          <div className="campo">
            <label>Teléfono</label>
            <input
              type="text"
              name="telefono"
              value={formulario.telefono}
              onChange={manejarCambio}
              placeholder="Ej: 71234567"
              maxLength={30}
            />
          </div>

          <div className="formulario-acciones">
            <button className="boton boton-principal" type="submit" disabled={enviando}>
              <MapPin size={16} />{" "}
              {enviando
                ? "Guardando..."
                : editandoId
                  ? "Guardar cambios"
                  : "Agregar dirección"}
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Lista de direcciones ({direccionesFiltradas.length})</h2>

          {esAdmin && (
            <div className="filtros">
              <select
                className="select-filtro"
                value={filtroUsuario}
                onChange={(e) => setFiltroUsuario(e.target.value)}
              >
                <option value="todos">Todos los usuarios</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id_usuario} value={usuario.id_usuario}>
                    {usuario.nombre} {usuario.apellido}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {direccionesFiltradas.length === 0 ? (
          <p className="sin-resultados">No hay direcciones registradas</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Departamento</th>
                <th>Ciudad</th>
                <th>Zona</th>
                <th>Dirección</th>
                <th>Referencia</th>
                <th>Teléfono</th>
                <th>Opciones</th>
              </tr>
            </thead>
            <tbody>
              {direccionesFiltradas.map((direccion) => (
                <tr key={direccion.id_direccion}>
                  <td>{direccion.id_direccion}</td>
                  <td>#{direccion.id_usuario}</td>
                  <td>{direccion.departamento || "—"}</td>
                  <td>{direccion.ciudad || "—"}</td>
                  <td>{direccion.zona || "—"}</td>
                  <td>{direccion.direccion}</td>
                  <td>{direccion.referencia || "—"}</td>
                  <td>{direccion.telefono || "—"}</td>
                  <td>
                    <div className="acciones">
                      <button
                        onClick={() => editarDireccion(direccion)}
                        className="boton-editar"
                        title="Editar dirección"
                      >
                        <Pencil size={20} />
                      </button>
                      <button
                        onClick={() => eliminarDireccion(direccion.id_direccion)}
                        className="boton-eliminar"
                        title="Eliminar dirección"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default Direcciones;
