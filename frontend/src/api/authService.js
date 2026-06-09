import axios from "axios";
import axiosInstance from "@src/lib/axiosInstance";
import { useAuthStore } from "../store/authStore";

const API_URL = import.meta.env.VITE_API_URL;

export const authService = {
  // Registro de usuarios (endpoint público - usar axios plano)
  async register(email, first_name, last_name, password, password2) {
    try {
      const response = await axios.post(`${API_URL}/auth/register/`, {
        email,
        first_name,
        last_name,
        password,
        password2,
      });
      return response.data;
    } catch (error) {
      console.error("Error en registro:", error);
      throw error;
    }
  },

  // Verificar OTP (endpoint público)
  async verifyOTP(otp) {
    try {
      const response = await axios.post(`${API_URL}/auth/verify-email/`, {
        otp: otp,
      });
      return response.data;
    } catch (error) {
      console.error("Error al verificar OTP:", error);
      throw error;
    }
  },

  // Reenviar OTP (endpoint público)
  async resendOTP(email) {
    try {
      const response = await axios.post(`${API_URL}/auth/resend-otp/`, {
        email: email,
      });
      return response.data;
    } catch (error) {
      console.error("Error al reenviar OTP:", error);
      throw error;
    }
  },

  // Solicitar recuperación de contraseña (endpoint público)
  async passwordReset(email) {
    try {
      const response = await axios.post(`${API_URL}/auth/password-reset/`, {
        email: email,
      });
      return response.data;
    } catch (error) {
      console.error("Error al solicitar recuperación:", error);
      throw error;
    }
  },

  // Confirmar recuperación de contraseña (endpoint público)
  async setNewPassword(uidb64, token, newPassword, confirmPassword) {
    try {
      const response = await axios.patch(`${API_URL}/auth/set-new-password/`, {
        uidb64: uidb64,
        token: token,
        password: newPassword,
        confirm_password: confirmPassword,
      });
      return response.data;
    } catch (error) {
      console.error("Error al confirmar recuperación:", error);
      throw error;
    }
  },

  // Login de usuarios (endpoint público)
  async login(email, password) {
    try {
      const response = await axios.post(`${API_URL}/auth/login/`, {
        email,
        password,
      });

      // EXTRAER DATOS CORRECTAMENTE DE LA RESPUESTA
      const userData = {
        id: response.data.id,
        email: response.data.email,
        first_name: response.data.full_name?.split(" ")[0] || "",
        last_name: response.data.full_name?.split(" ")[1] || "",
        role: response.data.role,
        is_admin: response.data.is_admin,
        is_verified: response.data.is_verified,
      };

      // GUARDAR EN ZUSTAND CON NOMBRES DE CAMPO CORRECTOS
      useAuthStore
        .getState()
        .login(
          userData,
          response.data.access_token,
          response.data.refresh_token,
        );

      return response.data;
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  },

  // LOGOUT
  async logout() {
    try {
      // axiosInstance maneja automáticamente el 401 si el token expiró
      await axiosInstance.post("/auth/logout/", {
        refresh_token: useAuthStore.getState().refreshToken,
      });
    } catch (error) {
      // Ignorar errores de logout (si token expiró, el interceptor ya manejó el refresh)
      console.warn(
        "Logout con advertencia (posible token expirado):",
        error.message,
      );
    } finally {
      // SIEMPRE limpiar Zustand
      useAuthStore.getState().logout();
    }
  },

  // Obtener token actual
  getToken() {
    return useAuthStore.getState().accessToken;
  },

  // Verificar si está autenticado
  isAuthenticated() {
    return useAuthStore.getState().isAuthenticated();
  },

  // Obtener usuario actual del store
  getUser() {
    return useAuthStore.getState().user;
  },

  // Verificar si es admin
  isAdmin() {
    return useAuthStore.getState().isAdmin();
  },
};

export default authService;
