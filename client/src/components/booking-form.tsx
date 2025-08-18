import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { pt } from "date-fns/locale";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { clientValidationSchema, formatPhone, formatPrice, formatDate, getDateString, generateWhatsAppMessage } from "@/lib/validation";
import { type Service, type Client } from "@shared/schema";
import { ArrowRight, ArrowLeft, Check, Clock, Eye, Palette, Leaf, Gem, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { Scissors } from "lucide-react";

const LogoSVG = () => (
  <div className="flex items-center space-x-2">
    <div className="w-8 h-8 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full flex items-center justify-center">
      <Scissors className="w-4 h-4 text-white" />
    </div>
    <span className="font-bold text-xl text-amber-700">Beatriz Sousa</span>
  </div>
);

type BookingStep = 1 | 2 | 3;

interface BookingData {
  client: z.infer<typeof clientValidationSchema>;
  serviceId: string;
  date: string;
  time: string;
}

const appointmentSchema = z.object({
  clientId: z.string(),
  serviceId: z.string(),
  date: z.string(),
  time: z.string(),
  status: z.string().default("agendado"),
});

// Country codes with flags
const COUNTRIES = [
  { code: "+351", name: "Portugal", flag: "🇵🇹", format: "9XX XXX XXX", regex: /^\+351\s9\d{2}\s\d{3}\s\d{3}$/ },
  { code: "+55", name: "Brasil", flag: "🇧🇷", format: "(XX) XXXXX-XXXX", regex: /^\+55\s\(\d{2}\)\s\d{4,5}-\d{4}$/ },
  { code: "+1", name: "EUA", flag: "🇺🇸", format: "(XXX) XXX-XXXX", regex: /^\+1\s\(\d{3}\)\s\d{3}-\d{4}$/ },
  { code: "+44", name: "Reino Unido", flag: "🇬🇧", format: "XXXX XXX XXX", regex: /^\+44\s\d{4}\s\d{3}\s\d{3}$/ },
  { code: "+33", name: "França", flag: "🇫🇷", format: "X XX XX XX XX", regex: /^\+33\s\d\s\d{2}\s\d{2}\s\d{2}\s\d{2}$/ },
  { code: "+49", name: "Alemanha", flag: "🇩🇪", format: "XXX XXXXXXX", regex: /^\+49\s\d{3}\s\d{7}$/ },
  { code: "+34", name: "Espanha", flag: "🇪🇸", format: "XXX XXX XXX", regex: /^\+34\s\d{3}\s\d{3}\s\d{3}$/ },
];

export default function BookingForm() {
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [clientData, setClientData] = useState<z.infer<typeof clientValidationSchema> | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // Portugal por padrão
  const { toast } = useToast();

  const form = useForm<z.infer<typeof clientValidationSchema>>({
    resolver: zodResolver(clientValidationSchema),
    defaultValues: {
      fullName: "",
      phone: "",
    },
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const { data: availableTimes = [], isLoading: timesLoading } = useQuery<string[]>({
    queryKey: ["/api/appointments/available-times", getDateString(selectedDate || new Date()), selectedService?.id],
    enabled: !!selectedDate && !!selectedService,
  });

  const createClientMutation = useMutation({
    mutationFn: async (clientData: z.infer<typeof clientValidationSchema>) => {
      return await apiRequest("/api/clients", {
        method: "POST",
        body: clientData,
      });
    },
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: z.infer<typeof appointmentSchema>) => {
      return await apiRequest("/api/appointments", {
        method: "POST", 
        body: appointmentData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      
      // Redirect to WhatsApp with message
      if (clientData && selectedService && selectedDate && selectedTime) {
        const message = generateWhatsAppMessage(
          clientData.fullName,
          selectedService.name,
          selectedService.price,
          getDateString(selectedDate),
          selectedTime
        );
        
        const whatsappUrl = `https://wa.me/351935397642?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      }
      
      setShowSuccessModal(true);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o agendamento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    if (name.includes("design")) return <Eye className="text-primary text-2xl" />;
    if (name.includes("micropigmentação")) return <Palette className="text-primary text-2xl" />;
    if (name.includes("henna") && !name.includes("design")) return <Leaf className="text-primary text-2xl" />;
    if (name.includes("combo") || name.includes("+")) return <Gem className="text-beauty-gold text-2xl" />;
    return <Eye className="text-primary text-2xl" />;
  };

  const handleStep1Submit = async (data: z.infer<typeof clientValidationSchema>) => {
    setClientData(data);
    setCurrentStep(2);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setCurrentStep(3);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleConfirmBooking = async () => {
    if (!clientData || !selectedService || !selectedDate || !selectedTime) {
      toast({
        title: "Erro",
        description: "Dados incompletos. Verifique todas as informações.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create or get client
      const client: Client = await createClientMutation.mutateAsync(clientData);
      
      // Create appointment
      const appointmentData = {
        clientId: client.id,
        serviceId: selectedService.id,
        date: getDateString(selectedDate),
        time: selectedTime,
        status: "agendado",
      };

      const appointment = await createAppointmentMutation.mutateAsync(appointmentData);
      console.log("Appointment created successfully:", appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast({
        title: "Erro no agendamento",
        description: "Não foi possível confirmar o agendamento. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedService(null);
    setSelectedDate(undefined);
    setSelectedTime("");
    setClientData(null);
    setShowSuccessModal(false);
    form.reset();
  };

  const StepIndicator = () => (
    <div className="mb-4 sm:mb-8">
      <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
        {[1, 2, 3].map((step, index) => (
          <div key={step} className="flex items-center w-full sm:w-auto">
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm ${
              currentStep >= step ? 'bg-primary' : 'bg-gray-300'
            }`}>
              {step}
            </div>
            <span className={`ml-2 text-xs sm:text-sm font-medium ${
              currentStep >= step ? 'text-primary' : 'text-gray-600'
            }`}>
              {step === 1 && "Os Seus Dados"}
              {step === 2 && "Serviço"}
              {step === 3 && "Data e Hora"}
            </span>
            {index < 2 && <div className="hidden sm:block w-12 h-0.5 bg-gray-300 mx-4" />}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Card className="bg-white rounded-2xl shadow-lg max-w-4xl mx-auto">
        <CardContent className="p-4 sm:p-8">
          <StepIndicator />

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">Os Seus Dados</h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleStep1Submit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o seu nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            {/* Country Selector */}
                            <Select 
                              value={selectedCountry.code} 
                              onValueChange={(value) => {
                                const country = COUNTRIES.find(c => c.code === value);
                                if (country) {
                                  setSelectedCountry(country);
                                  field.onChange(''); // Reset phone when country changes
                                }
                              }}
                            >
                              <SelectTrigger className="w-32 flex-shrink-0">
                                <SelectValue>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium uppercase tracking-wide">
                                      {selectedCountry.name.slice(0, 2)}
                                    </span>
                                    <span className="text-sm font-mono">
                                      {selectedCountry.code}
                                    </span>
                                  </div>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {COUNTRIES.map((country) => (
                                  <SelectItem key={country.code} value={country.code}>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium uppercase tracking-wide">
                                        {country.name.slice(0, 2)}
                                      </span>
                                      <span className="font-mono text-sm">
                                        {country.code}
                                      </span>
                                      <span className="text-sm text-gray-500">
                                        {country.name}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            {/* Phone Input */}
                            <Input 
                              placeholder={selectedCountry.format}
                              value={field.value ? field.value.replace(selectedCountry.code, '').trim() : ''}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                                let formatted = value;
                                
                                // Format based on selected country
                                if (selectedCountry.code === "+351") {
                                  // Portugal: 9XX XXX XXX
                                  if (value.length >= 3) {
                                    formatted = value.slice(0, 3);
                                    if (value.length >= 6) {
                                      formatted += ' ' + value.slice(3, 6);
                                      if (value.length >= 9) {
                                        formatted += ' ' + value.slice(6, 9);
                                      } else if (value.length > 6) {
                                        formatted += ' ' + value.slice(6);
                                      }
                                    } else if (value.length > 3) {
                                      formatted += ' ' + value.slice(3);
                                    }
                                  }
                                } else if (selectedCountry.code === "+55") {
                                  // Brasil: (XX) 9XXXX-XXXX
                                  if (value.length >= 2) {
                                    formatted = '(' + value.slice(0, 2) + ')';
                                    if (value.length >= 3) {
                                      const phoneNumber = value.slice(2);
                                      if (phoneNumber.length >= 5) {
                                        formatted += ' ' + phoneNumber.slice(0, 5);
                                        if (phoneNumber.length >= 9) {
                                          formatted += '-' + phoneNumber.slice(5, 9);
                                        } else if (phoneNumber.length > 5) {
                                          formatted += '-' + phoneNumber.slice(5);
                                        }
                                      } else {
                                        formatted += ' ' + phoneNumber;
                                      }
                                    }
                                  }
                                } else if (selectedCountry.code === "+1") {
                                  // EUA: (XXX) XXX-XXXX
                                  if (value.length >= 3) {
                                    formatted = '(' + value.slice(0, 3) + ')';
                                    if (value.length >= 6) {
                                      formatted += ' ' + value.slice(3, 6);
                                      if (value.length >= 10) {
                                        formatted += '-' + value.slice(6, 10);
                                      } else if (value.length > 6) {
                                        formatted += '-' + value.slice(6);
                                      }
                                    } else if (value.length > 3) {
                                      formatted += ' ' + value.slice(3);
                                    }
                                  }
                                } else {
                                  // Other countries: simple space formatting
                                  if (value.length > 4) {
                                    formatted = value.slice(0, 4) + ' ' + value.slice(4);
                                  }
                                  if (value.length > 7) {
                                    formatted = formatted.slice(0, 9) + ' ' + formatted.slice(9);
                                  }
                                }
                                
                                field.onChange(selectedCountry.code + ' ' + formatted);
                              }}
                              className="flex-1"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Continuar <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </form>
              </Form>
            </div>
          )}

          {/* Step 2: Service Selection */}
          {currentStep === 2 && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">Escolha o Seu Serviço</h3>
              
              {servicesLoading ? (
                <div className="text-center py-8">A carregar serviços...</div>
              ) : (
                <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {services.map((service) => (
                    <Card
                      key={service.id}
                      className={`cursor-pointer transition-all hover:border-primary ${
                        selectedService?.id === service.id ? 'border-primary bg-primary/5' : 'border-gray-200'
                      }`}
                      onClick={() => handleServiceSelect(service)}
                    >
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start justify-between">
                          <div className="flex-1 w-full">
                            <h4 className="text-base sm:text-lg font-semibold text-gray-900">{service.name}</h4>
                            <p className="text-gray-600 text-xs sm:text-sm mt-1">{service.description}</p>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center mt-3 space-y-2 sm:space-y-0 sm:space-x-4">
                              <span className="text-lg sm:text-2xl font-bold text-primary">
                                {formatPrice(service.price)}
                              </span>
                              <span className="text-xs sm:text-sm text-gray-500 flex items-center">
                                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                {service.duration} min
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 sm:mt-0 sm:ml-4">
                            {getServiceIcon(service.name)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <Button variant="outline" onClick={() => setCurrentStep(1)} className="w-full sm:flex-1">
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Voltar
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Date & Time Selection */}
          {currentStep === 3 && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">Escolha a Data e Horário</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Calendar */}
                <div>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Selecione a Data</h4>
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
                      className="rounded-md border w-full max-w-sm"
                      locale={pt}
                      weekStartsOn={1} // Monday
                    />
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Horários Disponíveis</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {!selectedDate ? (
                      <p className="text-gray-500 text-center py-8">Selecione uma data para ver os horários disponíveis</p>
                    ) : timesLoading ? (
                      <p className="text-gray-500 text-center py-8">A carregar horários...</p>
                    ) : availableTimes.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Nenhum horário disponível para esta data</p>
                    ) : (
                      availableTimes.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          className="w-full justify-between"
                          onClick={() => handleTimeSelect(time)}
                        >
                          <span className="font-medium">{time}</span>
                          <span className="text-sm">Disponível</span>
                        </Button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Booking Summary */}
              {selectedService && selectedDate && selectedTime && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <h5 className="font-semibold text-gray-900 mb-2">Resumo do Agendamento</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Serviço:</span>
                        <span className="block font-medium text-gray-900">{selectedService.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Data:</span>
                        <span className="block font-medium text-gray-900">{formatDate(getDateString(selectedDate))}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Horário:</span>
                        <span className="block font-medium text-gray-900">{selectedTime}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <Button variant="outline" onClick={() => setCurrentStep(2)} className="w-full sm:flex-1">
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Voltar
                </Button>
                <Button
                  onClick={handleConfirmBooking}
                  disabled={!selectedDate || !selectedTime || createAppointmentMutation.isPending}
                  className="w-full sm:flex-1"
                >
                  {createAppointmentMutation.isPending ? (
                    "A confirmar..."
                  ) : (
                    <>
                      <span className="hidden sm:inline">Confirmar Agendamento</span>
                      <span className="sm:hidden">Confirmar</span>
                      <Check className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-green-600 text-2xl" />
              </div>
              <DialogTitle className="text-xl font-semibold text-gray-900 mb-2">
                Agendamento Confirmado!
              </DialogTitle>
              <p className="text-gray-600 mb-6">
                O seu agendamento foi realizado com sucesso. Foi redirecionado para o WhatsApp para confirmação.
              </p>
              <Button onClick={resetForm} className="w-full">
                Fechar
              </Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
