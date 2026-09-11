import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Agregarcategoria.css";
import toast from "react-hot-toast";

function Agregarproducto() {
  const navigate = useNavigate();

  
  const [formulario, setFormulario] = useState({
    id_proveedor: "",      
    id_categoria: "",      
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    imagen: "",
    estado: "disponible"       
  });

  
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // cargar proveedores
        const respuestaProveedores = await fetch(
          "http://localhost:3000/api/proveedores"
        );
        const datosProveedores = await respuestaProveedores.json();
        setProveedores(datosProveedores);

        // cargar categorías
        const respuestaCategorias = await fetch(
          "http://localhost:3000/api/categorias"
        );
        const datosCategorias = await respuestaCategorias.json();
        setCategorias(datosCategorias);

        setCargando(false);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setError("Error al cargar los datos del formulario");
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario({
      ...formulario,
      [name]: value
    });
  };

  const guardarProducto = async (e) => {
    e.preventDefault();

    try {
      // validar que los campos requeridos estén llenos
      if (!formulario.id_proveedor || !formulario.id_categoria) {
        alert("Por favor selecciona un proveedor y una categoría");
        return;
      }

       console.log("📤 Enviando datos:", formulario);  
      const respuesta = await fetch(
        "http://localhost:3000/api/productos",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formulario)
        }
      );

      const datos = await respuesta.json();

       console.log("📥 Respuesta del servidor:", datos);
       console.log("📥 Status:", respuesta.status);

      if (!respuesta.ok) {
        if (datos.errores) {
          const erroresMap = {};
          datos.errores.forEach(err => {
            erroresMap[err.campo] = err.mensaje;
          });
          setError(erroresMap);
          return;
        }
        throw new Error(datos.mensaje || "Error al crear producto");
      }

      toast.success(" Producto agregado correctamente");
      navigate("/Productos");

    } catch (error) {
      console.error("Error:", error);
      toast.error(`❌ Error al crear el producto: ${error.message}`);
    }
  };

  // mostrar carga mientras se obtienen los datos
  if (cargando) {
    return (
      <div className="categoria">
        <h1>Cargando datos del formulario...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="categoria">
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="categoria">
      <h1>Nuevo Producto</h1>

      <form onSubmit={guardarProducto}>
        {/* PROVEEDOR - Select con datos de la BD */}
        <div>
          <label>Proveedor *</label>
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

        

        {/* CATEGORÍA - Select con datos de la BD */}
        <div>
          <label>Categoría *</label>
          <select
            name="id_categoria"  // ← Cambiado de "categoria" a "id_categoria"
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
            <option value="disponible">disponible</option>
            <option value="agotado">agotado</option>
          </select>
        </div>

        <button type="submit">Guardar producto</button>
      </form>
    </div>
  );
}

export default Agregarproducto;