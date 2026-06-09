import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const isAdmin = useAuthStore((state) => state.isAdmin()); 
  
  if (isAuthenticated) {
    // Redirigir según rol
    return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;
  }
  
  return children;
};

export default PublicRoute;
