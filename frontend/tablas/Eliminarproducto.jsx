import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/EliminarCategoria.css"

function Eliminarproducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Obtener datos del producto
    fetch(`http://localhost:3000/api/productos/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProducto(data);
        setCargando(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setCargando(false);
      });
  }, [id]);

  const eliminarProducto = async () => {
    try {
      const respuesta = await fetch(`http://localhost:3000/api/productos/${id}`, {
        method: "DELETE"
      });

      if (!respuesta.ok) {
        throw new Error("Error al eliminar");
      }

      alert("Proveedor eliminado correctamente");
      navigate("/Productos");

    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar el producto");
    }
  };

  if (cargando) return <p>Cargando...</p>;
  if (!producto) return <p>Producto no encontrada</p>;

  return (
    <div className="eliminar-categoria">
      <h1>Eliminar proveedor</h1>
      <p>¿Estás seguro de eliminar el producto <strong>"{producto.nombre}"</strong>?</p>
      <p className="advertencia">Esta acción no se puede deshacer.</p>
      
      <div className="botones">
        <button onClick={() => navigate("/Productos")}>
          Cancelar
        </button>
        <button onClick={eliminarProducto} className="boton-eliminar">
          Sí, eliminar
        </button>
      </div>
    </div>
  );
}

export default Eliminarproducto;