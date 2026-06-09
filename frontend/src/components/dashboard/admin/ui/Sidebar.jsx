import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LucideLayoutPanelLeft,
  UserCog,
  ShoppingCart,
  BriefcaseBusiness,
  GraduationCap,
  Tag,
  LogOut,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@src/store/authStore";
import authService from "@src/api/authService";
import toast from "react-hot-toast";
import logo from "@assets/logo-grupo.webp";

const menuItems = [
  {
    icon: <LucideLayoutPanelLeft className="h-5 w-5" aria-hidden="true" />,
    name: "Panel",
    link: "/admin",
    requiredRole: "admin",
  },
  {
    icon: <UserCog className="h-5 w-5" aria-hidden="true" />,
    name: "Usuarios",
    link: "/admin/usuarios",
    requiredRole: "admin",
  },
  {
    icon: <BriefcaseBusiness className="h-5 w-5" aria-hidden="true" />,
    name: "Portafolios",
    link: "/admin/portafolios",
    requiredRole: "admin",
  },
  {
    icon: <ShoppingCart className="h-5 w-5" aria-hidden="true" />,
    name: "Productos",
    link: "/admin/productos",
    requiredRole: "admin",
  },
  {
    icon: <GraduationCap className="h-5 w-5" aria-hidden="true" />,
    name: "Cursos",
    link: "/admin/cursos",
    requiredRole: "admin",
  },
  {
    icon: <Tag className="h-5 w-5" aria-hidden="true" />,
    name: "Promociones",
    link: "/admin/promociones",
    requiredRole: "admin",
  },
];

const Sidebar = ({ open, toggle, user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const isAdmin = useAuthStore((state) => state.isAdmin());

  // FILTRAR ITEMS SEGÚN ROL
  const visibleItems = menuItems.filter((item) =>
    item.requiredRole === "admin" ? isAdmin : true,
  );

  // MANEJAR LOGOUT CON LIMPIEZA DE SESIÓN
  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await authService.logout();

      toast.success("¡Hasta pronto!", {
        icon: "👋",
        duration: 3000,
      });

      // Redirigir a login
      navigate("/auth/login", { replace: true });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Error al cerrar sesión. Intenta nuevamente.", {
        icon: <AlertCircle className="text-red-500" size={20} />,
        duration: 4000,
      });
    } finally {
      setLoggingOut(false);
    }
  };

  // ACCESIBILIDAD
  const isActive = (path) => location.pathname === path;

  // TOOLTIP PARA ITEMS COLAPSADOS (solo desktop)
  const [tooltip, setTooltip] = useState({ show: false, text: "", x: 0, y: 0 });

  return (
    <>
      {/* OVERLAY PARA MOBILE (cierra sidebar al hacer click fuera) */}
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={toggle}
          aria-hidden="true"
        />
      )}

      <nav
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col bg-bgOscuro text-txtBlanco
          transition-all duration-300 ease-in-out rounded-r-md ${open ? "w-52" : "w-16"}
          ${open ? "shadow-lg" : "shadow-md"}
        `}
        aria-label="Menú de navegación principal"
      >
        {/* Logo e icono de toggle */}
        <div className="h-20 flex items-center justify-between px-3">
          {/* Logo con transición suave */}
          <div
            className={`
              overflow-hidden transition-all duration-300
              ${open ? "w-32 opacity-100" : "w-0 opacity-0"}
            `}
            aria-hidden={!open}
          >
            <img
              src={logo}
              alt="L&F Grupo Farmacéutico - Panel de Administración"
              className="h-14 object-contain transition-opacity duration-300"
            />
          </div>

          {/* Botón de toggle */}
          <button
            onClick={toggle}
            className={`
              p-2 rounded-lg hover:bg-gray-700/80 hover:text-secundario transition-colors
              ${open ? "ml-auto" : ""}
            `}
            aria-expanded={open}
            aria-controls="sidebar-content"
            aria-label={
              open
                ? "Contraer menú de navegación"
                : "Expandir menú de navegación"
            }
          >
            <ChevronRight
              className={`
                h-6 w-6 transition-transform duration-300
                ${open ? "rotate-180" : ""}
              `}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Contenido del menú */}
        <div
          id="sidebar-content"
          className="flex-1 overflow-y-auto py-4 space-y-1 px-2"
        >
          {visibleItems.map((item) => (
            <div
              key={item.name}
              className="relative"
              onMouseEnter={(e) => {
                if (!open && window.innerWidth >= 768) {
                  // Solo desktop
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({
                    show: true,
                    text: item.name,
                    x: rect.left + rect.width + 8,
                    y: rect.top + rect.height / 2,
                  });
                }
              }}
              onMouseLeave={() =>
                setTooltip((prev) =>
                  prev.show ? { ...prev, show: false } : prev,
                )
              }
            >
              <Link
                to={item.link}
                className={`
                  flex items-center gap-4 w-full p-3 rounded-lg transition-all duration-200
                  ${
                    isActive(item.link)
                      ? "bg-gray-700"
                      : "text-txtBlanco hover:bg-gray-700"
                  }
                `}
                aria-current={isActive(item.link) ? "page" : undefined}
                aria-label={open ? undefined : item.name}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span
                  className={`
                    overflow-hidden transition-all duration-300 whitespace-nowrap
                    ${open ? "w-auto opacity-100" : "w-0 opacity-0"}
                  `}
                >
                  {item.name}
                </span>
              </Link>
            </div>
          ))}

          {/* TOOLTIP PARA ITEMS COLAPSADOS */}
          {tooltip.show && (
            <div
              className="fixed z-50 bg-bgOscuro text-txtBlanco text-sm rounded py-1 px-2 whitespace-nowrap pointer-events-none shadow-lg"
              style={{
                left: `${tooltip.x + 4}px`,
                top: `${tooltip.y - 16}px`,
                transform: "translateY(-50%)",
              }}
              role="tooltip"
            >
              {tooltip.text}
            </div>
          )}
        </div>

        {/* Footer: Perfil + Logout */}
        <div className="p-3 space-y-3">
          {/* Perfil del usuario */}
          <div
            className={`
              flex items-center gap-3 p-2 rounded-md
              ${open ? "justify-start" : "justify-center"}
            `}
            aria-label={`Usuario actual: ${user?.first_name || "Administrador"}`}
          >
            <div className="w-8 h-8 rounded-md bg-primario flex items-center justify-center font-bold text-txtBlanco flex-shrink-0">
              {(user?.first_name || "A")[0].toUpperCase()}
            </div>
            {open && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-txtBlanco truncate">
                  {user?.first_name.toUpperCase() || "Administrador"}
                </p>
                <p className="text-xs text-green-400 truncate">
                  {user?.is_admin ? "Administrador" : "Staff"}
                </p>
              </div>
            )}
          </div>

          {/* Botón de logout */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className={`
              flex items-center gap-3 w-full p-3 border border-red-600 rounded-md transition-all duration-200
              ${
                loggingOut
                  ? "bg-gray-700 cursor-not-allowed"
                  : "text-txtBlanco hover:bg-destructivo"
              }
            `}
            aria-label={loggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <span
              className={`
                overflow-hidden transition-all duration-300 whitespace-nowrap
                ${open ? "w-auto opacity-100" : "w-0 opacity-0"}
              `}
            >
              {loggingOut ? "Cerrando..." : "Cerrar sesión"}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
