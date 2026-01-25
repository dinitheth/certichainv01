import { pgTable, serial, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const institutionRegistrations = pgTable("institution_registrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  website: text("website").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  walletAddress: varchar("wallet_address", { length: 42 }).notNull().unique(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});

export const insertInstitutionRegistrationSchema = createInsertSchema(institutionRegistrations).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
  status: true,
});

export type InstitutionRegistration = typeof institutionRegistrations.$inferSelect;
export type InsertInstitutionRegistration = z.infer<typeof insertInstitutionRegistrationSchema>;