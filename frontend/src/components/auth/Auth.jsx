import { Outlet } from "react-router-dom";
import ScrollToTop from "@landing/components/ui/scroll-top";

// Imagenes del equipo
import team_login from "@assets/team/team2.webp";

const Auth = () => {
  return (
    <div
      className="min-h-screen p-4 lg:p-8 bg-cover bg-center flex items-center justify-center lg:justify-start "
      style={{ backgroundImage: `url(${team_login})` }}
    >
      <div className="min-h-screen absolute inset-0 bg-black/20"></div>
      <ScrollToTop />
      <Outlet />
    </div>
  );
};

export default Auth;
