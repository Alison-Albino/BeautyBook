import { type Service, type InsertService, type Client, type InsertClient, type Appointment, type InsertAppointment, type AppointmentWithDetails, type Admin, type InsertAdmin, type LoginRequest, services, clients, appointments, admin } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // Services
  getServices(): Promise<Service[]>;
  getAllServices(): Promise<Service[]>;
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

  // Admin
  getAdmin(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  verifyAdmin(credentials: LoginRequest): Promise<Admin | null>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDefaultAdmin();
  }

  private async initializeDefaultAdmin() {
    try {
      const existingAdmin = await this.getAdmin("admin");
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        await this.createAdmin({
          username: "admin",
          password: hashedPassword,
        });
        console.log("Default admin created - username: admin, password: admin123");
      }
    } catch (error) {
      console.log("Admin initialization will be handled by first access");
    }
  }

  // Services - Cache services for better performance
  private servicesCache: { active: Service[], all: Service[], timestamp: number } | null = null;
  private readonly CACHE_TTL = 30000; // 30 seconds
  
  async getServices(): Promise<Service[]> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.servicesCache && (now - this.servicesCache.timestamp) < this.CACHE_TTL) {
      return this.servicesCache.active;
    }
    
    // Fetch fresh data
    const activeServices = await db.select().from(services).where(eq(services.isActive, true));
    const allServices = await db.select().from(services);
    
    // Update cache
    this.servicesCache = { active: activeServices, all: allServices, timestamp: now };
    
    return activeServices;
  }

  async getAllServices(): Promise<Service[]> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.servicesCache && (now - this.servicesCache.timestamp) < this.CACHE_TTL) {
      return this.servicesCache.all;
    }
    
    // Refresh cache by calling getServices first
    await this.getServices();
    
    return this.servicesCache!.all;
  }

  async getService(id: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db.insert(services).values(insertService).returning();
    // Clear cache when service is created
    this.servicesCache = null;
    return service;
  }

  async updateService(id: string, updateData: Partial<InsertService>): Promise<Service | undefined> {
    const [service] = await db.update(services).set(updateData).where(eq(services.id, id)).returning();
    // Clear cache when service is updated
    this.servicesCache = null;
    return service;
  }

  async deleteService(id: string): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id));
    // Clear cache when service is deleted
    this.servicesCache = null;
    return (result.rowCount ?? 0) > 0;
  }

  // Clients
  async getClients(): Promise<Client[]> {
    const result = await db.select().from(clients);
    return result;
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async getClientByPhone(phone: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.phone, phone));
    return client;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(insertClient).returning();
    return client;
  }

  async updateClient(id: string, updateData: Partial<InsertClient>): Promise<Client | undefined> {
    const [client] = await db.update(clients).set(updateData).where(eq(clients.id, id)).returning();
    return client;
  }

  // Appointments
  async getAppointments(): Promise<AppointmentWithDetails[]> {
    const result = await db
      .select({
        appointment: appointments,
        client: clients,
        service: services,
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .orderBy(desc(appointments.createdAt))
      .limit(50); // Limit to last 50 appointments for performance

    return result.map(row => ({
      ...row.appointment,
      client: row.client!,
      service: row.service!,
    }));
  }

  async getAppointment(id: string): Promise<AppointmentWithDetails | undefined> {
    const [result] = await db
      .select({
        appointment: appointments,
        client: clients,
        service: services,
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(eq(appointments.id, id));

    if (!result) return undefined;

    return {
      ...result.appointment,
      client: result.client!,
      service: result.service!,
    };
  }

  async getAppointmentsByDate(date: string): Promise<AppointmentWithDetails[]> {
    const result = await db
      .select({
        appointment: appointments,
        client: clients,
        service: services,
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(eq(appointments.date, date));

    return result.map(row => ({
      ...row.appointment,
      client: row.client!,
      service: row.service!,
    }));
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
    const [appointment] = await db.insert(appointments).values(insertAppointment).returning();
    
    const client = await this.getClient(appointment.clientId);
    const service = await this.getService(appointment.serviceId);
    
    return { ...appointment, client: client!, service: service! };
  }

  async updateAppointment(id: string, updateData: Partial<InsertAppointment>): Promise<AppointmentWithDetails | undefined> {
    const [appointment] = await db.update(appointments).set(updateData).where(eq(appointments.id, id)).returning();
    if (!appointment) return undefined;
    
    const client = await this.getClient(appointment.clientId);
    const service = await this.getService(appointment.serviceId);
    
    return { ...appointment, client: client!, service: service! };
  }

  async deleteAppointment(id: string): Promise<boolean> {
    const result = await db.delete(appointments).where(eq(appointments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Admin
  async getAdmin(username: string): Promise<Admin | undefined> {
    const [adminUser] = await db.select().from(admin).where(eq(admin.username, username));
    return adminUser;
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const [adminUser] = await db.insert(admin).values(insertAdmin).returning();
    return adminUser;
  }

  async verifyAdmin(credentials: LoginRequest): Promise<Admin | null> {
    const adminUser = await this.getAdmin(credentials.username);
    if (!adminUser) return null;

    const isValidPassword = await bcrypt.compare(credentials.password, adminUser.password);
    if (!isValidPassword) return null;

    return adminUser;
  }
}

export const storage = new DatabaseStorage();