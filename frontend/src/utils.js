export function formatearMonto(valor) {
  return Number(valor || 0).toFixed(2);
}

export function formatearFecha(fecha) {
  if (!fecha) return "—";

  return new Date(fecha).toLocaleString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function claseEstadoPedido(estado) {
  switch (estado) {
    case "pendiente":
      return "estado-pendiente";
    case "confirmado":
      return "estado-confirmado";
    case "enviado":
      return "estado-enviado";
    case "entregado":
      return "estado-entregado";
    case "cancelado":
      return "estado-rechazado";
    default:
      return "";
  }
}

export function claseEstadoCarrito(estado) {
  switch (estado) {
    case "activo":
      return "estado-completado";
    case "convertido":
      return "estado-reembolsado";
    case "abandonado":
      return "estado-rechazado";
    default:
      return "";
  }
}
