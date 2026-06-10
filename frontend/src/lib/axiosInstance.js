import axios from "axios";
import { useAuthStore } from "@src/store/authStore";

const API_URL = import.meta.env.VITE_API_URL;

// CREAR INSTANCIA DE AXIOS CON INTERCEPTORES
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 segundos de timeout
});

// QUEUE DE PETICIONES PENDIENTES (para reintentar tras refresh)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// INTERCEPTOR DE REQUEST: agregar token a todas las peticiones AUTENTICADAS
axiosInstance.interceptors.request.use(
  (config) => {
    // NO agregar token a endpoints públicos de auth
    const publicAuthEndpoints = [
      "/auth/login/",
      "/auth/register/",
      "/auth/verify-email/",
      "/auth/resend-otp/",
      "/auth/password-reset/",
      "/auth/set-new-password/",
      "/auth/token-refresh",
    ];

    if (
      !publicAuthEndpoints.some((endpoint) => config.url.includes(endpoint))
    ) {
      const token = useAuthStore.getState().accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Agregar timestamp para evitar cache en desarrollo
    if (import.meta.env.DEV && !config.url.includes("/token-refresh")) {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// INTERCEPTOR DE RESPONSE: manejar 401 y refrescar token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si es error 401 y NO es una petición de refresh ni logout
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/token-refresh") &&
      !originalRequest.url.includes("/logout/")
    ) {
      originalRequest._retry = true;

      // Si ya hay un refresh en progreso, encolar la petición
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Iniciar proceso de refresh
      isRefreshing = true;

      try {
        const newToken = await useAuthStore.getState().refreshAccessToken();

        if (newToken) {
          // Reintentar todas las peticiones encoladas
          processQueue(null, newToken);

          // Reintentar la petición original
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axios(originalRequest);
        }

        // Si el refresh falla, rechazar todas las peticiones
        processQueue(error, null);
        return Promise.reject(error);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Redirigir a login si refresh token también expiró
        if (refreshError.response?.status === 401) {
          useAuthStore.getState().logout();
          window.location.href = "/auth/login?session_expired=true";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
