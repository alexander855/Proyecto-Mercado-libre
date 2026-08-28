const express = require("express");
const cors = require("cors");

const productosRoutes = require("./routes/producto.routes");
const proveedorRoutes = require("./routes/proveedor.routes");
const categoriaRoutes = require("./routes/categoria.routes");

const app = express();

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.json({
    mensaje: "API Mercado Libre funcionando aqui"
  });
});

app.use("/api/productos", productosRoutes);
app.use("/api/proveedores", proveedorRoutes);
app.use("/api/categorias", categoriaRoutes);

app.listen(3000, "0.0.0.0", () => {
  console.log("Servidor funcionando en puerto 3000");
});