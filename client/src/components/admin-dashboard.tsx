import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatPrice, formatDate } from "@/lib/validation";
import { type AppointmentWithDetails } from "@shared/schema";
import { CalendarCheck, TrendingUp, Clock, DollarSign, Edit, Check, X, Plus } from "lucide-react";

export default function AdminDashboard() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data: appointments = [], isLoading, refetch } = useQuery<AppointmentWithDetails[]>({
    queryKey: ["/api/appointments"],
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/appointments/${id}`, { status });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Sucesso",
        description: "Status do agendamento atualizado.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o agendamento.",
        variant: "destructive",
      });
    },
  });

  const cancelAppointmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/appointments/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Sucesso",
        description: "Agendamento cancelado.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível cancelar o agendamento.",
        variant: "destructive",
      });
    },
  });

  const filteredAppointments = appointments.filter((appointment) => {
    const statusMatch = statusFilter === "all" || appointment.status === statusFilter;
    const dateMatch = !dateFilter || appointment.date === dateFilter;
    const serviceMatch = serviceFilter === "all" || appointment.service.name === serviceFilter;
    
    return statusMatch && dateMatch && serviceMatch;
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      agendado: { label: "Agendado", variant: "secondary" as const },
      confirmado: { label: "Confirmado", variant: "default" as const },
      em_andamento: { label: "Em Andamento", variant: "default" as const },
      concluido: { label: "Concluído", variant: "secondary" as const },
      cancelado: { label: "Cancelado", variant: "destructive" as const },
    };

    const config = statusMap[status as keyof typeof statusMap] || statusMap.agendado;
    return (
      <Badge variant={config.variant} className="whitespace-nowrap">
        {config.label}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleStatusUpdate = (appointmentId: string, newStatus: string) => {
    updateAppointmentMutation.mutate({ id: appointmentId, status: newStatus });
  };

  const handleCancel = (appointmentId: string) => {
    if (confirm("Tem certeza que deseja cancelar este agendamento?")) {
      cancelAppointmentMutation.mutate(appointmentId);
    }
  };

  // Calculate statistics
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(apt => apt.date === today && apt.status !== 'cancelado').length;
  
  const thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay());
  const weekStart = thisWeek.toISOString().split('T')[0];
  const weekAppointments = appointments.filter(apt => apt.date >= weekStart && apt.status !== 'cancelado').length;
  
  const pendingAppointments = appointments.filter(apt => apt.status === 'agendado').length;
  
  const todayRevenue = appointments
    .filter(apt => apt.date === today && apt.status === 'concluido')
    .reduce((sum, apt) => sum + apt.service.price, 0);

  return (
    <div className="min-h-screen">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h2 className="text-3xl font-bold text-gray-900">Painel Administrativo</h2>
            <p className="mt-1 text-gray-600">Gerencie todos os agendamentos do salão</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CalendarCheck className="text-blue-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hoje</p>
                  <p className="text-2xl font-semibold text-gray-900">{todayAppointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="text-green-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Esta Semana</p>
                  <p className="text-2xl font-semibold text-gray-900">{weekAppointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="text-yellow-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-2xl font-semibold text-gray-900">{pendingAppointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <DollarSign className="text-primary text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Faturamento Hoje</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatPrice(todayRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Todos os Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-48"
                />
                
                <Select value={serviceFilter} onValueChange={setServiceFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Todos os Serviços" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Serviços</SelectItem>
                    <SelectItem value="Design de Sobrancelhas">Design de Sobrancelhas</SelectItem>
                    <SelectItem value="Micropigmentação">Micropigmentação</SelectItem>
                    <SelectItem value="Henna">Henna</SelectItem>
                    <SelectItem value="Design + Henna">Design + Henna</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Agendamento
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Agendamentos</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Carregando agendamentos...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Horário</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          Nenhum agendamento encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAppointments.map((appointment) => (
                        <TableRow key={appointment.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                                <span className="text-primary font-semibold text-sm">
                                  {getInitials(appointment.client.fullName)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {appointment.client.fullName}
                                </div>
                                {appointment.client.phone && (
                                  <div className="text-sm text-gray-500">
                                    {appointment.client.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-900">
                            {appointment.service.name}
                          </TableCell>
                          <TableCell className="text-sm text-gray-900">
                            {formatDate(appointment.date)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-900">
                            {appointment.time}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(appointment.status)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-900">
                            {formatPrice(appointment.service.price)}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {appointment.status === "agendado" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(appointment.id, "confirmado")}
                                  className="text-green-600 hover:text-green-800"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              )}
                              {appointment.status === "confirmado" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(appointment.id, "concluido")}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              )}
                              {appointment.status !== "cancelado" && appointment.status !== "concluido" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCancel(appointment.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
