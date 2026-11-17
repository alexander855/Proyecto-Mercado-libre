import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { API_URL, authHeaders, getUsuarioSesion } from "../api";
import { claseEstadoPedido, formatearMonto } from "../utils";

const ESTADOS = ["pendiente", "confirmado", "enviado", "entregado", "cancelado"];

function PedidoDetalle() {
  const { id } = useParams();
  const navegacion = useNavigate();
  const esAdmin = getUsuarioSesion().rol === "admin";

  const [proveedor, setProveedor] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [actualizando, setActualizando] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const respuesta = await fetch(
          `${API_URL}/api/pedidos-proveedor/${id}`,
          { headers: authHeaders() }
        );
        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(
            datos.mensaje || "Error al obtener el pedido del proveedor"
          );
        }

        setProveedor(datos);
      } catch (err) {
        console.error("Error al cargar el pedido del proveedor:", err);
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [id]);

  const cambiarEstado = async (estado) => {
    setActualizando(true);

    try {
      const respuesta = await fetch(
        `${API_URL}/api/pedidos-proveedor/${id}`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({ estado }),
        }
      );
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "Error al actualizar el estado");
      }

      setProveedor((actual) => ({ ...actual, estado }));
      toast.success("Estado actualizado correctamente");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActualizando(false);
    }
  };

  if (cargando) return <p className="cargando">Cargando detalle...</p>;

  if (error) {
    return (
      <div>
        <header className="header">
          <div>
            <h1>Detalle del proveedor</h1>
            <p>Productos solicitados al proveedor</p>
          </div>
        </header>
        <section className="panel">
          <p className="error-mensaje">{error}</p>
          <button
            className="boton boton-volver"
            onClick={() => navegacion("/pedidos")}
          >
            <ArrowLeft size={16} /> Volver a pedidos
          </button>
        </section>
      </div>
    );
  }

  const detalles = proveedor.detalles ?? [];
  const unidades = detalles.reduce(
    (total, detalle) => total + Number(detalle.cantidad),
    0
  );

  return (
    <div>
      <header className="header">
        <div>
          <h1>{proveedor.proveedor}</h1>
          <p>
            Pedido #{proveedor.id_pedido} · Pedido proveedor #
            {proveedor.id_pedido_proveedor}
          </p>
        </div>
        <button
          className="boton boton-volver"
          onClick={() =>
            navegacion(`/pedidos/${proveedor.id_pedido}/proveedores`)
          }
        >
          <ArrowLeft size={16} /> Volver al pedido
        </button>
      </header>

      <div className="tarjetas">
        <div className="tarjeta">
          <h3>Estado</h3>
          <p className={`numero ${claseEstadoPedido(proveedor.estado)}`}>
            {proveedor.estado}
          </p>
          <span>del proveedor</span>
        </div>
        <div className="tarjeta">
          <h3>Productos</h3>
          <p className="numero">{detalles.length}</p>
          <span>distintos</span>
        </div>
        <div className="tarjeta">
          <h3>Unidades</h3>
          <p className="numero">{unidades}</p>
          <span>en total</span>
        </div>
        <div className="tarjeta">
          <h3>Subtotal</h3>
          <p className="numero">{formatearMonto(proveedor.subtotal)}</p>
          <span>del proveedor</span>
        </div>
      </div>

      {esAdmin && (
        <section className="panel">
          <div className="panel-header">
            <h2>Cambiar estado</h2>
          </div>
          <div className="formulario">
            <div className="campo">
              <label>Estado del pedido del proveedor</label>
              <select
                className="select-estado"
                value={proveedor.estado}
                disabled={actualizando}
                onChange={(e) => cambiarEstado(e.target.value)}
              >
                {ESTADOS.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
      )}

      <section className="panel">
        <h2>Productos solicitados ({detalles.length})</h2>

        {detalles.length === 0 ? (
          <p className="sin-resultados">Sin productos registrados</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio unitario</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((detalle) => (
                  <tr key={detalle.id_detalle}>
                    <td>
                      {detalle.imagen ? (
                        <img
                          src={detalle.imagen}
                          alt={detalle.producto}
                          className="imagen-producto"
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{detalle.producto}</td>
                    <td>{detalle.cantidad}</td>
                    <td>{formatearMonto(detalle.precio_unitario)}</td>
                    <td>{formatearMonto(detalle.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="resumen-totales">
              <div>Unidades: {unidades}</div>
              <div>Subtotal: {formatearMonto(proveedor.subtotal)}</div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default PedidoDetalle;
