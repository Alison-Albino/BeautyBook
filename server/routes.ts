import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClientSchema, insertAppointmentSchema, insertServiceSchema, loginSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

declare module "express-session" {
  interface SessionData {
    adminId: string;
  }
}

// Session configuration
const PgStore = connectPgSimple(session);

// Admin authentication middleware
const requireAuth = (req: Request, res: any, next: any) => {
  if (!req.session?.adminId) {
    return res.status(401).json({ message: "Acesso negado" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    store: new PgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'beautysalon-secret-key',
    resave: false,
    saveUninitialized: false,
    name: 'sessionId',
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax',
    },
  }));
  // Services routes
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar serviços" });
    }
  });

  // Clients routes
  app.post("/api/clients", async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      
      // Check if client already exists
      const existingClient = await storage.getClientByPhone(clientData.phone);
      if (existingClient) {
        return res.json(existingClient);
      }
      
      const client = await storage.createClient(clientData);
      res.json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao criar cliente" });
      }
    }
  });

  app.get("/api/clients/:phone", async (req, res) => {
    try {
      const client = await storage.getClientByPhone(req.params.phone);
      if (!client) {
        return res.status(404).json({ message: "Cliente não encontrado" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar cliente" });
    }
  });

  // Appointments routes
  app.get("/api/appointments", async (req, res) => {
    try {
      const appointments = await storage.getAppointments();
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar agendamentos" });
    }
  });

  app.get("/api/appointments/date/:date", async (req, res) => {
    try {
      const appointments = await storage.getAppointmentsByDate(req.params.date);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar agendamentos por data" });
    }
  });

  app.get("/api/appointments/available-times/:date/:serviceId", async (req, res) => {
    try {
      const { date, serviceId } = req.params;
      const availableTimes = await storage.getAvailableTimeSlots(date, serviceId);
      res.json(availableTimes);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar horários disponíveis" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao criar agendamento" });
      }
    }
  });

  app.patch("/api/appointments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const appointment = await storage.updateAppointment(id, updateData);
      if (!appointment) {
        return res.status(404).json({ message: "Agendamento não encontrado" });
      }
      
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar agendamento" });
    }
  });

  app.delete("/api/appointments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteAppointment(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Agendamento não encontrado" });
      }
      
      res.json({ message: "Agendamento cancelado com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao cancelar agendamento" });
    }
  });

  // Admin authentication routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const admin = await storage.verifyAdmin(credentials);
      
      if (!admin) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }
      
      req.session.adminId = admin.id;
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      res.json({ message: "Login realizado com sucesso", admin: { id: admin.id, username: admin.username } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        console.error("Login error:", error);
        res.status(500).json({ message: "Erro no login" });
      }
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao terminar sessão" });
      }
      res.json({ message: "Logout realizado com sucesso" });
    });
  });

  app.get("/api/admin/check", (req, res) => {
    if (req.session?.adminId) {
      res.json({ authenticated: true });
    } else {
      res.json({ authenticated: false });
    }
  });

  // Admin services management - Return ALL services for admin (not just active ones)
  app.get("/api/admin/services", requireAuth, async (req, res) => {
    try {
      const services = await storage.getAllServices(); // Get all services including inactive
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar serviços" });
    }
  });

  app.post("/api/admin/services", requireAuth, async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      res.json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao criar serviço" });
      }
    }
  });

  app.patch("/api/admin/services/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const service = await storage.updateService(id, updateData);
      if (!service) {
        return res.status(404).json({ message: "Serviço não encontrado" });
      }
      
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar serviço" });
    }
  });

  app.delete("/api/admin/services/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteService(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Serviço não encontrado" });
      }
      
      res.json({ message: "Serviço eliminado com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao eliminar serviço" });
    }
  });

  // Admin appointments management
  app.get("/api/admin/appointments", requireAuth, async (req, res) => {
    try {
      const appointments = await storage.getAppointments();
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar agendamentos" });
    }
  });

  // Complete appointment
  app.patch("/api/admin/appointments/:id/complete", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const appointment = await storage.updateAppointment(id, { status: "concluido" });
      
      if (appointment) {
        res.json({ message: "Agendamento finalizado com sucesso", appointment });
      } else {
        res.status(404).json({ message: "Agendamento não encontrado" });
      }
    } catch (error) {
      res.status(500).json({ message: "Erro ao finalizar agendamento" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
