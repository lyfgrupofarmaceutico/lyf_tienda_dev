import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Estado
      user: null,
      accessToken: null,
      refreshToken: null,
      _hasHydrated: false,

      // REFRESCAR TOKEN AUTOMÁTICAMENTE (usando axios plano SOLO para refresh)
      refreshAccessToken: async () => {
        const { refreshToken } = get();

        if (!refreshToken) {
          console.warn("❌ No refresh token available");
          get().logout();
          return null;
        }

        try {
          const response = await axios.post(`${API_URL}/auth/token-refresh/`, {
            refresh: refreshToken,
          });

          const newAccessToken = response.data.access;
          set({ accessToken: newAccessToken });

          return newAccessToken;
        } catch (error) {
          console.error(
            "❌ Error al refrescar token:",
            error.response?.data || error.message,
          );

          // Si el refresh token también expiró, cerrar sesión
          if (error.response?.status === 401) {
            get().logout();
          }

          return null;
        }
      },

      // Métodos de autenticación
      login: (userData, accessToken, refreshToken) => {
        set({
          user: userData,
          accessToken,
          refreshToken,
          _hasHydrated: true,
        });
      },

      // LOGOUT MEJORADO (con fallback si token expiró)
      logout: () => {
        const { refreshToken, accessToken } = get();

        // Intentar logout en backend SOLO si hay tokens
        if (refreshToken && accessToken) {
          axios
            .post(
              `${API_URL}/auth/logout/`,
              { refresh_token: refreshToken },
              {
                headers: { Authorization: `Bearer ${accessToken}` },
                timeout: 3000, // Timeout corto para no bloquear UI
              },
            )
            .catch((err) => {
              // Ignorar errores de logout (si token expiró, no importa)
              console.warn(
                "Logout fallido (token probablemente expirado):",
                err.message,
              );
            });
        }

        // Limpiar Zustand SIEMPRE
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          _hasHydrated: false,
        });
      },

      // Getters
      isAuthenticated: () => !!get().accessToken,
      isAdmin: () => get().user?.is_admin || false,
      getToken: () => get().accessToken,
      getUser: () => get().user,
      setHasHydrated: () => set({ _hasHydrated: true }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated();
      },
    },
  ),
);
