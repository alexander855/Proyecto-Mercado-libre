import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Package, Trash2, Truck } from "lucide-react";
import toast from "react-hot-toast";
import { API_URL, authHeaders, getUsuarioSesion } from "../api";
import { claseEstadoPedido, formatearFecha, formatearMonto } from "../utils";

const ESTADOS = ["pendiente", "confirmado", "enviado", "entregado", "cancelado"];

function Pedidos() {
  const navegacion = useNavigate();
  const esAdmin = getUsuarioSesion().rol === "admin";

  const [pedidos, setPedidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroUsuario, setFiltroUsuario] = useState("todos");
  const [expandido, setExpandido] = useState(null);
  const [detalles, setDetalles] = useState({});

  useEffect(() => {
    const cargar = async () => {
      try {
        const respuesta = await fetch(`${API_URL}/api/pedidos`, {
          headers: authHeaders(),
        });
        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(datos.mensaje || "Error al obtener pedidos");
        }

        setPedidos(Array.isArray(datos) ? datos : []);

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
        console.error("Error al cargar pedidos:", err);
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [esAdmin]);

  const recargarPedidos = async () => {
    const respuesta = await fetch(`${API_URL}/api/pedidos`, {
      headers: authHeaders(),
    });
    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(datos.mensaje || "Error al obtener pedidos");
    }

    setPedidos(Array.isArray(datos) ? datos : []);
  };

  const alternarDetalle = async (id) => {
    if (expandido === id) {
      setExpandido(null);
      return;
    }

    setExpandido(id);

    if (detalles[id]) return;

    try {
      const respuesta = await fetch(`${API_URL}/api/pedidos/${id}`, {
        headers: authHeaders(),
      });
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "Error al obtener el pedido");
      }

      setDetalles((actuales) => ({ ...actuales, [id]: datos }));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const cambiarEstado = async (id, estado) => {
    try {
      const respuesta = await fetch(`${API_URL}/api/pedidos/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ estado }),
      });
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "Error al actualizar el pedido");
      }

      toast.success("Estado del pedido actualizado");
      setDetalles((actuales) => {
        const copia = { ...actuales };
        delete copia[id];
        return copia;
      });
      await recargarPedidos();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const eliminarPedido = async (id) => {
    if (
      !window.confirm(
        `¿Eliminar el pedido #${id}? Solo se permiten pedidos pendientes o cancelados sin pagos.`
      )
    ) {
      return;
    }

    try {
      const respuesta = await fetch(`${API_URL}/api/pedidos/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "Error al eliminar el pedido");
      }

      toast.success("Pedido eliminado correctamente");
      setPedidos((actuales) =>
        actuales.filter((pedido) => pedido.id_pedido !== id)
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (cargando) return <p className="cargando">Cargando pedidos...</p>;

  if (error) {
    return (
      <div>
        <header className="header">
          <div>
            <h1>Pedidos</h1>
            <p>Administración de pedidos</p>
          </div>
        </header>
        <section className="panel">
          <p className="error-mensaje">{error}</p>
        </section>
      </div>
    );
  }

  const pedidosFiltrados = pedidos.filter(
    (pedido) =>
      (filtroEstado === "todos" || pedido.estado === filtroEstado) &&
      (filtroUsuario === "todos" ||
        String(pedido.id_usuario) === filtroUsuario)
  );

  const contarEstado = (estado) =>
    pedidos.filter((pedido) => pedido.estado === estado).length;

  const ingresos = pedidos
    .filter((pedido) => pedido.estado !== "cancelado")
    .reduce((total, pedido) => total + Number(pedido.total || 0), 0);

  return (
    <div>
      <header className="header">
        <div>
          <h1>Pedidos</h1>
          <p>Administración de pedidos</p>
        </div>
        <button
          className="boton boton-principal"
          onClick={() => navegacion("/carritos")}
        >
          <Package size={16} /> Ir a carritos
        </button>
      </header>

      <div className="tarjetas">
        <div className="tarjeta">
          <h3>Total</h3>
          <p className="numero">{pedidos.length}</p>
          <span>pedidos</span>
        </div>
        <div className="tarjeta">
          <h3>Pendientes</h3>
          <p className="numero">{contarEstado("pendiente")}</p>
          <span>por procesar</span>
        </div>
        <div className="tarjeta">
          <h3>Entregados</h3>
          <p className="numero">{contarEstado("entregado")}</p>
          <span>completados</span>
        </div>
        <div className="tarjeta">
          <h3>Ingresos</h3>
          <p className="numero">{formatearMonto(ingresos)}</p>
          <span>sin cancelados</span>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Lista de pedidos ({pedidosFiltrados.length})</h2>

          <div className="filtros">
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

            {esAdmin && (
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
            )}
          </div>
        </div>

        {pedidosFiltrados.length === 0 ? (
          <p className="sin-resultados">No hay pedidos registrados</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Subtotal</th>
                <th>Envío</th>
                <th>Descuento</th>
                <th>Total</th>
                <th>Opciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map((pedido) => (
                <FragmentoPedido
                  key={pedido.id_pedido}
                  pedido={pedido}
                  esAdmin={esAdmin}
                  expandido={expandido === pedido.id_pedido}
                  detalle={detalles[pedido.id_pedido]}
                  onAlternar={() => alternarDetalle(pedido.id_pedido)}
                  onCambiarEstado={(estado) =>
                    cambiarEstado(pedido.id_pedido, estado)
                  }
                  onEliminar={() => eliminarPedido(pedido.id_pedido)}
                  onVerProveedores={() =>
                    navegacion(`/pedidos/${pedido.id_pedido}/proveedores`)
                  }
                  onVerProveedor={(idProveedor) =>
                    navegacion(`/pedidos-proveedor/${idProveedor}/detalle`)
                  }
                />
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function FragmentoPedido({
  pedido,
  esAdmin,
  expandido,
  detalle,
  onAlternar,
  onCambiarEstado,
  onEliminar,
  onVerProveedores,
  onVerProveedor,
}) {
  return (
    <>
      <tr>
        <td>{pedido.id_pedido}</td>
        <td>#{pedido.id_usuario}</td>
        <td>{formatearFecha(pedido.fecha_pedido)}</td>
        <td>
          {esAdmin ? (
            <select
              className="select-estado"
              value={pedido.estado}
              onChange={(e) => onCambiarEstado(e.target.value)}
            >
              {ESTADOS.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          ) : (
            <span className={claseEstadoPedido(pedido.estado)}>
              {pedido.estado}
            </span>
          )}
        </td>
        <td>{formatearMonto(pedido.subtotal_productos)}</td>
        <td>{formatearMonto(pedido.costo_envio)}</td>
        <td>{formatearMonto(pedido.descuento)}</td>
        <td>{formatearMonto(pedido.total)}</td>
        <td>
          <div className="acciones">
            <button
              onClick={onAlternar}
              className="boton-editar"
              title={expandido ? "Ocultar detalle" : "Ver detalle"}
            >
              {expandido ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            <button
              onClick={onVerProveedores}
              className="boton-editar"
              title="Ver proveedores"
            >
              <Truck size={20} />
            </button>
            {esAdmin && (
              <button
                onClick={onEliminar}
                className="boton-eliminar"
                title="Eliminar pedido"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </td>
      </tr>

      {expandido && (
        <tr>
          <td colSpan={9}>
            {!detalle ? (
              <p className="cargando">Cargando detalle...</p>
            ) : (
              <div className="detalle-pedido">
                <p>
                  Dirección #{detalle.id_direccion} · {detalle.proveedores.length}{" "}
                  proveedor(es)
                </p>

                {detalle.proveedores.length === 0 ? (
                  <p className="sin-resultados">Sin proveedores asociados</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Proveedor</th>
                        <th>Estado</th>
                        <th>Subtotal</th>
                        <th>Productos</th>
                        <th>Opciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalle.proveedores.map((proveedor) => (
                        <tr key={proveedor.id_pedido_proveedor}>
                          <td>{proveedor.proveedor}</td>
                          <td>
                            <span className={claseEstadoPedido(proveedor.estado)}>
                              {proveedor.estado}
                            </span>
                          </td>
                          <td>{formatearMonto(proveedor.subtotal)}</td>
                          <td>
                            {proveedor.detalles.length} ítem(s)
                            <ul>
                              {proveedor.detalles.map((item) => (
                                <li key={item.id_detalle}>
                                  {item.producto} × {item.cantidad} ={" "}
                                  {formatearMonto(item.subtotal)}
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td>
                            <button
                              className="boton boton-secundario"
                              onClick={() =>
                                onVerProveedor(proveedor.id_pedido_proveedor)
                              }
                            >
                              Ver detalle
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

export default Pedidos;
