import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, ShoppingCart, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { API_URL, authHeaders, getUsuarioSesion } from "../api";
import { claseEstadoCarrito, formatearFecha } from "../utils";

const ESTADOS = ["activo", "convertido", "abandonado"];

function Carritos() {
  const navegacion = useNavigate();
  const esAdmin = getUsuarioSesion().rol === "admin";

  const [carritos, setCarritos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [abriendo, setAbriendo] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const respuesta = await fetch(`${API_URL}/api/carritos`, {
          headers: authHeaders(),
        });
        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(datos.mensaje || "Error al obtener carritos");
        }

        setCarritos(Array.isArray(datos) ? datos : []);
      } catch (err) {
        console.error("Error al cargar carritos:", err);
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  const recargarCarritos = async () => {
    const respuesta = await fetch(`${API_URL}/api/carritos`, {
      headers: authHeaders(),
    });
    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(datos.mensaje || "Error al obtener carritos");
    }

    setCarritos(Array.isArray(datos) ? datos : []);
  };

  const abrirCarritoActivo = async () => {
    setAbriendo(true);

    try {
      const respuesta = await fetch(`${API_URL}/api/carritos`, {
        method: "POST",
        headers: authHeaders(),
      });
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "Error al abrir el carrito");
      }

      toast.success(datos.mensaje || "Carrito activo listo");
      await recargarCarritos();

      if (datos.carrito?.id_carrito) {
        navegacion(`/carritos/${datos.carrito.id_carrito}/detalle`);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAbriendo(false);
    }
  };

  const cambiarEstado = async (id, estado) => {
    try {
      const respuesta = await fetch(`${API_URL}/api/carritos/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ estado }),
      });
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "Error al actualizar el carrito");
      }

      setCarritos((actuales) =>
        actuales.map((carrito) =>
          carrito.id_carrito === id ? { ...carrito, estado } : carrito
        )
      );
      toast.success("Estado del carrito actualizado");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const eliminarCarrito = async (id) => {
    if (!window.confirm(`¿Estás seguro de eliminar el carrito #${id}?`)) {
      return;
    }

    try {
      const respuesta = await fetch(`${API_URL}/api/carritos/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "Error al eliminar el carrito");
      }

      setCarritos((actuales) =>
        actuales.filter((carrito) => carrito.id_carrito !== id)
      );
      toast.success("Carrito eliminado correctamente");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (cargando) return <p className="cargando">Cargando carritos...</p>;

  if (error) {
    return (
      <div>
        <header className="header">
          <div>
            <h1>Carritos</h1>
            <p>Administración de carritos</p>
          </div>
        </header>
        <section className="panel">
          <p className="error-mensaje">{error}</p>
        </section>
      </div>
    );
  }

  const carritosFiltrados = carritos.filter(
    (carrito) => filtroEstado === "todos" || carrito.estado === filtroEstado
  );

  const contarPorEstado = (estado) =>
    estado === "todos"
      ? carritos.length
      : carritos.filter((carrito) => carrito.estado === estado).length;

  return (
    <div>
      <header className="header">
        <div>
          <h1>Carritos</h1>
          <p>Administración de carritos</p>
        </div>
        <button
          className="boton boton-principal"
          onClick={abrirCarritoActivo}
          disabled={abriendo}
        >
          <ShoppingCart size={16} />{" "}
          {abriendo ? "Abriendo..." : "Abrir mi carrito activo"}
        </button>
      </header>

      <div className="tarjetas">
        <div className="tarjeta">
          <h3>Total</h3>
          <p className="numero">{contarPorEstado("todos")}</p>
          <span>carritos</span>
        </div>
        <div className="tarjeta">
          <h3>Activos</h3>
          <p className="numero">{contarPorEstado("activo")}</p>
          <span>en uso</span>
        </div>
        <div className="tarjeta">
          <h3>Convertidos</h3>
          <p className="numero">{contarPorEstado("convertido")}</p>
          <span>pasados a pedido</span>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Lista de carritos ({carritosFiltrados.length})</h2>

          <select
            className="select-filtro"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            {ESTADOS.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>

        {carritosFiltrados.length === 0 ? (
          <p className="sin-resultados">
            No hay carritos. Usa "Abrir mi carrito activo" para comenzar.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Estado</th>
                <th>Creado</th>
                <th>Opciones</th>
              </tr>
            </thead>
            <tbody>
              {carritosFiltrados.map((carrito) => (
                <tr key={carrito.id_carrito}>
                  <td>{carrito.id_carrito}</td>
                  <td>#{carrito.id_usuario}</td>
                  <td>
                    {esAdmin ? (
                      <select
                        className="select-estado"
                        value={carrito.estado}
                        onChange={(e) =>
                          cambiarEstado(carrito.id_carrito, e.target.value)
                        }
                      >
                        {ESTADOS.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={claseEstadoCarrito(carrito.estado)}>
                        {carrito.estado}
                      </span>
                    )}
                  </td>
                  <td>{formatearFecha(carrito.fecha_creacion)}</td>
                  <td>
                    <div className="acciones">
                      <button
                        onClick={() =>
                          navegacion(`/carritos/${carrito.id_carrito}/detalle`)
                        }
                        className="boton-editar"
                        title="Ver detalle"
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        onClick={() => eliminarCarrito(carrito.id_carrito)}
                        className="boton-eliminar"
                        title="Eliminar carrito"
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

export default Carritos;
