import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // in cents
  duration: integer("duration").notNull(), // in minutes
  isActive: boolean("is_active").notNull().default(true),
});

export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  serviceId: varchar("service_id").notNull().references(() => services.id),
  date: text("date").notNull(), // YYYY-MM-DD format
  time: text("time").notNull(), // HH:MM format
  status: text("status").notNull().default("agendado"), // agendado, confirmado, em_andamento, concluido, cancelado
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const admin = pgTable("admin", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // hashed password
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
}).extend({
  price: z.number().min(0.01, "O preço deve ser maior que €0,01"),
  duration: z.number().min(1, "A duração deve ser maior que 0 minutos"),
});

export const insertClientSchema = createInsertSchema(clients, {
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string()
    .min(13, "Telefone deve ter formato completo: +351 9XX XXX XXX")
    .max(17, "Telefone muito longo")
    .regex(/^\+351\s9\d{2}\s\d{3}\s\d{3}$/, "Formato inválido. Use: +351 9XX XXX XXX"),
}).omit({
  id: true,
  createdAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

export const insertAdminSchema = createInsertSchema(admin).omit({
  id: true,
  createdAt: true,
});

export const loginSchema = z.object({
  username: z.string().min(3, "Nome de utilizador deve ter pelo menos 3 caracteres"),
  password: z.string().min(6, "Palavra-passe deve ter pelo menos 6 caracteres"),
});

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Admin = typeof admin.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;

// Extended types for API responses
export type AppointmentWithDetails = Appointment & {
  client: Client;
  service: Service;
};
