// src/layouts/PanelLayout.jsx
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../App.css";

function PanelLayout() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const cerrarSesion = () => {
    if (window.confirm("¿Cerrar sesión?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      
      
      window.location.href = "/login";
    }
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <h2>Mercado Libre</h2>
          <span>Panel administrativo</span>
        </div>

        <nav className="menu">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "activo" : "")}>
            Inicio
          </NavLink>
          <NavLink to="/usuarios" className={({ isActive }) => (isActive ? "activo" : "")}>
            Usuarios
          </NavLink>
          <NavLink to="/proveedores" className={({ isActive }) => (isActive ? "activo" : "")}>
            Proveedores
          </NavLink>
          <NavLink to="/categorias" className={({ isActive }) => (isActive ? "activo" : "")}>
            Categorías
          </NavLink>
          <NavLink to="/productos" className={({ isActive }) => (isActive ? "activo" : "")}>
            Productos
          </NavLink>
          <NavLink to="/direcciones" className={({ isActive }) => (isActive ? "activo" : "")}>
            Direcciones
          </NavLink>
          <NavLink to="/carritos" className={({ isActive }) => (isActive ? "activo" : "")}>
            Carritos
          </NavLink>
          <NavLink to="/pedidos" className={({ isActive }) => (isActive ? "activo" : "")}>
            Pedidos
          </NavLink>
          <NavLink to="/pagos" className={({ isActive }) => (isActive ? "activo" : "")}>
            Pagos
          </NavLink>
        </nav>

        <div style={{
          marginTop: "auto",
          padding: "20px",
          borderTop: "1px solid #333",
          color: "#ccc",
          fontSize: "14px"
        }}>

          <div style={{ marginTop: "240px" }}> 
          <p style={{ margin: "0 0 10px 0" }}>
            👤 {usuario.nombre} {usuario.apellido}
          </p>
          <p style={{ margin: "0 0 15px 0", color: "#888", fontSize: "12px" }}>
            {usuario.rol}
          </p>
          ­</div>
          <button
            onClick={cerrarSesion}
            style={{
              width: "100%",
              padding: "8px",
              background: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
             Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="contenido">
        <Outlet />
      </main>
    </div>
  );
}

export default PanelLayout;