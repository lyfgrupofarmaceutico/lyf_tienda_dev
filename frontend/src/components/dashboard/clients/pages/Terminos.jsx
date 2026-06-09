import { useEffect } from "react";
import {
  MapPin,
  CreditCard,
  Truck,
  ShieldCheck,
} from "lucide-react";

const Terminos = () => {
  // SCROLL TO TOP
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="grow">
        {/* Hero Section  */}
        <section className="pt-5 pb-5">
          <div className="text-center mx-auto px-4">
            <h1 className="text-primario text-3xl md:text-4xl font-bold mb-4">
              Términos y Condiciones de Servicio
            </h1>
            <p className="text-lg">
              Conoce nuestras políticas para asegurar una gestión ágil y sin
              inconvenientes
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="pt-10 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <article className="max-w-none space-y-10">
              {/* Introducción */}
              <div className="bg-green-100 border-l-4 border-green-600 p-4 rounded-r-md">
                <p className="font-medium">
                  Al utilizar nuestros servicios y realizar compras en L&F Grupo
                  Farmacéutico, aceptas los siguientes términos y condiciones.
                  Te recomendamos leerlos detenidamente antes de proceder con
                  cualquier transacción.
                </p>
              </div>

              {/* Ubicación y cobertura */}
              <section aria-labelledby="ubicacion-heading">
                <div className="flex items-start gap-3 mb-4">
                  <MapPin
                    className="h-6 w-6 text-primario flex-shrink-0 mt-1"
                    aria-hidden="true"
                  />
                  <h2
                    id="ubicacion-heading"
                    className="text-2xl font-bold text-primario"
                  >
                    Ubicación y Cobertura
                  </h2>
                </div>
                <ul className="list-disc pl-6 space-y-3">
                  <li>
                    <span className="font-medium">Ciudad:</span> Estamos
                    ubicados en Popayán, Cauca, Colombia, Cra 6A # 5N - 17
                    Centro Comercial "La Casona" (Segundo piso LOCAL 128).
                  </li>
                  <li>
                    <span className="font-medium">Cobertura:</span> Realizamos
                    envíos a nivel nacional a través de la transportadora
                    seleccionada por el cliente.
                  </li>
                  <li>
                    <span className="font-medium">Seguridad:</span> Todos los
                    envíos se realizan asegurados y contraentrega por el valor
                    total de la factura.
                  </li>
                </ul>
              </section>

              {/* Proceso de cotización y pago */}
              <section aria-labelledby="proceso-heading">
                <div className="flex items-start gap-3 mb-4">
                  <CreditCard
                    className="h-6 w-6 text-primario flex-shrink-0 mt-1"
                    aria-hidden="true"
                  />
                  <h2
                    id="proceso-heading"
                    className="text-2xl font-bold text-primario"
                  >
                    Proceso de Cotización y Pago
                  </h2>
                </div>
                <ol className="list-decimal pl-6 space-y-3">
                  <li>
                    <span className="font-medium">Solicitud:</span> El cliente
                    comparte los productos y cantidades requeridas a través de
                    WhatsApp.
                  </li>
                  <li>
                    <span className="font-medium">Cotización:</span> Preparamos
                    y enviamos la cotización detallada para su revisión y
                    confirmación.
                  </li>
                  <li>
                    <span className="font-medium">Pago:</span> Una vez
                    confirmada la cotización, el cliente realiza el pago y envía
                    el comprobante para iniciar el proceso de despacho.
                  </li>
                </ol>
              </section>

              {/* Tiempos de despacho y entrega */}
              <section aria-labelledby="tiempos-heading">
                <div className="flex items-start gap-3 mb-4">
                  <Truck
                    className="h-6 w-6 text-primario flex-shrink-0 mt-1"
                    aria-hidden="true"
                  />
                  <h2
                    id="tiempos-heading"
                    className="text-2xl font-bold text-primario"
                  >
                    Tiempos de Despacho y Entrega
                  </h2>
                </div>
                <ul className="list-disc pl-6 space-y-3">
                  <li>
                    <span className="font-medium">Despacho:</span> Una vez
                    recibido y verificado el comprobante de pago, contamos con
                    un plazo de{" "}
                    <span className="font-bold">1 a 3 días hábiles</span> para
                    despachar el pedido.
                  </li>
                  <li>
                    <span className="font-medium">Entrega:</span> Las
                    transportadoras manejan tiempos de entrega de{" "}
                    <span className="font-bold">1 a 5 días hábiles</span> según
                    destino y empresa seleccionada.
                  </li>
                </ul>
                <div className="mt-4 bg-amber-100 border-l-4 border-amber-600 p-4 rounded-r-md">
                  <p>
                    <span className="font-medium">Nota importante:</span> Estos
                    plazos son estimados y pueden variar por factores externos
                    como condiciones climáticas, alta demanda en fechas
                    especiales o zonas de difícil acceso.
                  </p>
                </div>
              </section>

              {/* Recomendaciones */}
              <section aria-labelledby="recomendaciones-heading">
                <div className="flex items-start gap-3 mb-4">
                  <ShieldCheck
                    className="h-6 w-6 text-primario flex-shrink-0 mt-1"
                    aria-hidden="true"
                  />
                  <h2
                    id="recomendaciones-heading"
                    className="text-2xl font-bold text-primario"
                  >
                    Recomendaciones para una Mejor Experiencia
                  </h2>
                </div>
                <ul className="list-disc pl-6 space-y-3">
                  <li>
                    <span className="font-medium">Verifica la cotización:</span>{" "}
                    Revisa cuidadosamente productos, cantidades, precios y datos
                    de envío antes de realizar el pago.
                  </li>
                  <li>
                    <span className="font-medium">
                      Conserva el comprobante:
                    </span>{" "}
                    Envía el comprobante de pago y guárdalo hasta recibir y
                    verificar tu pedido.
                  </li>
                  <li>
                    <span className="font-medium">Seguimiento:</span> Te
                    compartiremos el número de guía para que puedas dar
                    seguimiento directo con la transportadora.
                  </li>
                  <li>
                    <span className="font-medium">Comunicación:</span> Mantén tu
                    WhatsApp activo para recibir actualizaciones sobre tu
                    pedido.
                  </li>
                </ul>
              </section>

              {/* Aceptación de términos */}
              <section aria-labelledby="aceptacion-heading">
                <div className="bg-red-100 border-l-4 border-red-600 p-4 rounded-r-md">
                  <p className="text-md font-semibold">
                    Al confirmar la cotización y realizar el pago, aceptas estos
                    términos y condiciones de envío y servicio. Para dudas o
                    actualizaciones, contáctanos a través de WhatsApp y con
                    gusto te apoyaremos.
                  </p>
                </div>
              </section>
            </article>

            {/* Call to action */}
            <div className="pt-10 text-center">
              <p className="text-base font-semibold">
                ¿Tienes preguntas? Contáctanos por WhatsApp y te bridaremos
                información.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Terminos;
