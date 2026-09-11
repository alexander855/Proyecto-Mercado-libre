import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/EliminarCategoria.css"

function Eliminarproveedor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proveedor, setProveedor] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Obtener datos de la categoría
    fetch(`http://localhost:3000/api/proveedores/${id}`)
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
      const respuesta = await fetch(`http://localhost:3000/api/proveedores/${id}`, {
        method: "DELETE"
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
      <p>¿Estás seguro de eliminar la categoría <strong>"{proveedor.nombre}"</strong>?</p>
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