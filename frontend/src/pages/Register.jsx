import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../css/Login.css";
import toast from "react-hot-toast";
import { API_URL } from "../api";

function Register() {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    telefono: ""
  });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [cargando, setCargando] = useState(false);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
    if (errores[name]) setErrores({ ...errores, [name]: "" });
    if (errorGeneral) setErrorGeneral("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (cargando) return;

    setCargando(true);
    setErrorGeneral("");
    setErrores({});

    try {
      const respuesta = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formulario)
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        if (datos.errores && Array.isArray(datos.errores)) {
          const erroresMap = {};
          datos.errores.forEach((err) => {
            erroresMap[err.campo] = err.mensaje;
          });
          setErrores(erroresMap);
          toast.error("Corrige los campos marcados");
          return;
        }
        throw new Error(datos.mensaje || "Error al registrarse");
      }

      localStorage.setItem("token", datos.token);
      localStorage.setItem("usuario", JSON.stringify(datos.usuario));

      toast.success(`¡Bienvenido, ${datos.usuario.nombre}!`);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error:", error);
      setErrorGeneral(error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">📝</div>
          <h1>Crear cuenta</h1>
          <p>Regístrate para comprar en Mercado Libre</p>
        </div>

        <form onSubmit={handleRegister} className="login-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formulario.nombre}
              onChange={manejarCambio}
              placeholder="Tu nombre"
              autoComplete="given-name"
              required
              disabled={cargando}
            />
            {errores.nombre && <span className="error-campo">{errores.nombre}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="apellido">Apellido</label>
            <input
              type="text"
              id="apellido"
              name="apellido"
              value={formulario.apellido}
              onChange={manejarCambio}
              placeholder="Tu apellido"
              autoComplete="family-name"
              required
              disabled={cargando}
            />
            {errores.apellido && <span className="error-campo">{errores.apellido}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
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
            {errores.email && <span className="error-campo">{errores.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formulario.password}
              onChange={manejarCambio}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
              minLength={6}
              required
              disabled={cargando}
            />
            {errores.password && <span className="error-campo">{errores.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Teléfono (opcional)</label>
            <input
              type="text"
              id="telefono"
              name="telefono"
              value={formulario.telefono}
              onChange={manejarCambio}
              placeholder="Ej: 78945612"
              autoComplete="tel"
              disabled={cargando}
            />
            {errores.telefono && <span className="error-campo">{errores.telefono}</span>}
          </div>

          {errorGeneral && (
            <div className="error-general">
              <span>⚠️</span> {errorGeneral}
            </div>
          )}

          <button type="submit" className="btn-login" disabled={cargando}>
            {cargando ? "Registrando..." : "Registrarme"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
