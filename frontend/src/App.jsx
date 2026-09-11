
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";


import PanelLayout from "./layouts/PanelLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import { Toaster } from "react-hot-toast";


import Inicio from "./pages/Inicio";
import Usuarios from "./pages/Usuarios";
import Proveedores from "./pages/Proveedores";
import Categorias from "./pages/Categorias";
import Productos from "./pages/Productos";
import Direcciones from "./pages/Direcciones";
import Carritos from "./pages/Carritos";
import CarritoDetalle from "./pages/CarritoDetalle";
import Pedidos from "./pages/Pedidos";
import PedidoProveedor from "./pages/PedidoProveedor";
import PedidoDetalle from "./pages/PedidoDetalle";
import Pagos from "./pages/Pagos";

import Agregarcategoria from "../tablas/Agregarcategoria";
import Editarcategoria from "../tablas/Editarcategoria";
import Eliminarcategoria from "../tablas/Eliminarcategoria";
import Agregarproveedor from "../tablas/Agregarproveedor";
import Editarproveedor from "../tablas/Editarproveedor";
import Eliminarproveedor from "../tablas/Eliminarproveedor";
import Agregarproducto from "../tablas/Agregarproducto";
import Editarproducto from "../tablas/Editarproducto";
import Eliminarproducto from "../tablas/Eliminarproducto";

function App() {
  return (
    <BrowserRouter>
    <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
            fontSize: "14px",
            borderRadius: "8px",
            padding: "12px 16px",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#4caf50",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#f44336",
              secondary: "#fff",
            },
          },
        }}
      />

      <Routes>

        
        <Route
          path="/login"
          element={
            localStorage.getItem("token")
              ? <Navigate to="/" replace />
              : <Login />
          }
        />

        
        <Route
          element={
            <ProtectedRoute>
              <PanelLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route path="/" element={<Inicio />} />

          {/* Usuarios - solo admin */}
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute rolesPermitidos={["admin"]}>
                <Usuarios />
              </ProtectedRoute>
            }
          />

          {/* Proveedores */}
          <Route path="/proveedores" element={<Proveedores />} />
          <Route path="/tablas/agregarproveedor" element={<Agregarproveedor />} />
          <Route path="/tablas/editarproveedor/:id" element={<Editarproveedor />} />
          <Route path="/tablas/eliminarproveedor/:id" element={<Eliminarproveedor />} />

          {/* Categorías */}
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/tablas/agregarcategoria" element={<Agregarcategoria />} />
          <Route path="/tablas/editarcategoria/:id" element={<Editarcategoria />} />
          <Route path="/tablas/eliminarcategoria/:id" element={<Eliminarcategoria />} />

          {/* Productos */}
          <Route path="/productos" element={<Productos />} />
          <Route path="/tablas/agregarproducto" element={<Agregarproducto />} />
          <Route path="/tablas/editarproducto/:id" element={<Editarproducto />} />
          <Route path="/tablas/eliminarproducto/:id" element={<Eliminarproducto />} />

          {/* Direcciones */}
          <Route path="/direcciones" element={<Direcciones />} />

          {/* Carritos */}
          <Route path="/carritos" element={<Carritos />} />
          <Route path="/carritos/:id/detalle" element={<CarritoDetalle />} />

          {/* Pedidos */}
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/pedidos/:id/proveedores" element={<PedidoProveedor />} />
          <Route path="/pedidos-proveedor/:id/detalle" element={<PedidoDetalle />} />

          {/* Pagos */}
          <Route path="/pagos" element={<Pagos />} />
        </Route>

        
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;