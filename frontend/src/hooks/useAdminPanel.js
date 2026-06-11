import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@src/store/authStore";
import axiosInstance from "@src/lib/axiosInstance";

export const useAdminPanel = () => {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      // Obtener estadísticas consolidadas en UNA SOLA petición
      const [
        usuariosRes,
        productosRes,
        portafoliosRes,
        cursosRes,
        promocionesRes,
      ] = await Promise.all([
        axiosInstance.get(`/usuarios/`),
        axiosInstance.get(`/productos/`),
        axiosInstance.get(`/portafolios/`),
        axiosInstance.get(`/cursos/`),
        axiosInstance.get(`/promociones/`),
      ]);

      // Calcular estadísticas
      const usuarios = usuariosRes.data || [];
      const productos = productosRes.data || [];
      const portafolios = portafoliosRes.data || [];
      const cursos = cursosRes.data || [];
      const promociones = promocionesRes.data || [];

      const ultimos_usuarios = usuarios.map((user) => ({
        id: user.id,
        nombre: user.first_name || "",
        apellido: user.last_name || "",
        correo: user.email || "",
        rol: user.role || "general",
        is_admin: user.is_admin || false,
        is_verified: user.is_verified || false,
        is_active: user.is_active || false,
      }));

      return {
        ultimos_usuarios,
        total_usuarios: usuarios.length,
        total_productos: productos.length,
        total_portafolios: portafolios.length,
        total_cursos: cursos.length,
        total_promociones: promociones.length,
      };
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  });
};
