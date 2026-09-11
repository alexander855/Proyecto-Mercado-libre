// Login.jsx
// src/components/Login.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../css/Login.css";
import toast from "react-hot-toast";

function Login() {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    email: "",
    password: ""
  });

  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [cargando, setCargando] = useState(false);
  const [verPassword, setVerPassword] = useState(false);

  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
    if (errores[name]) setErrores({ ...errores, [name]: "" });
    if (errorGeneral) setErrorGeneral("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (cargando) return;

    setCargando(true);
    setErrorGeneral("");
    setErrores({});

    try {
      console.log("📤 Enviando login:", formulario.email);

      const respuesta = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formulario)
      });

      const datos = await respuesta.json();
      console.log("📥 Respuesta:", datos);

      if (!respuesta.ok) {
        if (datos.errores && Array.isArray(datos.errores)) {
          const erroresMap = {};
          datos.errores.forEach(err => {
            erroresMap[err.campo] = err.mensaje;
          });
          setErrores(erroresMap);
          toast.error("Profavor corrija los errores");
          setCargando(false);
          return;
        }
        throw new Error(datos.mensaje || "Error al iniciar sesión");
      }

      
      localStorage.setItem("token", datos.token);
      localStorage.setItem("usuario", JSON.stringify(datos.usuario));

      toast.success(`¡Bienvenido, ${datos.usuario.nombre}!`);

      
      window.location.href = "/";

    } catch (error) {
      console.error("❌ Error:", error);
      setErrorGeneral(error.message);
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      setCargando(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🔐</div>
          <h1>Iniciar Sesión</h1>
          <p>Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                type="email"
                id="email"
                name="email"
                value={formulario.email}
                onChange={manejarCambio}
                placeholder="tu-email@ejemplo.com"
                autoComplete="email"
                required
                disabled={cargando}
              />
            </div>
            {errores.email && <span className="error-campo">{errores.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type={verPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formulario.password}
                onChange={manejarCambio}
                placeholder="Tu contraseña"
                autoComplete="current-password"
                required
                disabled={cargando}
              />
              <button
                type="button"
                className="btn-toggle-password"
                onClick={() => setVerPassword(!verPassword)}
                tabIndex={-1}
              >
                {verPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errores.password && <span className="error-campo">{errores.password}</span>}
          </div>

          {errorGeneral && (
            <div className="error-general">
              <span>⚠️</span> {errorGeneral}
            </div>
          )}

          <button type="submit" className="btn-login" disabled={cargando}>
            {cargando ? "Iniciando..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            ¿No tienes cuenta? <Link to="/Register">Regístrate aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;