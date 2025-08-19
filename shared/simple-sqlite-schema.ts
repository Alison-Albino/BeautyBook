import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Schema SQLite simplificado sem UUID
export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // em cêntimos
  duration: integer("duration").notNull(), // em minutos
  isActive: integer("is_active", { mode: 'boolean' }).notNull().default(true),
});

export const clients = sqliteTable("clients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const appointments = sqliteTable("appointments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clientId: integer("client_id").notNull().references(() => clients.id),
  serviceId: integer("service_id").notNull().references(() => services.id),
  date: text("date").notNull(), // YYYY-MM-DD format
  time: text("time").notNull(), // HH:MM format
  status: text("status").notNull().default("agendado"), // agendado, confirmado, em_andamento, concluido, cancelado
  notes: text("notes"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // hashed password
  role: text("role").notNull().default("admin"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Schemas de validação
export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
}).extend({
  price: z.number().min(0.01, "O preço deve ser maior que €0,01"),
  duration: z.number().min(1, "A duração deve ser maior que 0 minutos"),
});

export const insertClientSchema = createInsertSchema(clients, {
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string()
    .min(10, "Telefone deve incluir código do país")
    .max(25, "Telefone muito longo")
    .refine((phone) => {
      // Portugal: +351 9XX XXX XXX
      if (phone.startsWith('+351')) {
        return /^\+351\s9\d{2}\s\d{3}\s\d{3}$/.test(phone);
      }
      // Brasil: +55 (XX) 9XXXX-XXXX ou +55 (XX) XXXXX-XXXX
      if (phone.startsWith('+55')) {
        return /^\+55\s\(\d{2}\)\s\d{4,5}-\d{4}$/.test(phone);
      }
      // EUA: +1 (XXX) XXX-XXXX
      if (phone.startsWith('+1')) {
        return /^\+1\s\(\d{3}\)\s\d{3}-\d{4}$/.test(phone);
      }
      // Outros países: formato básico
      return /^\+\d{1,4}\s[\d\s-()]{6,15}$/.test(phone);
    }, "Formato de telefone inválido para o país selecionado"),
}).omit({
  id: true,
  createdAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;