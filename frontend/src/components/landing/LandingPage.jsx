import { Outlet } from "react-router-dom";
import Header from "@landing/pages/Header";
import Footer from "@landing/pages/Footer";
import WhatsAppButton from "@landing/components/WhatsAppButton";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <WhatsAppButton />

      <main className="grow">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
