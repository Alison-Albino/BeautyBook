import BookingForm from "@/components/booking-form";
import { Scissors } from "lucide-react";

const LogoSVG = ({ className }: { className?: string }) => (
  <div className={`flex items-center space-x-2 ${className}`}>
    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
      <Scissors className="w-4 h-4 text-white" />
    </div>
    <span className="font-bold text-xl text-white">Beatriz Sousa</span>
  </div>
);

export default function BookingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="py-16 text-[#ffffff] bg-gradient-to-br from-[#9F766E] to-[#000000]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <LogoSVG className="h-24" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Agende seu horário conosco</h2>
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
