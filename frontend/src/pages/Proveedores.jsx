import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from 'lucide-react';
import { API_URL, tieneRol } from "../api";

function Proveedores() {
  const navegacion = useNavigate();
  const puedeEditar = tieneRol("admin", "vendedor");
  const puedeEliminar = tieneRol("admin");

  const [proveedores, setproveedores] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/proveedores`)
      .then((respuesta) => respuesta.json())
      .then((datos) => {
        setproveedores(datos);
      })
      .catch((error) => {
        console.error("Error al obtener proveedores:", error);
      });
  }, []);

  
  const formaatearhora = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return (
    <div>
      <header className="header">
        <div>
          <h1>Proveedores</h1>
          <p>Administración de Proveedores</p>
        </div>
      </header>
      <section className="panel">
        {puedeEditar && (
          <button
            className="boton-agregar"
            onClick={() => navegacion(`/tablas/agregarproveedor`)}
          >
            {" "}
            Agregar nuevo Proveedor +{" "}
          </button>
        )}
        <h2>Lista de proveedores</h2>
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Nombre</th>
              <th>Telefono</th>
              <th>Correo Electronico</th>
              <th>Direccion</th>
              <th>Estado</th>
              <th>Fecha de registro</th>
              <th>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map((Proveedor) => (
              <tr key={Proveedor.id_proveedor}>
                <td>{Proveedor.id_proveedor}</td>
                <td>{Proveedor.nombre}</td>
                <td>{Proveedor.telefono}</td>
                <td>{Proveedor.email}</td>
                <td>{Proveedor.direccion}</td>
                <td>{Proveedor.estado}</td>
                <td>{formaatearhora(Proveedor.fecha_registro)}</td>


                <td>
                  <div className="flex gap-4">
                    {puedeEditar && (
                      <button
                        onClick={() => navegacion(`/tablas/Editarproveedor/${Proveedor.id_proveedor}`)}
                        className="boton-editar"
                        title="Editar proveedor"
                      >
                        <Pencil size={20} />
                      </button>
                    )}

                    {puedeEliminar && (
                      <button
                        onClick={() => navegacion(`/tablas/Eliminarproveedor/${Proveedor.id_proveedor}`)}
                        className="boton-eliminar"
                        title="Eliminar proveedor"
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

export default Proveedores;