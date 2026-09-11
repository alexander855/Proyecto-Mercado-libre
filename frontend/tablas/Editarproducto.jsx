import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/Agregarcategoria.css";

function EditarProducto() {
  const navigate = useNavigate();
  const { id } = useParams(); // Obtener el ID del producto de la URL

  // Estado del formulario
  const [formulario, setFormulario] = useState({
    id_proveedor: "",
    id_categoria: "",
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    imagen: "",
    estado: "disponoble"
  });

  // Estados para los selects y carga
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Cargar datos del producto y los selects
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar proveedores y categorías en paralelo
        const [proveedoresRes, categoriasRes, productoRes] = await Promise.all([
          fetch("http://localhost:3000/api/proveedores"),
          fetch("http://localhost:3000/api/categorias"),
          fetch(`http://localhost:3000/api/productos/${id}`) // Obtener producto específico
        ]);

        const proveedoresData = await proveedoresRes.json();
        const categoriasData = await categoriasRes.json();
        const productoData = await productoRes.json();

        setProveedores(proveedoresData);
        setCategorias(categoriasData);
        
        // Llenar el formulario con los datos del producto
        setFormulario({
          id_proveedor: productoData.id_proveedor || "",
          id_categoria: productoData.id_categoria || "",
          nombre: productoData.nombre || "",
          descripcion: productoData.descripcion || "",
          precio: productoData.precio || "",
          stock: productoData.stock || "",
          imagen: productoData.imagen || "",
          estado: productoData.estado || "disponible"
        });

        setCargando(false);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setError("Error al cargar los datos del producto");
        setCargando(false);
      }
    };

    cargarDatos();
  }, [id]);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario({
      ...formulario,
      [name]: value
    });
  };

  const actualizarProducto = async (e) => {
    e.preventDefault();

    try {
      // Validar campos requeridos
      if (!formulario.id_proveedor || !formulario.id_categoria) {
        alert("Por favor selecciona un proveedor y una categoría");
        return;
      }

      const respuesta = await fetch(
        `http://localhost:3000/api/productos/${id}`,
        {
          method: "PUT", // ← Método PUT para actualizar
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formulario)
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {

      
        throw new Error(datos.mensaje || "Error al actualizar producto");
      }

      
      alert(" Producto actualizado correctamente");
      navigate("/Productos"); 
      

    } catch (error) {
      console.error("Error:", error);
      alert(` Error al actualizar el producto: ${error.message}`);
    }
  };

  // Mostrar carga
  if (cargando) {
    return (
      <div className="categoria">
        <h1>Cargando datos del producto...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="categoria">
        <h1>Error</h1>
        <p>{error}</p>
        <button onClick={() => navigate("/Productos")}>Volver a productos</button>
      </div>
    );
  }

  return (
    <div className="categoria">
      <h1>Editar Producto</h1>

      <form onSubmit={actualizarProducto}>
        {/* Proveedor */}
        <div>
          <label>Proveedor</label>
          <select
            name="id_proveedor"
            value={formulario.id_proveedor}
            onChange={manejarCambio}
            required
          >
            <option value="">Seleccione un proveedor</option>
            {proveedores.map((proveedor) => (
              <option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
                {proveedor.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Categoría */}
        <div>
          <label>Categoría</label>
          <select
            name="id_categoria"
            value={formulario.id_categoria}
            onChange={manejarCambio}
            required
          >
            <option value="">Seleccione una categoría</option>
            {categorias.map((categoria) => (
              <option key={categoria.id_categoria} value={categoria.id_categoria}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Nombre */}
        <div>
          <label>Nombre</label>
          <input
            type="text"
            name="nombre"
            value={formulario.nombre}
            onChange={manejarCambio}
            placeholder="Ej: Laptop Gamer"
            required
          />
        </div>

        {/* Descripción */}
        <div>
          <label>Descripción</label>
          <input
            type="text"
            name="descripcion"
            value={formulario.descripcion}
            onChange={manejarCambio}
            placeholder="Ej: Descripción del producto"
            required
          />
        </div>

        {/* Precio */}
        <div>
          <label>Precio</label>
          <input
            type="number"
            name="precio"
            value={formulario.precio}
            onChange={manejarCambio}
            placeholder="Ej: 99.99"
            step="0.01"
            min="0"
            required
          />
        </div>

        {/* Stock */}
        <div>
          <label>Stock</label>
          <input
            type="number"
            name="stock"
            value={formulario.stock}
            onChange={manejarCambio}
            placeholder="Ej: 10"
            min="0"
            required
          />
        </div>

        {/* Imagen */}
        <div>
          <label>Imagen</label>
          <input
            type="text"
            name="imagen"
            value={formulario.imagen}
            onChange={manejarCambio}
            placeholder="Ej: laptop.jpg"
          />
        </div>

        {/* Estado */}
        <div>
          <label>Estado</label>
          <select
            name="estado"
            value={formulario.estado}
            onChange={manejarCambio}
          >
            <option value="disponible">Disponible</option>
            <option value="agotado">Agotado</option>
          </select>
        </div>

        <div className="botones">
          <button type="submit">Actualizar Producto</button>
          <button 
            type="button" 
            onClick={() => navigate("/Productos")}
            className="btn-cancelar"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditarProducto;