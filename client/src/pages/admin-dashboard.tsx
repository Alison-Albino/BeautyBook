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
import { Plus, Edit2, Trash2, LogOut, Calendar, Users, DollarSign, Package, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import logoPath from "@assets/logo bs_1754516178309.png";

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<string>("week");
  const [customDateFrom, setCustomDateFrom] = useState<string>("");
  const [customDateTo, setCustomDateTo] = useState<string>("");
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

  const completeAppointmentMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/admin/appointments/${id}/complete`, { method: "PATCH" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/appointments"] });
      toast({
        title: "Sucesso",
        description: "Agendamento finalizado com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao finalizar agendamento",
        variant: "destructive",
      });
    },
  });

  const cancelAppointmentMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/admin/appointments/${id}/cancel`, { method: "PATCH" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/appointments"] });
      toast({
        title: "Agendamento cancelado",
        description: "O horário foi liberado e está novamente disponível",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao cancelar agendamento",
        variant: "destructive",
      });
    },
  });

  const handleDeleteService = (service: Service) => {
    if (window.confirm(`Tem certeza que deseja eliminar o serviço "${service.name}"? Esta ação não pode ser desfeita.`)) {
      deleteServiceMutation.mutate(service.id);
    }
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setValue("name", service.name);
    setValue("description", service.description);
    setValue("price", service.price / 100); // Convert cents to euros for display
    setValue("duration", service.duration);
    setValue("isActive", service.isActive);
    setServiceDialogOpen(true);
  };

  const onSubmit = (data: InsertService) => {
    // Convert price from euros to cents for storage
    const serviceData = {
      ...data,
      price: Math.round(data.price * 100)
    };
    
    if (selectedService) {
      updateServiceMutation.mutate({ id: selectedService.id, data: serviceData });
    } else {
      createServiceMutation.mutate(serviceData);
    }
  };

  // Helper functions for formatting
  const formatPrice = (price: number) => {
    return `€${(price / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Filter appointments by date
  const getFilteredAppointments = () => {
    if (dateFilter === "all") return appointments;
    
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date();
    
    switch (dateFilter) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "custom":
        if (!customDateFrom || !customDateTo) return appointments;
        startDate = new Date(customDateFrom);
        endDate = new Date(customDateTo);
        endDate.setHours(23, 59, 59);
        break;
      default:
        return appointments;
    }
    
    return appointments.filter((apt: AppointmentWithDetails) => {
      const aptDate = new Date(apt.date);
      return aptDate >= startDate && aptDate <= endDate;
    });
  };

  const filteredAppointments = getFilteredAppointments();

  // Calculate stats
  const totalRevenue = filteredAppointments
    .filter((apt: AppointmentWithDetails) => apt.status === "concluido")
    .reduce((total: number, apt: AppointmentWithDetails) => total + apt.service.price, 0);

  const pendingAppointments = filteredAppointments.filter((apt: AppointmentWithDetails) => apt.status === "agendado").length;
  const totalClients = new Set(filteredAppointments.map((apt: AppointmentWithDetails) => apt.client.id)).size;

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
        {/* Revenue Filter */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtrar Agendamentos e Estatísticas
                </CardTitle>
                <CardDescription>Filtre os agendamentos e estatísticas por período (padrão: esta semana)</CardDescription>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="week">Esta semana</SelectItem>
                    <SelectItem value="month">Este mês</SelectItem>
                    <SelectItem value="year">Este ano</SelectItem>
                    <SelectItem value="all">Todos os registos</SelectItem>
                    <SelectItem value="custom">Período personalizado</SelectItem>
                  </SelectContent>
                </Select>
                
                {dateFilter === "custom" && (
                  <>
                    <Input
                      type="date"
                      value={customDateFrom}
                      onChange={(e) => setCustomDateFrom(e.target.value)}
                      className="w-40"
                      placeholder="Data inicial"
                    />
                    <Input
                      type="date"
                      value={customDateTo}
                      onChange={(e) => setCustomDateTo(e.target.value)}
                      className="w-40"
                      placeholder="Data final"
                    />
                  </>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

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
                  <p className="text-sm text-muted-foreground">Agendamentos</p>
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

        {/* Recent Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Agendamentos 
              {dateFilter === "today" ? "de Hoje" :
               dateFilter === "week" ? "desta Semana" :
               dateFilter === "month" ? "deste Mês" :
               dateFilter === "year" ? "deste Ano" :
               dateFilter === "all" ? "Recentes" :
               "do Período Personalizado"}
            </CardTitle>
            <CardDescription>
              {dateFilter === "all" ? "Últimos 50 agendamentos realizados" : 
               `Agendamentos filtrados - ${dateFilter === "custom" ? "período personalizado" : 
                dateFilter === "today" ? "apenas hoje" :
                dateFilter === "week" ? "últimos 7 dias" :
                dateFilter === "month" ? "últimos 30 dias" :
                "último ano"}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <p className="text-center py-8 text-muted-foreground">A carregar agendamentos...</p>
            ) : appointments.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Nenhum agendamento encontrado</p>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.slice(0, 10).map((appointment: AppointmentWithDetails) => (
                  <div
                    key={appointment.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{appointment.client.fullName}</h4>
                      <p className="text-sm text-muted-foreground truncate">{appointment.client.phone}</p>
                      <p className="text-sm text-muted-foreground truncate">{appointment.service.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(appointment.date)} às {appointment.time}
                      </p>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
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
                        <p className="text-sm font-medium">
                          {formatPrice(appointment.service.price)}
                        </p>
                      </div>
                      {appointment.status === "agendado" && (
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => completeAppointmentMutation.mutate(appointment.id)}
                            disabled={completeAppointmentMutation.isPending || cancelAppointmentMutation.isPending}
                            className="flex-1 sm:flex-none"
                          >
                            Finalizar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (window.confirm("Tem certeza que deseja cancelar este agendamento? O horário ficará disponível novamente.")) {
                                cancelAppointmentMutation.mutate(appointment.id);
                              }
                            }}
                            disabled={completeAppointmentMutation.isPending || cancelAppointmentMutation.isPending}
                            className="text-red-600 hover:text-red-700 flex-1 sm:flex-none"
                          >
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
                        <Label htmlFor="price">Preço (€)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          {...register("price", { 
                            valueAsNumber: true
                          })}
                          placeholder="25.00"
                        />
                        {errors.price && (
                          <p className="text-sm text-destructive">{errors.price.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground">Ex: 25.00 para €25,00</p>
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
                        onClick={() => handleDeleteService(service)}
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
      </div>
    </div>
  );
}