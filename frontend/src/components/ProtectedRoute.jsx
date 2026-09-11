
import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children, rolesPermitidos }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

 
  if (!token) {
    return <Navigate to="/login" replace />;
  }

 
  let usuario;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const ahora = Math.floor(Date.now() / 1000);

    if (payload.exp <= ahora) {
      // Token expirado → limpiar y redirigir
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      return <Navigate to="/login" replace />;
    }

    usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  } catch {
    // Token malformado → limpiar y redirigir
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    return <Navigate to="/login" replace />;
  }

  
  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return (
      <div style={{
        padding: "60px 20px",
        textAlign: "center",
        fontFamily: "sans-serif"
      }}>
        <h1 style={{ fontSize: "60px", margin: 0 }}>🚫</h1>
        <h2 style={{ color: "#dc2626" }}>Acceso denegado</h2>
        <p style={{ color: "#666", marginBottom: "30px" }}>
          No tienes permisos para ver esta página
        </p>
        <button
          onClick={() => window.location.href = "/"}
          style={{
            padding: "12px 24px",
            background: "#4caf50",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: "pointer"
          }}
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  
  return children;
}

export default ProtectedRoute;