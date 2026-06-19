import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaPhoneAlt,
  FaYoutube,
} from "react-icons/fa";
import logo from "@assets/logo-grupo.webp";
import co from "@assets/co.svg";

const Footer = () => {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || 3182825718;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-primario rounded-t-2xl">
      {/* Wave decoration */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
        <svg
          className="relative block w-full h-12 fill-bgSecundario"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
        </svg>
      </div>

      <div className="text-txtBlanco pt-16 pb-8">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-4">
            {/* Column 1 */}
            <div>
              <p className="text-sm leading-relaxed">
                Distribuimos en todo Colombia las mejores marcas de productos
                especializados en medicina estética, medicina biológica y
                medicina ortomolecular.
              </p>
            </div>

            {/* Column 2 */}
            <div className="text-center">
              <h3 className="font-semibold mb-2">Contáctenos</h3>
              <a
                href={`tel:${whatsappNumber} `}
                className="flex items-center justify-center text-xl font-bold hover:text-enfasis transition-colors"
              >
                <FaPhoneAlt className="size-5 mr-2" />
                {whatsappNumber
                  ? `(+57) ${whatsappNumber.slice?.(2) || ""}`
                  : "(+57) --- --- ----"}
              </a>
            </div>

            {/* Column 3 */}
            <div className="flex justify-center md:justify-end items-center space-x-4">
              <h3 className="font-semibold">Síguenos:</h3>
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
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-enfatext-enfasis pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              {/* Logo - Grupo Farmacéutico */}
              <Link onClick={scrollToTop}>
                <div className="flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-sm mb-6 md:mb-0">
                  <img
                    src={logo}
                    alt="logo"
                    className="h-16 w-32 object-contain"
                  />
                </div>
              </Link>
            </div>

            {/* Desarrollado por */}
            <div className="flex items-center justify-start md:justify-center mt-4 text-sm text-blue-light">
              <p>Copyright © 2026 | Desarrollado por </p>
              <a
                href="https://takeshi-dev.site/"
                target="__blanck"
                className="mx-1 text-[#0ef]"
              >
                takeshi-dev
              </a>
              {/* <div>
                <img src={co} alt="logo" className="size-4" />
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
