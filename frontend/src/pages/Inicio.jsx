import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CreditCard,
  ClipboardList,
  MapPin,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Store,
  AlertTriangle,
} from "lucide-react";
import { API_URL, authHeaders, getUsuarioSesion } from "../api";
import {
  claseEstadoPedido,
  formatearFecha,
  formatearMonto,
} from "../utils";

function Inicio() {
  const usuario = getUsuarioSesion();
  const esAdmin = usuario.rol === "admin";

  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [carritos, setCarritos] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const pedir = async (ruta) => {
      const respuesta = await fetch(`${API_URL}${ruta}`, {
        headers: authHeaders(),
      });
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || `Error al obtener ${ruta}`);
      }

      return Array.isArray(datos) ? datos : [];
    };

    const cargar = async () => {
      try {
        const [
          datosProductos,
          datosProveedores,
          datosCategorias,
          datosPedidos,
          datosCarritos,
          datosPagos,
        ] = await Promise.all([
          pedir("/api/productos"),
          pedir("/api/proveedores"),
          pedir("/api/categorias"),
          pedir("/api/pedidos"),
          pedir("/api/carritos"),
          pedir("/api/pagos"),
        ]);

        setProductos(datosProductos);
        setProveedores(datosProveedores);
        setCategorias(datosCategorias);
        setPedidos(datosPedidos);
        setCarritos(datosCarritos);
        setPagos(datosPagos);

        if (esAdmin) {
          setUsuarios(await pedir("/api/usuarios"));
        }
      } catch (err) {
        console.error("Error al cargar el panel:", err);
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [esAdmin]);

  const claseRol = ["admin", "vendedor", "cliente"].includes(usuario.rol)
    ? `badge badge-${usuario.rol}`
    : "badge";

  if (cargando) return <p className="cargando">Cargando panel...</p>;

  if (error) {
    return (
      <div>
        <header className="header">
          <div>
            <h1>Panel principal</h1>
            <p>Resumen general del sistema</p>
          </div>
        </header>
        <section className="panel">
          <p className="error-mensaje">{error}</p>
        </section>
      </div>
    );
  }

  const productosConStockBajo = productos
    .filter(
      (producto) =>
        producto.estado === "agotado" || Number(producto.stock) <= 5
    )
    .sort((a, b) => Number(a.stock) - Number(b.stock));

  const pedidosRecientes = [...pedidos]
    .sort(
      (a, b) => new Date(b.fecha_pedido) - new Date(a.fecha_pedido)
    )
    .slice(0, 5);

  const pedidosPendientes = pedidos.filter(
    (pedido) => pedido.estado === "pendiente"
  ).length;

  const carritosActivos = carritos.filter(
    (carrito) => carrito.estado === "activo"
  ).length;

  const ingresos = pedidos
    .filter((pedido) => pedido.estado !== "cancelado")
    .reduce((total, pedido) => total + Number(pedido.total || 0), 0);

  const pagosCompletados = pagos.filter(
    (pago) => pago.estado === "completado"
  ).length;

  const fechaActual = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <header className="header">
        <div>
          <h1>Panel principal</h1>
          <p>Resumen general del sistema</p>
        </div>
        <div className="usuario">
          {usuario.nombre || "Invitado"} · {usuario.rol || "invitado"}
        </div>
      </header>

      <section className="panel">
        <div className="dashboard-bienvenida">
          <div>
            <h2>Bienvenido, {usuario.nombre || "usuario"}</h2>
            <p>
              Tienes {pedidosPendientes} pedido(s) pendiente(s) y{" "}
              {carritosActivos} carrito(s) activo(s).
            </p>
          </div>
          <span className={claseRol}>{usuario.rol}</span>
        </div>
        <p className="dashboard-fecha">{fechaActual}</p>
      </section>

      <div className="tarjetas">
        <div className="tarjeta">
          <h3>
            <Package size={16} /> Productos
          </h3>
          <p className="numero">{productos.length}</p>
          <span>
            {categorias.length} categorías · {productosConStockBajo.length} con
            stock bajo o agotado
          </span>
        </div>
        <div className="tarjeta">
          <h3>
            <ClipboardList size={16} /> Pedidos
          </h3>
          <p className="numero">{pedidos.length}</p>
          <span>{pedidosPendientes} pendientes de procesar</span>
        </div>
        <div className="tarjeta">
          <h3>
            <TrendingUp size={16} /> Ingresos
          </h3>
          <p className="numero">{formatearMonto(ingresos)}</p>
          <span>sin pedidos cancelados</span>
        </div>
        <div className="tarjeta">
          <h3>
            <ShoppingCart size={16} /> Carritos activos
          </h3>
          <p className="numero">{carritosActivos}</p>
          <span>{carritos.length} carritos en total</span>
        </div>
        {esAdmin && (
          <div className="tarjeta">
            <h3>
              <Users size={16} /> Usuarios
            </h3>
            <p className="numero">{usuarios.length}</p>
            <span>{proveedores.length} proveedores registrados</span>
          </div>
        )}
        <div className="tarjeta">
          <h3>
            <CreditCard size={16} /> Pagos
          </h3>
          <p className="numero">{pagosCompletados}</p>
          <span>pagos completados</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <h2>Pedidos recientes</h2>
            <Link to="/pedidos" className="enlace-ver">
              Ver todos
            </Link>
          </div>

          {pedidosRecientes.length === 0 ? (
            <p className="sin-resultados">Todavía no hay pedidos</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {pedidosRecientes.map((pedido) => (
                  <tr key={pedido.id_pedido}>
                    <td>{pedido.id_pedido}</td>
                    <td>{formatearFecha(pedido.fecha_pedido)}</td>
                    <td>
                      <span className={claseEstadoPedido(pedido.estado)}>
                        {pedido.estado}
                      </span>
                    </td>
                    <td>{formatearMonto(pedido.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>
              <AlertTriangle size={18} /> Stock bajo
            </h2>
            <Link to="/productos" className="enlace-ver">
              Ver productos
            </Link>
          </div>

          {productosConStockBajo.length === 0 ? (
            <p className="sin-resultados">Todo el inventario está en orden</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {productosConStockBajo.slice(0, 6).map((producto) => (
                  <tr key={producto.id_producto}>
                    <td>{producto.nombre}</td>
                    <td>
                      <span
                        className={
                          producto.estado === "agotado" ||
                          Number(producto.stock) === 0
                            ? "stock-agotado"
                            : "stock-bajo"
                        }
                      >
                        {producto.estado === "agotado" ||
                        Number(producto.stock) === 0
                          ? "Agotado"
                          : `${producto.stock} u.`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      <section className="panel">
        <h2>Accesos rápidos</h2>

        <div className="acciones-rapidas">
          <Link to="/productos" className="acceso-rapido">
            <Package size={20} />
            <div>
              <strong>Productos</strong>
              <span>Gestiona el catálogo y el inventario</span>
            </div>
          </Link>
          <Link to="/carritos" className="acceso-rapido">
            <ShoppingCart size={20} />
            <div>
              <strong>Carritos</strong>
              <span>Revisa los carritos activos</span>
            </div>
          </Link>
          <Link to="/pedidos" className="acceso-rapido">
            <ClipboardList size={20} />
            <div>
              <strong>Pedidos</strong>
              <span>Sigue el estado de los pedidos</span>
            </div>
          </Link>
          <Link to="/pagos" className="acceso-rapido">
            <CreditCard size={20} />
            <div>
              <strong>Pagos</strong>
              <span>Registra y revisa los pagos</span>
            </div>
          </Link>
          <Link to="/direcciones" className="acceso-rapido">
            <MapPin size={20} />
            <div>
              <strong>Direcciones</strong>
              <span>Administra las direcciones de envío</span>
            </div>
          </Link>
          {esAdmin && (
            <Link to="/usuarios" className="acceso-rapido">
              <Users size={20} />
              <div>
                <strong>Usuarios</strong>
                <span>Administra las cuentas del sistema</span>
              </div>
            </Link>
          )}
          <Link to="/proveedores" className="acceso-rapido">
            <Store size={20} />
            <div>
              <strong>Proveedores</strong>
              <span>Consulta los proveedores registrados</span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Inicio;
