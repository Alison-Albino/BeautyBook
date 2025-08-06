import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertServiceSchema, type Service, type InsertService, type AppointmentWithDetails } from "@shared/schema";
import { Plus, Edit2, Trash2, LogOut, Calendar, Users, DollarSign, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import logoPath from "@assets/logo bs_1754516178309.png";

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: services = [], isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ["/api/admin/services"],
    retry: false,
  });

  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery<AppointmentWithDetails[]>({
    queryKey: ["/api/admin/appointments"],
    retry: false,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<InsertService>({
    resolver: zodResolver(insertServiceSchema),
    defaultValues: {
      isActive: true,
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/admin/logout", {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Logout realizado com sucesso",
        description: "Até à próxima!",
      });
      onLogout();
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: async (serviceData: InsertService) => {
      return await apiRequest("/api/admin/services", {
        method: "POST",
        body: serviceData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Serviço criado",
        description: "O serviço foi adicionado com sucesso",
      });
      setServiceDialogOpen(false);
      reset();
      setSelectedService(null);
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar serviço",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertService> }) => {
      return await apiRequest(`/api/admin/services/${id}`, {
        method: "PATCH",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Serviço atualizado",
        description: "As alterações foram guardadas com sucesso",
      });
      setServiceDialogOpen(false);
      reset();
      setSelectedService(null);
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar serviço",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/services/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Serviço eliminado",
        description: "O serviço foi removido com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao eliminar serviço",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setValue("name", service.name);
    setValue("description", service.description);
    setValue("price", service.price);
    setValue("duration", service.duration);
    setValue("isActive", service.isActive);
    setServiceDialogOpen(true);
  };

  const onSubmit = (data: InsertService) => {
    if (selectedService) {
      updateServiceMutation.mutate({ id: selectedService.id, data });
    } else {
      createServiceMutation.mutate(data);
    }
  };

  const formatPrice = (price: number) => {
    return `€${(price / 100).toFixed(2)}`;
  };

  // Calculate stats
  const totalRevenue = appointments
    .filter((apt: AppointmentWithDetails) => apt.status === "concluido")
    .reduce((total: number, apt: AppointmentWithDetails) => total + apt.service.price, 0);

  const pendingAppointments = appointments.filter((apt: AppointmentWithDetails) => apt.status === "agendado").length;
  const totalClients = new Set(appointments.map((apt: AppointmentWithDetails) => apt.client.id)).size;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={logoPath} alt="Beatriz Sousa" className="h-12 w-auto" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
                <p className="text-sm text-muted-foreground">Gestão do Salão Beatriz Sousa</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold">{formatPrice(totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Agendamentos Pendentes</p>
                  <p className="text-2xl font-bold">{pendingAppointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total de Clientes</p>
                  <p className="text-2xl font-bold">{totalClients}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Serviços Ativos</p>
                  <p className="text-2xl font-bold">{services.filter((s: Service) => s.isActive).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gestão de Serviços</CardTitle>
                <CardDescription>Adicione, edite ou remova serviços oferecidos</CardDescription>
              </div>
              <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setSelectedService(null);
                      reset();
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Serviço
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedService ? "Editar Serviço" : "Adicionar Novo Serviço"}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedService
                        ? "Altere os detalhes do serviço abaixo"
                        : "Preencha os detalhes do novo serviço"}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Serviço</Label>
                      <Input
                        id="name"
                        {...register("name")}
                        placeholder="Ex: Design de Sobrancelhas"
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        {...register("description")}
                        placeholder="Descreva o serviço oferecido"
                        rows={3}
                      />
                      {errors.description && (
                        <p className="text-sm text-destructive">{errors.description.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Preço (cêntimos)</Label>
                        <Input
                          id="price"
                          type="number"
                          {...register("price", { valueAsNumber: true })}
                          placeholder="2500"
                        />
                        {errors.price && (
                          <p className="text-sm text-destructive">{errors.price.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground">Ex: 2500 = €25,00</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duration">Duração (minutos)</Label>
                        <Input
                          id="duration"
                          type="number"
                          {...register("duration", { valueAsNumber: true })}
                          placeholder="45"
                        />
                        {errors.duration && (
                          <p className="text-sm text-destructive">{errors.duration.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setServiceDialogOpen(false);
                          reset();
                          setSelectedService(null);
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
                      >
                        {selectedService ? "Atualizar" : "Criar"} Serviço
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {servicesLoading ? (
              <p className="text-center py-8 text-muted-foreground">A carregar serviços...</p>
            ) : (
              <div className="space-y-4">
                {services.map((service: Service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{service.name}</h3>
                        <Badge variant={service.isActive ? "default" : "secondary"}>
                          {service.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="font-medium text-primary">
                          {formatPrice(service.price)}
                        </span>
                        <span className="text-muted-foreground">
                          {service.duration} minutos
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditService(service)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteServiceMutation.mutate(service.id)}
                        disabled={deleteServiceMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Agendamentos Recentes</CardTitle>
            <CardDescription>Últimos agendamentos realizados</CardDescription>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <p className="text-center py-8 text-muted-foreground">A carregar agendamentos...</p>
            ) : appointments.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Nenhum agendamento encontrado</p>
            ) : (
              <div className="space-y-4">
                {appointments.slice(0, 10).map((appointment: AppointmentWithDetails) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-semibold">{appointment.client.fullName}</h4>
                      <p className="text-sm text-muted-foreground">{appointment.service.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.date} às {appointment.time}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          appointment.status === "concluido"
                            ? "default"
                            : appointment.status === "agendado"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {appointment.status}
                      </Badge>
                      <p className="text-sm font-medium mt-1">
                        {formatPrice(appointment.service.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}