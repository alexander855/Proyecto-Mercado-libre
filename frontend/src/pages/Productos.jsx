import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, NavLink, useNavigate, } from "react-router-dom";
import { Pencil, Trash2 } from 'lucide-react';

function Productos() {
  const navegacion = useNavigate();

  const [productos, setproductos] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/productos")
      .then((respuesta) => respuesta.json())
      .then((datos) => {
        setproductos(datos);
      })
      .catch((error) => {
        console.error("Error al obtener productos:", error);
      });
  }, []);

  
  const formaatearhora = (fecha) => {
    return new Date (fecha).toLocaleDateString('es-Es' , {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    });
  };
  return (
    <div>
      <header className="header">
        <div>
          <h1>Productos</h1>
          <p>Administración de Productos</p>
        </div>
      </header>
      <section className="panel">
        <button
          className="boton-agregar"
          onClick={() => navegacion(`/tablas/agregarproducto`)}
        >
          {" "}
          Agregar nuevo Producto +{" "}
        </button>
        <h2>Lista de productos</h2>
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Proveedor</th>
              <th>categoria</th>
              <th>Nombre</th>
              <th>Descripcion</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Fecha de publicacion</th>
              <th>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((Producto) => (
              <tr key={Producto.id_producto}>
                <td>{Producto.id_producto}</td>
                <td>{Producto.proveedor}</td>
                <td>{Producto.categoria}</td>
                <td>{Producto.nombre}</td>
                <td>{Producto.descripcion}</td>
                <td>{Producto.precio}</td>
                <td>{Producto.stock}</td>
                <td>{Producto.estado}</td>
                <td>{formaatearhora(Producto.fecha_publicacion)}</td>


                <td>
                  <div className="flex gap-4">
                    {/* Icono de Editar */}
                    <button
                      onClick={() => navegacion(`/tablas/Editarproducto/${Producto.id_producto}`)}
                      className="boton-editar"
                    >
                      <Pencil size={20} />
                    </button>

                    {/* Icono de Eliminar */}
                    <button
                      onClick={() => navegacion(`/tablas/Eliminarproducto/${Producto.id_producto}`)}
                      className="boton-eliminar"
                    >
                      <Trash2 size={20} />
                    </button>
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

export default Productos;