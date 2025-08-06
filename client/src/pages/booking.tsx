import BookingForm from "@/components/booking-form";
import logoPath from "@assets/logo bs_1754516178309.png";

export default function BookingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <img src={logoPath} alt="Beatriz Sousa" className="h-24 w-auto filter brightness-0 invert" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Agende o Seu Tratamento</h2>
          <p className="text-xl opacity-90">Transforme o seu olhar com os nossos serviços especializados em pestanas e sobrancelhas</p>
        </div>
      </div>

      {/* Booking Form Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <BookingForm />
      </div>
    </div>
  );
}
