
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/EliminarCategoria.css"

function Eliminarcategoria() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Obtener datos de la categoría
    fetch(`http://localhost:3000/api/categorias/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setCategoria(data);
        setCargando(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setCargando(false);
      });
  }, [id]);

  const eliminarCategoria = async () => {
    try {
      const respuesta = await fetch(`http://localhost:3000/api/categorias/${id}`, {
        method: "DELETE"
      });

      if (!respuesta.ok) {
        throw new Error("Error al eliminar");
      }

      alert("Categoría eliminada correctamente");
      navigate("/Categorias");

    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar la categoría");
    }
  };

  if (cargando) return <p>Cargando...</p>;
  if (!categoria) return <p>Categoría no encontrada</p>;

  return (
    <div className="eliminar-categoria">
      <h1>Eliminar categoría</h1>
      <p>¿Estás seguro de eliminar la categoría <strong>"{categoria.nombre}"</strong>?</p>
      <p className="advertencia">Esta acción no se puede deshacer.</p>
      
      <div className="botones">
        <button onClick={() => navigate("/Categorias")}>
          Cancelar
        </button>
        <button onClick={eliminarCategoria} className="boton-eliminar">
          Sí, eliminar
        </button>
      </div>
    </div>
  );
}

export default Eliminarcategoria;