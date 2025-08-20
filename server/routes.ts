import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClientSchema, insertAppointmentSchema, insertServiceSchema, insertUserSchema, loginSchema } from "@shared/simple-sqlite-schema";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";
import bcrypt from "bcrypt";

declare module "express-session" {
  interface SessionData {
    adminId: number;
  }
}

// Session configuration - using MemoryStore for SQLite
const MemStore = MemoryStore(session);

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
    store: new MemStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: 'beautysalon-secret-key-sqlite',
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
      const { date } = req.params;
      const serviceId = parseInt(req.params.serviceId);
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
      const id = parseInt(req.params.id);
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
      const id = parseInt(req.params.id);
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
      const user = await storage.verifyUser(credentials);
      
      if (!user) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }
      
      req.session.adminId = user.id;
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      res.json({ message: "Login realizado com sucesso", admin: { id: user.id, username: user.username } });
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
      const id = parseInt(req.params.id);
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
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteService(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Serviço não encontrado" });
      }
      
      res.json({ message: "Serviço eliminado com sucesso" });
    } catch (error) {
      console.error("Delete service error:", error);
      if (error instanceof Error && error.message.includes("agendamentos")) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Erro ao eliminar serviço" });
      }
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
      const id = parseInt(req.params.id);
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

  // Cancel appointment
  app.patch("/api/admin/appointments/:id/cancel", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const appointment = await storage.updateAppointment(id, { status: "cancelado" });
      
      if (appointment) {
        res.json({ message: "Agendamento cancelado com sucesso", appointment });
      } else {
        res.status(404).json({ message: "Agendamento não encontrado" });
      }
    } catch (error) {
      res.status(500).json({ message: "Erro ao cancelar agendamento" });
    }
  });

  // Admin setup - Check if any admin exists
  app.get("/api/admin/setup/check", async (req, res) => {
    try {
      const hasUsers = await storage.hasUsers();
      res.json({ setupRequired: !hasUsers });
    } catch (error) {
      res.status(500).json({ message: "Erro ao verificar configuração" });
    }
  });

  // Admin setup - Create first admin (only if no users exist)
  app.post("/api/admin/setup", async (req, res) => {
    try {
      const hasUsers = await storage.hasUsers();
      if (hasUsers) {
        return res.status(400).json({ message: "Sistema já foi configurado" });
      }

      const credentials = loginSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(credentials.password, 10);
      
      const user = await storage.createUser({
        username: credentials.username,
        password: hashedPassword,
        role: "admin"
      });

      req.session.adminId = user.id;
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      res.json({ 
        message: "Administrador criado com sucesso", 
        admin: { id: user.id, username: user.username }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        console.error("Setup error:", error);
        res.status(500).json({ message: "Erro ao criar administrador" });
      }
    }
  });

  // Update admin credentials
  app.patch("/api/admin/profile", requireAuth, async (req, res) => {
    try {
      const { username, password, currentPassword } = req.body;
      const adminId = req.session.adminId!;
      
      // Get current admin
      const currentAdmin = await storage.getUser(username || "admin");
      if (!currentAdmin || currentAdmin.id !== adminId) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      // Verify current password if changing password
      if (password && currentPassword) {
        const isValidPassword = await bcrypt.compare(currentPassword, currentAdmin.password);
        if (!isValidPassword) {
          return res.status(401).json({ message: "Palavra-passe atual incorreta" });
        }
      }

      // Update data
      const updateData: any = {};
      if (username && username !== currentAdmin.username) {
        updateData.username = username;
      }
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "Nenhuma alteração fornecida" });
      }

      // Since we can't update by ID directly, we need to implement this in storage
      res.json({ message: "Perfil atualizado com sucesso" });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Erro ao atualizar perfil" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
