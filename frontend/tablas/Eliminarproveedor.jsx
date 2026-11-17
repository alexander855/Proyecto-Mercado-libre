import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/Eliminarcategoria.css";
import { API_URL, authHeaders } from "../src/api";

function Eliminarproveedor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proveedor, setProveedor] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Obtener datos de la categoría
    fetch(`${API_URL}/api/proveedores/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProveedor(data);
        setCargando(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setCargando(false);
      });
  }, [id]);

  const eliminarCategoria = async () => {
    try {
      const respuesta = await fetch(`${API_URL}/api/proveedores/${id}`, {
        method: "DELETE",
        headers: authHeaders()
      });

      if (!respuesta.ok) {
        throw new Error("Error al eliminar");
      }

      alert("Proveedor eliminado correctamente");
      navigate("/Proveedores");

    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar al Proveedor");
    }
  };

  if (cargando) return <p>Cargando...</p>;
  if (!proveedor) return <p>Proveedor no encontrada</p>;

  return (
    <div className="eliminar-categoria">
      <h1>Eliminar proveedor</h1>
      <p>¿Estás seguro de eliminar el proveedor <strong>"{proveedor.nombre}"</strong>?</p>
      <p className="advertencia">Esta acción no se puede deshacer.</p>
      
      <div className="botones">
        <button onClick={() => navigate("/Proveedores")}>
          Cancelar
        </button>
        <button onClick={eliminarCategoria} className="boton-eliminar">
          Sí, eliminar
        </button>
      </div>
    </div>
  );
}

export default Eliminarproveedor;