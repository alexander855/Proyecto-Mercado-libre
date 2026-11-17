import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from 'lucide-react';
import { API_URL, tieneRol } from "../api";

function Categorias() {
  const navegacion = useNavigate();
  const puedeEditar = tieneRol("admin", "vendedor");
  const puedeEliminar = tieneRol("admin");

  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/categorias`)
      .then((respuesta) => respuesta.json())
      .then((datos) => {
        setCategorias(datos);
      })
      .catch((error) => {
        console.error("Error al obtener categorías:", error);
      });
  }, []);

  return (
    <div>
      <header className="header">
        <div>
          <h1>Categorías</h1>
          <p>Administración de categorías</p>
        </div>
      </header>
      <section className="panel">
        {puedeEditar && (
          <button
            className="boton-agregar"
            onClick={() => navegacion(`/tablas/agregarcategoria`)}
          >
            {" "}
            Agregar nueva categoria +{" "}
          </button>
        )}
        <h2>Lista de categorías</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((categoria) => (
              <tr key={categoria.id_categoria}>
                <td>{categoria.id_categoria}</td>

                <td>{categoria.nombre}</td>

                <td>{categoria.descripcion}</td>

                <td>{categoria.estado}</td>

                <td>
                  <div className="flex gap-4">
                    {puedeEditar && (
                      <button
                        onClick={() => navegacion(`/tablas/Editarcategoria/${categoria.id_categoria}`)}
                        className="boton-editar"
                        title="Editar categoría"
                      >
                        <Pencil size={20} />
                      </button>
                    )}

                    {puedeEliminar && (
                      <button
                        onClick={() => navegacion(`/tablas/Eliminarcategoria/${categoria.id_categoria}`)}
                        className="boton-eliminar"
                        title="Eliminar categoría"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}

                    {!puedeEditar && !puedeEliminar && "—"}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default Categorias;
