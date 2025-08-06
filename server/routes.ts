import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClientSchema, insertAppointmentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);
  return httpServer;
}
