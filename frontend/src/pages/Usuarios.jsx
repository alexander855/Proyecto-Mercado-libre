import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, UserPlus, Shield, User } from "lucide-react";

function Usuarios() {
  const navegacion = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const obtenerUsuarios = async () => {
      try {
        const token = localStorage.getItem("token");

        const respuesta = await fetch("http://localhost:3000/api/usuarios", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(datos.mensaje || "Error al obtener usuarios");
        }

        setUsuarios(datos);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
        setError(error.message);
      } finally {
        setCargando(false);
      }
    };

    obtenerUsuarios();
  }, []);

  const eliminarUsuario = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar al usuario "${nombre}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const respuesta = await fetch(`http://localhost:3000/api/usuarios/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "Error al eliminar");
      }

      alert(" Usuario eliminado correctamente");

      
      setUsuarios(usuarios.filter((u) => u.id_usuario !== id));
    } catch (error) {
      console.error("Error:", error);
      alert(` ${error.message}`);
    }
  };

  
  const usuariosFiltrados = usuarios.filter((usuario) => {
    
    const cumpleRol = filtroRol === "todos" || usuario.rol === filtroRol;

    const termino = busqueda.toLowerCase();
    const cumpleBusqueda =
      !busqueda ||
      usuario.nombre?.toLowerCase().includes(termino) ||
      usuario.apellido?.toLowerCase().includes(termino) ||
      usuario.email?.toLowerCase().includes(termino);

    return cumpleRol && cumpleBusqueda;
  });


  const contarPorRol = (rol) => {
    if (rol === "todos") return usuarios.length;
    return usuarios.filter((u) => u.rol === rol).length;
  };

  const colorRol = (rol) => {
    switch (rol?.toLowerCase()) {
      case "admin":
        return "badge badge-admin";
      case "vendedor":
        return "badge badge-vendedor";
      case "cliente":
      case "usuario":
        return "badge badge-cliente";
      default:
        return "badge";
    }
  };

  
  const colorEstado = (estado) => {
    return estado?.toLowerCase() === "activo"
      ? "estado estado-activo"
      : "estado estado-inactivo";
  };

  if (cargando) return <p className="cargando">Cargando usuarios...</p>;

  if (error) {
    return (
      <div>
        <h1>Error</h1>
        <p className="error-mensaje">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <header className="header">
        <div>
          <h1>Usuarios</h1>
          <p>Administración de usuarios del sistema</p>
        </div>
      </header>

      {/*  Tarjetas de estadísticas */}
      <div className="estadisticas">
        <div className="tarjeta-estadistica">
          <h3>Total</h3>
          <p>{contarPorRol("todos")}</p>
        </div>
        <div className="tarjeta-estadistica">
          <h3>
            <Shield size={16} /> Admins
          </h3>
          <p>{contarPorRol("admin")}</p>
        </div>
        <div className="tarjeta-estadistica">
          <h3>Vendedores</h3>
          <p>{contarPorRol("vendedor")}</p>
        </div>
        <div className="tarjeta-estadistica">
          <h3>
            <User size={16} /> Clientes
          </h3>
          <p>{contarPorRol("cliente")}</p>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <button
            className="boton-agregar"
            onClick={() => navegacion(`/tablas/agregarusuario`)}
          >
            <UserPlus size={18} /> Agregar nuevo usuario
          </button>
        </div>

        {/*  Filtros y búsqueda */}
        <div className="filtros">
          <input
            type="text"
            placeholder="🔍 Buscar por nombre, apellido o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-busqueda"
          />

          <select
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
            className="select-filtro"
          >
            <option value="todos">Todos los roles</option>
            <option value="admin">Administradores</option>
            <option value="vendedor">Vendedores</option>
            <option value="cliente">Clientes</option>
            <option value="usuario">Usuarios</option>
          </select>
        </div>

        <h2>Lista de usuarios ({usuariosFiltrados.length})</h2>

        {usuariosFiltrados.length === 0 ? (
          <p className="sin-resultados">No se encontraron usuarios</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Fecha registro</th>
                <th>Opciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id_usuario}>
                  <td>{usuario.id_usuario}</td>

                  <td>
                    {usuario.nombre} {usuario.apellido}
                  </td>

                  <td>{usuario.email}</td>

                  <td>{usuario.telefono || "—"}</td>

                  <td>
                    <span className={colorRol(usuario.rol)}>
                      {usuario.rol}
                    </span>
                  </td>

                  <td>
                    <span className={colorEstado(usuario.estado)}>
                      {usuario.estado || "activo"}
                    </span>
                  </td>

                  <td>
                    {usuario.fecha_registro
                      ? new Date(usuario.fecha_registro).toLocaleDateString("es-ES")
                      : "—"}
                  </td>

                  <td>
                    <div className="flex gap-4">
                      <button
                        onClick={() =>
                          navegacion(
                            `/tablas/Editarusuario/${usuario.id_usuario}`
                          )
                        }
                        className="boton-editar"
                        title="Editar usuario"
                      >
                        <Pencil size={20} />
                      </button>

                      <button
                        onClick={() =>
                          eliminarUsuario(
                            usuario.id_usuario,
                            `${usuario.nombre} ${usuario.apellido}`
                          )
                        }
                        className="boton-eliminar"
                        title="Eliminar usuario"
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

export default Usuarios;