import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCartStore } from "@src/store/useCartStore";
import authService from "@src/api/authService";
import { useAuthStore } from "@src/store/authStore";
import { ChevronDown, Menu, ShoppingCart, User, X } from "lucide-react";
import { toast } from "react-hot-toast";

import logo from "@assets/logo-grupo.webp";

// Subcomponente: Enlace de navegación accesible
const NavItem = ({ to, label, isActive, onClick, isMobile = false }) => {
  const baseClasses =
    "pb-1 text-base transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-secundario focus-visible:ring-offset-2 focus-visible:ring-offset-bgPrimario";
  const activeClasses = "text-secundario border-b-2 border-secundario";
  const inactiveClasses = "hover:text-secundario border-b-2 border-transparent";

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${isMobile ? "block py-2" : ""}`}
      aria-current={isActive ? "page" : undefined}
    >
      {label}
    </Link>
  );
};

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const dropdownButtonRef = useRef(null);

  const userEmail = useAuthStore((state) => state.user?.email || "Usuario");
  const { toogleClose, cart } = useCartStore();
  const cartCount = cart?.length || 0;

  // Memoizar para evitar re-renders innecesarios
  const isActive = useCallback(
    (path) => {
      if (path === "/dashboard") {
        return (
          location.pathname === "/dashboard" ||
          location.pathname === "/dashboard/"
        );
      }
      return location.pathname.startsWith(path);
    },
    [location.pathname],
  );

  // Cerrar menús al hacer clic fuera + Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setMobileMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
        // Restaurar foco al botón que abrió el menú
        if (dropdownOpen) dropdownButtonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [dropdownOpen]);

  // Focus management: mover foco al abrir menú móvil
  useEffect(() => {
    if (mobileMenuOpen) {
      const firstLink = mobileMenuRef.current?.querySelector("a");
      firstLink?.focus();
      // Prevenir scroll del body cuando el menú móvil está abierto
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Focus trapping para dropdown de usuario
  useEffect(() => {
    if (dropdownOpen) {
      const focusableElements = dropdownRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements?.[0];
      const lastElement = focusableElements?.[focusableElements.length - 1];

      const handleTab = (e) => {
        if (e.key === "Tab") {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              dropdownButtonRef.current?.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              dropdownButtonRef.current?.focus();
            }
          }
        }
      };

      dropdownRef.current?.addEventListener("keydown", handleTab);
      return () =>
        dropdownRef.current?.removeEventListener("keydown", handleTab);
    }
  }, [dropdownOpen]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authService.logout();
      toast.success("¡Hasta pronto!", {
        icon: "👋",
        duration: 3000,
      });
      navigate("/auth/login", { replace: true });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("No se pudo cerrar la sesión. Intente nuevamente.");
      navigate("/auth/login", { replace: true });
    } finally {
      setLoggingOut(false);
      setDropdownOpen(false);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="bg-bgPrimario shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              onClick={scrollToTop}
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-secundario focus-visible:ring-offset-2 focus-visible:ring-offset-bgPrimario rounded"
              aria-label="Ir al inicio"
            >
              <img
                src={logo}
                alt="Comercializadora Grupo - Inicio"
                className="h-16 object-contain select-none"
                loading="eager"
              />
            </Link>
          </div>

          {/* Navegación Desktop */}
          <nav
            className="hidden lg:flex items-center gap-6 font-semibold"
            aria-label="Menú principal"
          >
            <NavItem
              to="/dashboard"
              label="Tienda"
              isActive={isActive("/dashboard")}
            />
            <NavItem
              to="/dashboard/portafolio"
              label="Portafolio"
              isActive={isActive("/dashboard/portafolio")}
            />
            <NavItem
              to="/dashboard/cursos"
              label="Cursos"
              isActive={isActive("/dashboard/cursos")}
            />
            <NavItem
              to="/dashboard/nosotros"
              label="Nosotros"
              isActive={isActive("/dashboard/nosotros")}
            />
            <NavItem
              to="/dashboard/terminos"
              label="Términos"
              isActive={isActive("/dashboard/terminos")}
            />

            {/* Carrito */}
            <button
              onClick={toogleClose}
              className="relative text-base hover:text-secundario transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-secundario focus-visible:ring-offset-2 focus-visible:ring-offset-bgPrimario rounded-full p-1"
              aria-label={`Carrito de compras, ${cartCount} ${cartCount === 1 ? "producto" : "productos"}`}
            >
              <ShoppingCart className="size-5" aria-hidden="true" />
              {cartCount > 0 && (
                <span
                  className={`absolute -top-2 -right-3 min-w-[1.25rem] h-5 flex items-center justify-center 
                    ${cartCount === 0 ? "bg-bgOscuro" : "bg-destructivo"} 
                    text-txtBlanco text-xs font-bold rounded-full px-1`}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
          </nav>

          {/* Dropdown Usuario - Desktop */}
          <div
            className="relative hidden lg:flex items-center"
            ref={dropdownRef}
          >
            <button
              ref={dropdownButtonRef}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-secundario focus-visible:ring-offset-2 focus-visible:ring-offset-bgPrimario rounded-md"
              aria-haspopup="menu"
              aria-expanded={dropdownOpen}
              aria-controls="user-dropdown-menu"
              aria-label={`Menú de usuario, ${userEmail}`}
              id="user-dropdown-trigger"
            >
              <span
                className="rounded-full p-2 bg-bgSecundario border border-gray-300"
                aria-hidden="true"
              >
                <User className="w-5 h-5" />
              </span>
              <ChevronDown
                className={`w-4 h-4 hover:text-secundario transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>

            {dropdownOpen && (
              <div
                id="user-dropdown-menu"
                className="absolute top-full right-0 mt-2 p-2 border bg-bgPrimario rounded-md shadow-lg z-50 min-w-[200px] animate-in fade-in slide-in-from-top-1"
                role="menu"
                aria-labelledby="user-dropdown-trigger"
              >
                <p
                  className="w-full py-2 px-4 text-sm text-center text-muted-foreground border-b"
                  role="none"
                >
                  {userEmail}
                </p>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className={`w-full py-2 px-4 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-secundario ${
                    loggingOut
                      ? "bg-gray-400 cursor-not-allowed opacity-70"
                      : "bg-bgOscuro hover:bg-secundario text-txtBlanco"
                  }`}
                  role="menuitem"
                >
                  {loggingOut ? (
                    <span className="flex items-center justify-center gap-2">
                      <span
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                    </span>
                  ) : (
                    "Cerrar sesión"
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Botón Menú Móvil */}
          <button
            className="lg:hidden p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-secundario focus-visible:ring-offset-2 focus-visible:ring-offset-bgPrimario rounded"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={
              mobileMenuOpen
                ? "Cerrar menú de navegación"
                : "Abrir menú de navegación"
            }
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Menú Móvil - Role dialog para accesibilidad */}
        {mobileMenuOpen && (
          <div
            id="mobile-navigation-menu"
            className="lg:hidden py-4 border-t animate-in slide-in-from-top-2"
            ref={mobileMenuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación móvil"
          >
            <nav className="flex flex-col space-y-1" aria-label="Menú móvil">
              <NavItem
                to="/dashboard"
                label="Tienda"
                isActive={isActive("/dashboard")}
                onClick={() => setMobileMenuOpen(false)}
                isMobile
              />
              <NavItem
                to="/dashboard/portafolio"
                label="Portafolio"
                isActive={isActive("/dashboard/portafolio")}
                onClick={() => setMobileMenuOpen(false)}
                isMobile
              />
              <NavItem
                to="/dashboard/cursos"
                label="Cursos"
                isActive={isActive("/dashboard/cursos")}
                onClick={() => setMobileMenuOpen(false)}
                isMobile
              />
              <NavItem
                to="/dashboard/nosotros"
                label="Nosotros"
                isActive={isActive("/dashboard/nosotros")}
                onClick={() => setMobileMenuOpen(false)}
                isMobile
              />
              <NavItem
                to="/dashboard/terminos"
                label="Términos"
                isActive={isActive("/dashboard/terminos")}
                onClick={() => setMobileMenuOpen(false)}
                isMobile
              />

              {/* Carrito Móvil */}
              <div className="py-3 mt-2">
                <button
                  onClick={() => {
                    toogleClose();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full py-2 px-1 text-base hover:text-secundario transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-secundario rounded"
                  aria-label={`Carrito de compras, ${cartCount} ${cartCount === 1 ? "producto" : "productos"}`}
                >
                  <ShoppingCart className="size-5" aria-hidden="true" />
                  {cartCount > 0 && (
                    <span className="bg-destructivo text-txtBlanco text-xs font-bold rounded-full px-2 py-0.5">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </button>
              </div>
            </nav>

            {/* Usuario Móvil */}
            <div className="flex flex-col pt-4 mt-2">
              <div className="flex items-center justify-center gap-2 py-2 text-muted-foreground">
                <span
                  className="rounded-full p-2 bg-bgSecundario border border-gray-300"
                  aria-hidden="true"
                >
                  <User className="w-5 h-5" />
                </span>
                <span className="text-sm truncate max-w-[200px]">
                  {userEmail}
                </span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                disabled={loggingOut}
                className={`w-full py-2.5 px-4 rounded-md transition-colors font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-secundario ${
                  loggingOut
                    ? "bg-gray-400 cursor-not-allowed opacity-70"
                    : "bg-bgOscuro hover:bg-secundario text-txtBlanco"
                }`}
              >
                {loggingOut ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin" aria-hidden="true" />
                  </span>
                ) : (
                  "Cerrar sesión"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
