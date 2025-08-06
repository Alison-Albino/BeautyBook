import { type Service, type InsertService, type Client, type InsertClient, type Appointment, type InsertAppointment, type AppointmentWithDetails } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Services
  getServices(): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: string): Promise<boolean>;

  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  getClientByPhone(phone: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined>;

  // Appointments
  getAppointments(): Promise<AppointmentWithDetails[]>;
  getAppointment(id: string): Promise<AppointmentWithDetails | undefined>;
  getAppointmentsByDate(date: string): Promise<AppointmentWithDetails[]>;
  getAvailableTimeSlots(date: string, serviceId: string): Promise<string[]>;
  createAppointment(appointment: InsertAppointment): Promise<AppointmentWithDetails>;
  updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<AppointmentWithDetails | undefined>;
  deleteAppointment(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private services: Map<string, Service>;
  private clients: Map<string, Client>;
  private appointments: Map<string, Appointment>;

  constructor() {
    this.services = new Map();
    this.clients = new Map();
    this.appointments = new Map();
    this.initializeDefaultServices();
  }

  private initializeDefaultServices() {
    const defaultServices: Service[] = [
      {
        id: randomUUID(),
        name: "Design de Sobrancelhas",
        description: "Modelagem e design perfeito para as suas sobrancelhas",
        price: 2500, // €25.00 in cents
        duration: 45,
        isActive: true
      },
      {
        id: randomUUID(),
        name: "Extensão de Pestanas",
        description: "Aplicação de extensões para pestanas mais longas e volumosas",
        price: 4500, // €45.00 in cents
        duration: 90,
        isActive: true
      },
      {
        id: randomUUID(),
        name: "Laminação de Sobrancelhas",
        description: "Tratamento para sobrancelhas mais definidas e duradouras",
        price: 3500, // €35.00 in cents
        duration: 60,
        isActive: true
      },
      {
        id: randomUUID(),
        name: "Lifting de Pestanas",
        description: "Curvatura natural das pestanas com efeito duradouro",
        price: 3000, // €30.00 in cents
        duration: 60,
        isActive: true
      },
      {
        id: randomUUID(),
        name: "Henna para Sobrancelhas",
        description: "Coloração natural e definição com henna",
        price: 2000, // €20.00 in cents
        duration: 45,
        isActive: true
      }
    ];

    defaultServices.forEach(service => {
      this.services.set(service.id, service);
    });
  }

  // Services
  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values()).filter(service => service.isActive);
  }

  async getService(id: string): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = randomUUID();
    const service: Service = { 
      id,
      name: insertService.name,
      description: insertService.description,
      price: insertService.price,
      duration: insertService.duration,
      isActive: insertService.isActive
    };
    this.services.set(id, service);
    return service;
  }

  async updateService(id: string, updateData: Partial<InsertService>): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;
    
    const updatedService = { ...service, ...updateData };
    this.services.set(id, updatedService);
    return updatedService;
  }

  async deleteService(id: string): Promise<boolean> {
    return this.services.delete(id);
  }

  // Clients
  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async getClient(id: string): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getClientByPhone(phone: string): Promise<Client | undefined> {
    return Array.from(this.clients.values()).find(client => client.phone === phone);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = randomUUID();
    const client: Client = { 
      ...insertClient, 
      id, 
      createdAt: new Date() 
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: string, updateData: Partial<InsertClient>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;
    
    const updatedClient = { ...client, ...updateData };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  // Appointments
  async getAppointments(): Promise<AppointmentWithDetails[]> {
    const appointments = Array.from(this.appointments.values());
    const result: AppointmentWithDetails[] = [];
    
    for (const appointment of appointments) {
      const client = this.clients.get(appointment.clientId);
      const service = this.services.get(appointment.serviceId);
      
      if (client && service) {
        result.push({ ...appointment, client, service });
      }
    }
    
    return result.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });
  }

  async getAppointment(id: string): Promise<AppointmentWithDetails | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const client = this.clients.get(appointment.clientId);
    const service = this.services.get(appointment.serviceId);
    
    if (!client || !service) return undefined;
    
    return { ...appointment, client, service };
  }

  async getAppointmentsByDate(date: string): Promise<AppointmentWithDetails[]> {
    const allAppointments = await this.getAppointments();
    return allAppointments.filter(appointment => appointment.date === date);
  }

  async getAvailableTimeSlots(date: string, serviceId: string): Promise<string[]> {
    const service = await this.getService(serviceId);
    if (!service) return [];

    const allTimeSlots = [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
    ];

    const existingAppointments = await this.getAppointmentsByDate(date);
    const bookedTimes = existingAppointments
      .filter(apt => apt.status !== "cancelado")
      .map(apt => apt.time);

    return allTimeSlots.filter(time => !bookedTimes.includes(time));
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<AppointmentWithDetails> {
    const id = randomUUID();
    const appointment: Appointment = { 
      id,
      clientId: insertAppointment.clientId,
      serviceId: insertAppointment.serviceId,
      date: insertAppointment.date,
      time: insertAppointment.time,
      status: insertAppointment.status || "agendado",
      notes: insertAppointment.notes || null,
      createdAt: new Date()
    };
    
    this.appointments.set(id, appointment);
    
    const client = this.clients.get(appointment.clientId)!;
    const service = this.services.get(appointment.serviceId)!;
    
    return { ...appointment, client, service };
  }

  async updateAppointment(id: string, updateData: Partial<InsertAppointment>): Promise<AppointmentWithDetails | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, ...updateData };
    this.appointments.set(id, updatedAppointment);
    
    const client = this.clients.get(updatedAppointment.clientId);
    const service = this.services.get(updatedAppointment.serviceId);
    
    if (!client || !service) return undefined;
    
    return { ...updatedAppointment, client, service };
  }

  async deleteAppointment(id: string): Promise<boolean> {
    return this.appointments.delete(id);
  }
}

export const storage = new MemStorage();
