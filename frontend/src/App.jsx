
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";


import PanelLayout from "./layouts/PanelLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
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
import Agregarusuario from "../tablas/Agregarusuario";
import Editarusuario from "../tablas/Editarusuario";

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
          path="/register"
          element={
            localStorage.getItem("token")
              ? <Navigate to="/" replace />
              : <Register />
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
          <Route
            path="/tablas/agregarusuario"
            element={
              <ProtectedRoute rolesPermitidos={["admin"]}>
                <Agregarusuario />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tablas/editarusuario/:id"
            element={
              <ProtectedRoute rolesPermitidos={["admin"]}>
                <Editarusuario />
              </ProtectedRoute>
            }
          />

          {/* Proveedores */}
          <Route path="/proveedores" element={<Proveedores />} />
          <Route
            path="/tablas/agregarproveedor"
            element={
              <ProtectedRoute rolesPermitidos={["admin", "vendedor"]}>
                <Agregarproveedor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tablas/editarproveedor/:id"
            element={
              <ProtectedRoute rolesPermitidos={["admin", "vendedor"]}>
                <Editarproveedor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tablas/eliminarproveedor/:id"
            element={
              <ProtectedRoute rolesPermitidos={["admin"]}>
                <Eliminarproveedor />
              </ProtectedRoute>
            }
          />

          {/* Categorías */}
          <Route path="/categorias" element={<Categorias />} />
          <Route
            path="/tablas/agregarcategoria"
            element={
              <ProtectedRoute rolesPermitidos={["admin", "vendedor"]}>
                <Agregarcategoria />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tablas/editarcategoria/:id"
            element={
              <ProtectedRoute rolesPermitidos={["admin", "vendedor"]}>
                <Editarcategoria />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tablas/eliminarcategoria/:id"
            element={
              <ProtectedRoute rolesPermitidos={["admin"]}>
                <Eliminarcategoria />
              </ProtectedRoute>
            }
          />

          {/* Productos */}
          <Route path="/productos" element={<Productos />} />
          <Route
            path="/tablas/agregarproducto"
            element={
              <ProtectedRoute rolesPermitidos={["admin", "vendedor"]}>
                <Agregarproducto />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tablas/editarproducto/:id"
            element={
              <ProtectedRoute rolesPermitidos={["admin", "vendedor"]}>
                <Editarproducto />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tablas/eliminarproducto/:id"
            element={
              <ProtectedRoute rolesPermitidos={["admin"]}>
                <Eliminarproducto />
              </ProtectedRoute>
            }
          />

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