import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "@landing/components/ui/scroll-top";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardPage from "@src/components/dashboard/clients/DashboardPage";
import NotFound from "@landing/pages/NotFound";
import Home from "@landing/pages/Home";
import Nosotros from "@src/components/dashboard/clients/pages/Nosotros";
import Auth from "@auth/Auth";
import Login from "@components/auth/pages/Login";
import OTPForm from "@components/auth/pages/OTPForm";
import Register from "@auth/pages/Register";
import PasswordReset from "./components/auth/pages/PasswordReset";
import PasswordResetConfirm from "./components/auth/pages/PasswordResetConfirm";
import LandingPage from "@landing/LandingPage";
import Tienda from "@dashboard/clients/pages/Tienda";
import Portafolio from "@dashboard/clients/pages/Portafolio";
import PortafolioPage from "./components/dashboard/clients/ui/PortafolioPage";
import Cursos from "@dashboard/clients/pages/Cursos";
import Terminos from "@dashboard/clients/pages/Terminos";
import DashboardAdmin from "@dashboard/admin/DashboardAdmin";
import Panel from "./components/dashboard/admin/pages/Panel";
import Usuarios from "./components/dashboard/admin/pages/Usuarios";
import Productos from "./components/dashboard/admin/pages/Productos";
import Promociones from "./components/dashboard/admin/pages/Promociones";
import Portafolios from "./components/dashboard/admin/pages/Portafolios";
import Videos from "@dashboard/admin/pages/Cursos";

// IMPORTAR PROTECTED ROUTE Y STORE
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuthStore } from "./store/authStore";

const queryClient = new QueryClient();

// COMPONENTE PARA REDIRIGIR USUARIOS AUTENTICADOS FUERA DE /auth
const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />

        {/* Toaster */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#363636",
              color: "#fff",
              borderRadius: "8px",
              padding: "0.5rem 1.5rem",
            },
          }}
        />

        {/* Proteger ruta */}
        <Routes>
          {/* Rutas landing */}
          <Route path="/" element={<LandingPage />}>
            <Route index element={<Home />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Rutas autenticacion */}
          <Route
            path="/auth"
            element={
              <PublicRoute>
                {/* Proteger rutas de auth */}
                <Auth />
              </PublicRoute>
            }
          >
            <Route index element={<Login />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="otp" element={<OTPForm />} />
            <Route path="password-reset" element={<PasswordReset />} />
            <Route
              path="password-reset-confirm/:uidb64/:token/"
              element={<PasswordResetConfirm />}
            />
          </Route>

          {/* Rutas dashobard admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                {/* Protección con rol */}
                <DashboardAdmin />
              </ProtectedRoute>
            }
          >
            <Route index element={<Panel />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="productos" element={<Productos />} />
            <Route path="portafolios" element={<Portafolios />} />
            <Route path="cursos" element={<Videos />} />
            <Route path="promociones" element={<Promociones />} />
          </Route>

          {/* Rutas dashobard usuarios */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                {/* Protección básica */}
                <DashboardPage />
              </ProtectedRoute>
            }
          >
            <Route index element={<Tienda />} />
            <Route path="portafolio" element={<Portafolio />} />
            <Route path="portafolio/:ruta" element={<PortafolioPage />} />
            <Route path="cursos" element={<Cursos />} />
            <Route path="nosotros" element={<Nosotros />} />
            <Route path="terminos" element={<Terminos />} />
          </Route>

          {/* Ruta catch-all: redirigir según rol */}
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <Navigate
                  to={
                    useAuthStore.getState().isAdmin() ? "/admin" : "/dashboard"
                  }
                  replace
                />
              </ProtectedRoute>
            }
          />
        </Routes>
        {/* Proteger ruta */}
      </ErrorBoundary>
    </BrowserRouter>
  </QueryClientProvider>
);
export default App;
