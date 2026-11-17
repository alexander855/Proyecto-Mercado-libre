import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, Plus, ShoppingCart, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { API_URL, authHeaders, getUsuarioSesion } from "../api";
import {
  claseEstadoCarrito,
  formatearFecha,
  formatearMonto,
} from "../utils";

function CarritoDetalle() {
  const { id } = useParams();
  const navegacion = useNavigate();
  const { id_usuario: usuarioId } = getUsuarioSesion();

  const [carrito, setCarrito] = useState(null);
  const [productos, setProductos] = useState([]);
  const [direcciones, setDirecciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [item, setItem] = useState({ id_producto: "", cantidad: "1" });
  const [direccionId, setDireccionId] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [creandoPedido, setCreandoPedido] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const respuestaCarrito = await fetch(`${API_URL}/api/carritos/${id}`, {
          headers: authHeaders(),
        });
        const datosCarrito = await respuestaCarrito.json();

        if (!respuestaCarrito.ok) {
          throw new Error(datosCarrito.mensaje || "Error al obtener el carrito");
        }

        setCarrito(datosCarrito);

        const respuestaProductos = await fetch(`${API_URL}/api/productos`);
        const datosProductos = await respuestaProductos.json();

        if (respuestaProductos.ok && Array.isArray(datosProductos)) {
          setProductos(datosProductos);
        }

        const respuestaDirecciones = await fetch(`${API_URL}/api/direcciones`, {
          headers: authHeaders(),
        });
        const datosDirecciones = await respuestaDirecciones.json();

        if (respuestaDirecciones.ok && Array.isArray(datosDirecciones)) {
          const propias = datosDirecciones.filter(
            (direccion) => direccion.id_usuario === usuarioId
          );
          setDirecciones(propias);
          setDireccionId((actual) =>
            actual || (propias.length ? String(propias[0].id_direccion) : "")
          );
        }
      } catch (err) {
        console.error("Error al cargar el carrito:", err);
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [id, usuarioId]);

  const recargarCarrito = async () => {
    const respuesta = await fetch(`${API_URL}/api/carritos/${id}`, {
      headers: authHeaders(),
    });
    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(datos.mensaje || "Error al obtener el carrito");
    }

    setCarrito(datos);
  };

  const manejarCambioItem = (e) => {
    const { name, value } = e.target;
    setItem((actual) => ({ ...actual, [name]: value }));
  };

  const agregarItem = async (e) => {
    e.preventDefault();

    if (!item.id_producto) {
      toast.error("Selecciona un producto");
      return;
    }

    setEnviando(true);

    try {
      const respuesta = await fetch(`${API_URL}/api/carritos/${id}/items`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          id_producto: Number(item.id_producto),
          cantidad: Number(item.cantidad),
        }),
      });
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "Error al agregar el producto");
      }

      toast.success(datos.mensaje || "Producto agregado");
      setItem({ id_producto: "", cantidad: "1" });
      await recargarCarrito();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const cambiarCantidad = async (detalle, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;

    if (nuevaCantidad > Number(detalle.stock)) {
      toast.error(`Stock insuficiente: solo hay ${detalle.stock} unidades`);
      return;
    }

    try {
      const respuesta = await fetch(
        `${API_URL}/api/carritos/${id}/items/${detalle.id_detalle}`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({ cantidad: nuevaCantidad }),
        }
      );
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "Error al actualizar la cantidad");
      }

      await recargarCarrito();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const quitarItem = async (idDetalle) => {
    if (!window.confirm("¿Quitar este producto del carrito?")) return;

    try {
      const respuesta = await fetch(
        `${API_URL}/api/carritos/${id}/items/${idDetalle}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        }
      );
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "Error al quitar el producto");
      }

      toast.success("Producto eliminado del carrito");
      await recargarCarrito();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const crearPedido = async () => {
    if (!direccionId) {
      toast.error("Selecciona una dirección de envío");
      return;
    }

    setCreandoPedido(true);

    try {
      const respuesta = await fetch(`${API_URL}/api/pedidos`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          id_direccion: Number(direccionId),
          costo_envio: 0,
          descuento: 0,
        }),
      });
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "Error al crear el pedido");
      }

      toast.success("Pedido creado correctamente");
      navegacion("/pedidos");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreandoPedido(false);
    }
  };

  const eliminarCarrito = async () => {
    if (!window.confirm(`¿Eliminar el carrito #${id} y todos sus ítems?`)) {
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

      toast.success("Carrito eliminado correctamente");
      navegacion("/carritos");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (cargando) return <p className="cargando">Cargando carrito...</p>;

  if (error) {
    return (
      <div>
        <header className="header">
          <div>
            <h1>Detalle del carrito</h1>
            <p>Ítems y subtotal del carrito</p>
          </div>
        </header>
        <section className="panel">
          <p className="error-mensaje">{error}</p>
          <button
            className="boton boton-volver"
            onClick={() => navegacion("/carritos")}
          >
            <ArrowLeft size={16} /> Volver a carritos
          </button>
        </section>
      </div>
    );
  }

  const detalles = carrito?.detalles ?? [];
  const activo = carrito?.estado === "activo";
  const esPropio = carrito?.id_usuario === usuarioId;
  const productosDisponibles = productos.filter(
    (producto) =>
      producto.estado !== "agotado" && Number(producto.stock) > 0
  );

  return (
    <div>
      <header className="header">
        <div>
          <h1>Carrito #{carrito.id_carrito}</h1>
          <p>
            Usuario #{carrito.id_usuario} · {formatearFecha(carrito.fecha_creacion)}
          </p>
        </div>
        <button
          className="boton boton-volver"
          onClick={() => navegacion("/carritos")}
        >
          <ArrowLeft size={16} /> Volver
        </button>
      </header>

      <div className="tarjetas">
        <div className="tarjeta">
          <h3>Estado</h3>
          <p className={`numero ${claseEstadoCarrito(carrito.estado)}`}>
            {carrito.estado}
          </p>
          <span>del carrito</span>
        </div>
        <div className="tarjeta">
          <h3>Ítems</h3>
          <p className="numero">{detalles.length}</p>
          <span>productos distintos</span>
        </div>
        <div className="tarjeta">
          <h3>Subtotal</h3>
          <p className="numero">{formatearMonto(carrito.subtotal)}</p>
          <span>sin envío</span>
        </div>
      </div>

      {!activo && (
        <div className="nota">
          Este carrito está en estado <strong>{carrito.estado}</strong> y ya no se
          puede modificar.
        </div>
      )}

      {activo && (
        <section className="panel">
          <h2>Agregar producto</h2>

          {productosDisponibles.length === 0 ? (
            <p className="sin-resultados">
              No hay productos con stock disponible.
            </p>
          ) : (
            <form className="formulario" onSubmit={agregarItem}>
              <div className="campo">
                <label>Producto *</label>
                <select
                  name="id_producto"
                  value={item.id_producto}
                  onChange={manejarCambioItem}
                  required
                >
                  <option value="">Seleccione un producto</option>
                  {productosDisponibles.map((producto) => (
                    <option
                      key={producto.id_producto}
                      value={producto.id_producto}
                    >
                      {producto.nombre} · {formatearMonto(producto.precio)} ·
                      stock {producto.stock}
                    </option>
                  ))}
                </select>
              </div>

              <div className="campo">
                <label>Cantidad *</label>
                <input
                  type="number"
                  name="cantidad"
                  value={item.cantidad}
                  onChange={manejarCambioItem}
                  min="1"
                  required
                />
              </div>

              <div className="formulario-acciones">
                <button
                  className="boton boton-principal"
                  type="submit"
                  disabled={enviando}
                >
                  <Plus size={16} /> {enviando ? "Agregando..." : "Agregar al carrito"}
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      <section className="panel">
        <h2>Ítems del carrito ({detalles.length})</h2>

        {detalles.length === 0 ? (
          <p className="sin-resultados">El carrito está vacío</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                  <th>Opciones</th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((detalle) => (
                  <tr key={detalle.id_detalle}>
                    <td>{detalle.nombre}</td>
                    <td>{formatearMonto(detalle.precio)}</td>
                    <td>{detalle.stock}</td>
                    <td>
                      {activo ? (
                        <div className="cantidad-controles">
                          <button
                            className="boton boton-principal"
                            onClick={() =>
                              cambiarCantidad(detalle, detalle.cantidad - 1)
                            }
                            disabled={detalle.cantidad <= 1}
                            title="Quitar una unidad"
                          >
                            −
                          </button>
                          <span>{detalle.cantidad}</span>
                          <button
                            className="boton boton-principal"
                            onClick={() =>
                              cambiarCantidad(detalle, detalle.cantidad + 1)
                            }
                            disabled={detalle.cantidad >= Number(detalle.stock)}
                            title="Agregar una unidad"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        detalle.cantidad
                      )}
                    </td>
                    <td>{formatearMonto(detalle.subtotal)}</td>
                    <td>
                      {activo ? (
                        <button
                          className="boton-eliminar"
                          onClick={() => quitarItem(detalle.id_detalle)}
                          title="Quitar del carrito"
                        >
                          <Trash2 size={20} />
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="resumen-totales">
              <div>Ítems: {detalles.length}</div>
              <div>Subtotal: {formatearMonto(carrito.subtotal)}</div>
            </div>
          </>
        )}
      </section>

      {activo && esPropio && detalles.length > 0 && (
        <section className="panel">
          <h2>Crear pedido</h2>

          {direcciones.length === 0 ? (
            <p className="sin-resultados">
              Necesitas una dirección de envío para crear el pedido.{" "}
              <button
                className="boton boton-principal"
                onClick={() => navegacion("/direcciones")}
              >
                Agregar dirección
              </button>
            </p>
          ) : (
            <div className="formulario">
              <div className="campo">
                <label>Dirección de envío *</label>
                <select
                  value={direccionId}
                  onChange={(e) => setDireccionId(e.target.value)}
                >
                  {direcciones.map((direccion) => (
                    <option
                      key={direccion.id_direccion}
                      value={direccion.id_direccion}
                    >
                      {direccion.direccion}
                      {direccion.ciudad ? ` · ${direccion.ciudad}` : ""}
                      {direccion.zona ? ` · ${direccion.zona}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="formulario-acciones">
                <button
                  className="boton boton-principal"
                  onClick={crearPedido}
                  disabled={creandoPedido}
                >
                  <CheckCircle size={16} />{" "}
                  {creandoPedido
                    ? "Creando pedido..."
                    : "Confirmar pedido desde el carrito"}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      <section className="panel">
        <h2>Acciones del carrito</h2>
        <button className="boton boton-eliminar" onClick={eliminarCarrito}>
          <ShoppingCart size={16} /> Eliminar carrito completo
        </button>
      </section>
    </div>
  );
}

export default CarritoDetalle;
