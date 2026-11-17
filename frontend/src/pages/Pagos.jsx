import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { API_URL, authHeaders, getUsuarioSesion } from "../api";

const ESTADOS = ["pendiente", "completado", "rechazado", "reembolsado"];
const METODOS = ["Tarjeta", "Efectivo", "Transferencia", "QR"];

function Pagos() {
  const esAdmin = getUsuarioSesion().rol === "admin";

  const [pagos, setPagos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [enviando, setEnviando] = useState(false);
  const [formulario, setFormulario] = useState({
    id_pedido: "",
    metodo_pago: "Tarjeta",
    monto: "",
    estado: "pendiente",
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [respuestaPagos, respuestaPedidos] = await Promise.all([
          fetch(`${API_URL}/api/pagos`, { headers: authHeaders() }),
          fetch(`${API_URL}/api/pedidos`, { headers: authHeaders() }),
        ]);

        const datosPagos = await respuestaPagos.json();
        if (!respuestaPagos.ok) {
          throw new Error(datosPagos.mensaje || "Error al obtener pagos");
        }

        const datosPedidos = await respuestaPedidos.json();
        if (!respuestaPedidos.ok) {
          throw new Error(datosPedidos.mensaje || "Error al obtener pedidos");
        }

        setPagos(Array.isArray(datosPagos) ? datosPagos : []);
        setPedidos(Array.isArray(datosPedidos) ? datosPedidos : []);
      } catch (err) {
        console.error("Error al cargar pagos:", err);
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
  };

  const registrarPago = async (e) => {
    e.preventDefault();

    if (!formulario.id_pedido) {
      toast.error("Selecciona un pedido");
      return;
    }

    const cuerpo = {
      id_pedido: Number(formulario.id_pedido),
      metodo_pago: formulario.metodo_pago.trim(),
    };

    if (formulario.monto !== "") {
      cuerpo.monto = Number(formulario.monto);
    }

    if (esAdmin && formulario.estado) {
      cuerpo.estado = formulario.estado;
    }

    setEnviando(true);

    try {
      const respuesta = await fetch(`${API_URL}/api/pagos`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(cuerpo),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "Error al registrar el pago");
      }

      toast.success(datos.mensaje || "Pago registrado correctamente");
      if (datos.pago) {
        setPagos((actuales) => [...actuales, datos.pago]);
      }
      setFormulario((actual) => ({
        ...actual,
        id_pedido: "",
        monto: "",
        estado: "pendiente",
      }));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const cambiarEstado = async (id, estado) => {
    try {
      const respuesta = await fetch(`${API_URL}/api/pagos/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ estado }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "Error al actualizar el pago");
      }

      setPagos((actuales) =>
        actuales.map((pago) =>
          pago.id_pago === id ? { ...pago, estado } : pago
        )
      );
      toast.success("Estado del pago actualizado");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const eliminarPago = async (id) => {
    if (!window.confirm(`¿Estás seguro de eliminar el pago #${id}?`)) {
      return;
    }

    try {
      const respuesta = await fetch(`${API_URL}/api/pagos/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "Error al eliminar el pago");
      }

      setPagos((actuales) => actuales.filter((pago) => pago.id_pago !== id));
      toast.success("Pago eliminado correctamente");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const formatearMonto = (valor) => Number(valor || 0).toFixed(2);

  const formatearFecha = (fecha) =>
    fecha
      ? new Date(fecha).toLocaleString("es-ES", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  const colorEstado = (estado) => {
    switch (estado) {
      case "completado":
        return "estado-completado";
      case "pendiente":
        return "estado-pendiente";
      case "rechazado":
        return "estado-rechazado";
      case "reembolsado":
        return "estado-reembolsado";
      default:
        return "";
    }
  };

  const totalCobrado = pagos
    .filter((pago) => pago.estado === "completado")
    .reduce((total, pago) => total + Number(pago.monto || 0), 0);

  const totalPendiente = pagos
    .filter((pago) => pago.estado === "pendiente")
    .reduce((total, pago) => total + Number(pago.monto || 0), 0);

  const pedidosDisponibles = pedidos.filter(
    (pedido) => pedido.estado !== "cancelado"
  );

  const pagosFiltrados = pagos.filter(
    (pago) => filtroEstado === "todos" || pago.estado === filtroEstado
  );

  if (cargando) return <p className="cargando">Cargando pagos...</p>;

  if (error) {
    return (
      <div>
        <header className="header">
          <div>
            <h1>Pagos</h1>
            <p>Administración de pagos</p>
          </div>
        </header>
        <section className="panel">
          <p className="error-mensaje">{error}</p>
        </section>
      </div>
    );
  }

  return (
    <div>
      <header className="header">
        <div>
          <h1>Pagos</h1>
          <p>Administración de pagos</p>
        </div>
      </header>

      <div className="tarjetas">
        <div className="tarjeta">
          <h3>Registros</h3>
          <p className="numero">{pagos.length}</p>
          <span>pagos registrados</span>
        </div>
        <div className="tarjeta">
          <h3>Cobrado</h3>
          <p className="numero">{formatearMonto(totalCobrado)}</p>
          <span>pagos completados</span>
        </div>
        <div className="tarjeta">
          <h3>Pendiente</h3>
          <p className="numero">{formatearMonto(totalPendiente)}</p>
          <span>por confirmar</span>
        </div>
      </div>

      <section className="panel">
        <h2>Registrar pago</h2>

        {pedidosDisponibles.length === 0 ? (
          <p className="sin-resultados">
            No hay pedidos disponibles para pagar. Crea un pedido primero.
          </p>
        ) : (
          <form className="formulario" onSubmit={registrarPago}>
            <div className="campo">
              <label>Pedido *</label>
              <select
                name="id_pedido"
                value={formulario.id_pedido}
                onChange={manejarCambio}
                required
              >
                <option value="">Seleccione un pedido</option>
                {pedidosDisponibles.map((pedido) => (
                  <option key={pedido.id_pedido} value={pedido.id_pedido}>
                    Pedido #{pedido.id_pedido} · {pedido.estado} · total{" "}
                    {formatearMonto(pedido.total)}
                  </option>
                ))}
              </select>
            </div>

            <div className="campo">
              <label>Método de pago *</label>
              <select
                name="metodo_pago"
                value={formulario.metodo_pago}
                onChange={manejarCambio}
                required
              >
                {METODOS.map((metodo) => (
                  <option key={metodo} value={metodo}>
                    {metodo}
                  </option>
                ))}
              </select>
            </div>

            <div className="campo">
              <label>Monto</label>
              <input
                type="number"
                name="monto"
                value={formulario.monto}
                onChange={manejarCambio}
                placeholder="Vacío = saldo restante"
                min="0.01"
                step="0.01"
              />
            </div>

            {esAdmin && (
              <div className="campo">
                <label>Estado</label>
                <select
                  name="estado"
                  value={formulario.estado}
                  onChange={manejarCambio}
                >
                  {ESTADOS.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="formulario-acciones">
              <button type="submit" disabled={enviando}>
                {enviando ? "Registrando..." : "Registrar pago"}
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="panel">
        <h2>Lista de pagos ({pagosFiltrados.length})</h2>

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
        </div>

        {pagosFiltrados.length === 0 ? (
          <p className="sin-resultados">No hay pagos registrados</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Pedido</th>
                <th>Método</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Opciones</th>
              </tr>
            </thead>
            <tbody>
              {pagosFiltrados.map((pago) => (
                <tr key={pago.id_pago}>
                  <td>{pago.id_pago}</td>
                  <td>#{pago.id_pedido}</td>
                  <td>{pago.metodo_pago}</td>
                  <td>{formatearMonto(pago.monto)}</td>
                  <td>
                    {esAdmin ? (
                      <select
                        className="select-estado"
                        value={pago.estado}
                        onChange={(e) =>
                          cambiarEstado(pago.id_pago, e.target.value)
                        }
                      >
                        {ESTADOS.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={colorEstado(pago.estado)}>
                        {pago.estado}
                      </span>
                    )}
                  </td>
                  <td>{formatearFecha(pago.fecha_pago)}</td>
                  <td>
                    <div className="acciones">
                      {esAdmin && pago.estado !== "completado" ? (
                        <button
                          onClick={() => eliminarPago(pago.id_pago)}
                          className="boton-eliminar"
                          title="Eliminar pago"
                        >
                          <Trash2 size={20} />
                        </button>
                      ) : (
                        "—"
                      )}
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

export default Pagos;
