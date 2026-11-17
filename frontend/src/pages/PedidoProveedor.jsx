import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { API_URL, authHeaders, getUsuarioSesion } from "../api";
import { claseEstadoPedido, formatearFecha, formatearMonto } from "../utils";

const ESTADOS = ["pendiente", "confirmado", "enviado", "entregado", "cancelado"];

function PedidoProveedor() {
  const { id } = useParams();
  const navegacion = useNavigate();
  const esAdmin = getUsuarioSesion().rol === "admin";

  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [actualizandoId, setActualizandoId] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const respuesta = await fetch(`${API_URL}/api/pedidos/${id}`, {
          headers: authHeaders(),
        });
        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(datos.mensaje || "Error al obtener el pedido");
        }

        setPedido(datos);
      } catch (err) {
        console.error("Error al cargar el pedido:", err);
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [id]);

  const cambiarEstadoProveedor = async (idProveedor, estado) => {
    setActualizandoId(idProveedor);

    try {
      const respuesta = await fetch(
        `${API_URL}/api/pedidos-proveedor/${idProveedor}`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({ estado }),
        }
      );
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje || "Error al actualizar el pedido del proveedor"
        );
      }

      setPedido((actual) => ({
        ...actual,
        proveedores: actual.proveedores.map((proveedor) =>
          proveedor.id_pedido_proveedor === idProveedor
            ? { ...proveedor, estado }
            : proveedor
        ),
      }));
      toast.success("Estado del proveedor actualizado");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActualizandoId(null);
    }
  };

  if (cargando) return <p className="cargando">Cargando pedido...</p>;

  if (error) {
    return (
      <div>
        <header className="header">
          <div>
            <h1>Proveedores del pedido</h1>
            <p>Distribución del pedido por proveedor</p>
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

  const proveedores = pedido.proveedores ?? [];
  const totalItems = proveedores.reduce(
    (total, proveedor) => total + proveedor.detalles.length,
    0
  );

  return (
    <div>
      <header className="header">
        <div>
          <h1>Pedido #{pedido.id_pedido} · Proveedores</h1>
          <p>
            Usuario #{pedido.id_usuario} · {formatearFecha(pedido.fecha_pedido)}
          </p>
        </div>
        <button
          className="boton boton-volver"
          onClick={() => navegacion("/pedidos")}
        >
          <ArrowLeft size={16} /> Volver a pedidos
        </button>
      </header>

      <div className="tarjetas">
        <div className="tarjeta">
          <h3>Estado</h3>
          <p className={`numero ${claseEstadoPedido(pedido.estado)}`}>
            {pedido.estado}
          </p>
          <span>del pedido</span>
        </div>
        <div className="tarjeta">
          <h3>Proveedores</h3>
          <p className="numero">{proveedores.length}</p>
          <span>involucrados</span>
        </div>
        <div className="tarjeta">
          <h3>Productos</h3>
          <p className="numero">{totalItems}</p>
          <span>ítems en total</span>
        </div>
        <div className="tarjeta">
          <h3>Total</h3>
          <p className="numero">{formatearMonto(pedido.total)}</p>
          <span>del pedido</span>
        </div>
      </div>

      <section className="panel">
        <h2>Distribución por proveedor</h2>

        {proveedores.length === 0 ? (
          <p className="sin-resultados">
            Este pedido no tiene proveedores asociados
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Proveedor</th>
                <th>Estado</th>
                <th>Subtotal</th>
                <th>Productos</th>
                <th>Opciones</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map((proveedor) => (
                <tr key={proveedor.id_pedido_proveedor}>
                  <td>{proveedor.id_pedido_proveedor}</td>
                  <td>{proveedor.proveedor}</td>
                  <td>
                    {esAdmin ? (
                      <select
                        className="select-estado"
                        value={proveedor.estado}
                        disabled={
                          actualizandoId === proveedor.id_pedido_proveedor
                        }
                        onChange={(e) =>
                          cambiarEstadoProveedor(
                            proveedor.id_pedido_proveedor,
                            e.target.value
                          )
                        }
                      >
                        {ESTADOS.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={claseEstadoPedido(proveedor.estado)}>
                        {proveedor.estado}
                      </span>
                    )}
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
                      className="boton-editar"
                      title="Ver detalle del proveedor"
                      onClick={() =>
                        navegacion(
                          `/pedidos-proveedor/${proveedor.id_pedido_proveedor}/detalle`
                        )
                      }
                    >
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="panel">
        <h2>Resumen económico</h2>
        <div className="resumen-totales">
          <div>Subtotal productos: {formatearMonto(pedido.subtotal_productos)}</div>
          <div>Costo de envío: {formatearMonto(pedido.costo_envio)}</div>
          <div>Descuento: {formatearMonto(pedido.descuento)}</div>
          <div>Total: {formatearMonto(pedido.total)}</div>
        </div>
      </section>
    </div>
  );
}

export default PedidoProveedor;
