import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import { FiLogIn } from "react-icons/fi";

import logo from "@assets/logo-grupo.webp";

const Header = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="bg-bgPrimario shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="h-20 grid grid-cols-2">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              onClick={scrollToTop}
              className="flex items-center justify-start"
            >
              <img
                src={logo}
                alt="Company logo"
                className="h-16 object-contain"
              />
            </Link>
          </div>

          {/* Redes sociales y login */}
          <div className="flex items-center justify-end space-x-4 sm:space-x-8 text-textBlack">
            <a
              href="https://www.instagram.com/lyfgrupofarmaceutico/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-enfasis transition-colors"
            >
              <FaInstagram className="size-6" />
            </a>
            <a
              href="https://www.facebook.com/lyfgrupofarmaceutico"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-enfasis transition-colors"
            >
              <FaFacebookF className="size-5" />
            </a>
            <a
              href="https://www.tiktok.com/@lyfgrupofarmaceutico"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-enfasis transition-colors"
            >
              <FaTiktok className="size-5" />
            </a>
            <a
              href="https://www.youtube.com/@lyfgrupofarmaceutico"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-enfasis transition-colors"
            >
              <FaYoutube className="size-5" />
            </a>

            <Link
              to="/auth"
              className="flex items-center justify-center ml-4 gap-2 bg-primario text-txtBlanco rounded-md p-2 hover:bg-enfasis"
            >
              <FiLogIn className="size-5" />
              <span className="hidden sm:inline">Ingresar</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
