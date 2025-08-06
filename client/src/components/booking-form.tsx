import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { clientValidationSchema, formatCPF, formatPrice, formatDate, getDateString } from "@/lib/validation";
import { type Service, type Client } from "@shared/schema";
import { ArrowRight, ArrowLeft, Check, Clock, Eye, Palette, Leaf, Gem } from "lucide-react";
import { z } from "zod";

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

export default function BookingForm() {
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [clientData, setClientData] = useState<z.infer<typeof clientValidationSchema> | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof clientValidationSchema>>({
    resolver: zodResolver(clientValidationSchema),
    defaultValues: {
      fullName: "",
      cpf: "",
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
      const response = await apiRequest("POST", "/api/clients", clientData);
      return await response.json();
    },
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: z.infer<typeof appointmentSchema>) => {
      const response = await apiRequest("POST", "/api/appointments", appointmentData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
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

      await createAppointmentMutation.mutateAsync(appointmentData);
    } catch (error) {
      console.error("Error creating appointment:", error);
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
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3].map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
              currentStep >= step ? 'bg-primary' : 'bg-gray-300'
            }`}>
              {step}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              currentStep >= step ? 'text-primary' : 'text-gray-600'
            }`}>
              {step === 1 && "Seus Dados"}
              {step === 2 && "Serviço"}
              {step === 3 && "Data & Hora"}
            </span>
            {index < 2 && <div className="w-12 h-0.5 bg-gray-300 mx-4" />}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Card className="bg-white rounded-2xl shadow-lg">
        <CardContent className="p-8">
          <StepIndicator />

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Informações Pessoais</h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleStep1Submit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite seu nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="000.000.000-00"
                              {...field}
                              onChange={(e) => {
                                const formatted = formatCPF(e.target.value);
                                field.onChange(formatted);
                              }}
                              maxLength={14}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 99999-9999" {...field} />
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
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Escolha seu Serviço</h3>
              
              {servicesLoading ? (
                <div className="text-center py-8">Carregando serviços...</div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <Card
                      key={service.id}
                      className={`cursor-pointer transition-all hover:border-primary ${
                        selectedService?.id === service.id ? 'border-primary bg-primary/5' : 'border-gray-200'
                      }`}
                      onClick={() => handleServiceSelect(service)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900">{service.name}</h4>
                            <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                            <div className="flex items-center mt-3 space-x-4">
                              <span className="text-2xl font-bold text-primary">
                                {formatPrice(service.price)}
                              </span>
                              <span className="text-sm text-gray-500 flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {service.duration} min
                              </span>
                            </div>
                          </div>
                          {getServiceIcon(service.name)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="flex space-x-4">
                <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Voltar
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Date & Time Selection */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Escolha a Data e Horário</h3>
              
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Calendar */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Selecione a Data</h4>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
                    className="rounded-md border"
                  />
                </div>

                {/* Time Slots */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Horários Disponíveis</h4>
                  <div className="space-y-2">
                    {!selectedDate ? (
                      <p className="text-gray-500 text-center py-8">Selecione uma data para ver os horários disponíveis</p>
                    ) : timesLoading ? (
                      <p className="text-gray-500 text-center py-8">Carregando horários...</p>
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
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
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

              <div className="flex space-x-4">
                <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Voltar
                </Button>
                <Button
                  onClick={handleConfirmBooking}
                  disabled={!selectedDate || !selectedTime || createAppointmentMutation.isPending}
                  className="flex-1"
                >
                  {createAppointmentMutation.isPending ? (
                    "Confirmando..."
                  ) : (
                    <>
                      Confirmar Agendamento <Check className="ml-2 w-4 h-4" />
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
                Seu agendamento foi realizado com sucesso. Você receberá uma confirmação em breve.
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
