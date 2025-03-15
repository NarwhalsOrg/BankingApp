import { pgTable, text, serial, integer, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  address: text("address"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  firstName: true,
  lastName: true,
  email: true,
  password: true,
  phone: true,
  address: true,
});

// Account model
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // checking, savings, credit
  accountNumber: text("account_number").notNull().unique(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAccountSchema = createInsertSchema(accounts).pick({
  userId: true,
  type: true,
  accountNumber: true,
  balance: true,
});

// Transaction model
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  accountId: integer("account_id").notNull().references(() => accounts.id),
  type: text("type").notNull(), // deposit, withdrawal, transfer, payment
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  toAccountId: integer("to_account_id").references(() => accounts.id),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  accountId: true,
  type: true,
  amount: true,
  description: true,
  toAccountId: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

// Validation schemas
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

export const registerSchema = insertUserSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const transferSchema = z.object({
  fromAccountId: z.number(),
  toAccountId: z.number(),
  amount: z.string().min(1).refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Amount must be greater than 0"),
  description: z.string().min(1, "Description is required")
}).refine(data => data.fromAccountId !== data.toAccountId, {
  message: "Source and destination accounts must be different",
  path: ["toAccountId"]
});

export const depositSchema = z.object({
  accountId: z.number(),
  amount: z.string().min(1).refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Amount must be greater than 0"),
  description: z.string().min(1, "Description is required")
});

export const withdrawalSchema = z.object({
  accountId: z.number(),
  amount: z.string().min(1).refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Amount must be greater than 0"),
  description: z.string().min(1, "Description is required")
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  address: z.string().optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password")
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});
