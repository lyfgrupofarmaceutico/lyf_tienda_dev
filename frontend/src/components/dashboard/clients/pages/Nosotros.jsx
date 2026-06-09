import { useEffect } from "react";
import { Users, Target, HeartHandshake, MapPin } from "lucide-react";

// Imágenes del equipo
import team1 from "@assets/team/team1.webp";
// Logo
import logo from "@assets/logo-grupo.webp";

const Nosotros = () => {
  // SCROLL TO TOP AL MONTAR
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="pt-5 pb-5">
        <div className="container mx-auto px-4 md:px-8">
          <div>
            <img
              src={logo}
              alt="L&F Grupo Farmacéutico - Logo"
              className="h-20 sm:h-24 md:h-28 object-contain mx-auto"
              aria-hidden="false"
            />
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-10">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-primario mb-4">
                  Nuestra Historia
                </h2>
                <p className="leading-relaxed">
                  Fundada en Popayán, Cauca, L&F Grupo Farmacéutico nació del
                  compromiso de dos profesionales de la salud por ofrecer
                  productos de alta calidad a sus colegas. Desde nuestros
                  inicios, hemos crecido para convertirnos en un referente en la
                  distribución de insumos médicos y cosmecéuticos en el
                  suroccidente colombiano.
                </p>
              </div>

              <div className="bg-blue-100 border-l-4 border-primario p-4 rounded-r-md">
                <p className="font-medium">
                  "Nuestra pasión es acompañar a los profesionales de la salud
                  en su misión de cuidar a sus pacientes, proporcionándoles los
                  mejores productos respaldados por ciencia y naturaleza."
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin
                    className="h-5 w-5 text-primario flex-shrink-0 mt-1"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-semibold">Ubicación</p>
                    <p>Popayán, Cauca, Colombia</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users
                    className="h-5 w-5 text-primario flex-shrink-0 mt-1"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-semibold">Fundación</p>
                    <p>2018</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src={team1}
                alt="Equipo de L&F Grupo Farmacéutico en oficinas"
                className="w-full rounded-md shadow-md border-4 border-white object-cover h-[400px] md:h-[450px]"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mision & Vision */}
      <section className="pb-10">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mision */}
            <div className="bg-bgPrimario rounded-md p-8 shadow-md border border-gray-300">
              <div className="flex items-start gap-4 mb-4">
                <h2 className="text-2xl font-bold text-primario">
                  Nuestra Misión
                </h2>
              </div>
              <p className="leading-relaxed mb-4">
                Ofrecer con calidad y eficiencia productos a todos nuestros
                profesionales de la salud una experiencia única de
                acompañamiento, capacitación y crecimiento profesional.
              </p>
              <p className="leading-relaxed">
                A través de equipos calificados y cursos especializados,
                distribuimos productos y servicios de alta calidad con el
                respaldo de las mejores compañías que tienen como principio la
                ciencia y la naturaleza.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-bgPrimario rounded-md p-8 shadow-md border border-gray-300">
              <div className="flex items-start gap-4 mb-4">
                <h2 className="text-2xl font-bold text-primario">
                  Nuestra Visión
                </h2>
              </div>
              <p className="leading-relaxed mb-4">
                Lograr que todos los profesionales de la salud de cada uno de
                los rincones del país tengan acceso a nuestros productos de las
                mejores marcas y portafolios de alta calidad a un precio
                accesible.
              </p>
              <p className="leading-relaxed font-semibold">
                Para el año 2027, convertirnos en la principal grupo
                farmacéutico a nivel nacional, contando con innovadoras
                soluciones para profesionales y sus pacientes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primario mb-4">
              Nuestros Valores
            </h2>
            <p className="max-w-2xl mx-auto">
              Principios que guían cada decisión y acción en L&F Grupo
              Farmacéutico
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-bgPrimario rounded-md p-6 text-center shadow-md border border-gray-300">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeartHandshake
                  className="h-8 w-8 text-primario"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-xl font-bold text-primario mb-2">
                Compromiso
              </h3>
              <p>
                Acompañamos a nuestros clientes en cada etapa, garantizando
                soluciones personalizadas y atención especializada.
              </p>
            </div>

            <div className="bg-bgPrimario rounded-md p-6 text-center shadow-md border border-gray-300">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-primario" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-primario mb-2">
                Excelencia
              </h3>
              <p>
                Seleccionamos cuidadosamente productos de marcas líderes con
                respaldo científico y certificaciones internacionales.
              </p>
            </div>

            <div className="bg-bgPrimario rounded-md p-6 text-center shadow-md border border-gray-300">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primario" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-primario mb-2">
                Integridad
              </h3>
              <p>
                Actuamos con transparencia y honestidad en todas nuestras
                relaciones comerciales y profesionales.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Nosotros;
