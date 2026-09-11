require('dotenv').config();

console.log("🔑 JWT_SECRET:", process.env.JWT_SECRET ? "✅ Cargado" : "❌ NO cargado");
console.log("🔌 PORT:", process.env.PORT || "3000 (por defecto)");
const express = require("express");
const cors = require("cors");

const authRoutes = require('./routes/auth.routes');
const usuarioRoutes = require('./routes/usuario.routes');
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

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/proveedores", proveedorRoutes);
app.use("/api/categorias", categoriaRoutes);

app.listen(3000, "0.0.0.0", () => {
  console.log("Servidor funcionando en puerto 3000");
});