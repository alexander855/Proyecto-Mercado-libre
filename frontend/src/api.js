const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function authHeaders(extra = {}) {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export function getUsuarioSesion() {
  try {
    return JSON.parse(localStorage.getItem("usuario") || "{}");
  } catch {
    return {};
  }
}

export function tieneRol(...roles) {
  return roles.includes(getUsuarioSesion().rol);
}

export { API_URL };
