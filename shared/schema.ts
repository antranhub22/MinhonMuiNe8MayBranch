import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const transcripts = pgTable("transcripts", {
  id: serial("id").primaryKey(),
  callId: text("call_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertTranscriptSchema = createInsertSchema(transcripts).pick({
  callId: true,
  role: true,
  content: true,
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  callId: text("call_id").notNull(),
  roomNumber: text("room_number").notNull(),
  orderType: text("order_type").notNull(),
  deliveryTime: text("delivery_time").notNull(),
  specialInstructions: text("special_instructions"),
  items: jsonb("items").notNull(),
  totalAmount: integer("total_amount").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const callSummaries = pgTable("call_summaries", {
  id: serial("id").primaryKey(),
  callId: text("call_id").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  roomNumber: text("room_number"),
  duration: text("duration"),
});

export const insertCallSummarySchema = createInsertSchema(callSummaries).pick({
  callId: true,
  content: true,
  timestamp: true,
  roomNumber: true,
  duration: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  callId: true,
  roomNumber: true,
  orderType: true,
  deliveryTime: true,
  specialInstructions: true,
  items: true,
  totalAmount: true,
});

// Define relations between tables
export const transcriptsRelations = relations(transcripts, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  transcripts: many(transcripts),
}));

// Staff Request Schema
export const staffRequests = pgTable('staff_requests', {
  id: serial('id').primaryKey(),
  callId: text('call_id').notNull(),
  roomNumber: text('room_number').notNull(),
  guestName: text('guest_name'),
  orderId: text('order_id'),
  content: text('content').notNull(),
  status: text('status').notNull().default('New'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Staff Message Schema
export const staffMessages = pgTable('staff_messages', {
  id: serial('id').primaryKey(),
  requestId: integer('request_id').references(() => staffRequests.id).notNull(),
  sender: text('sender').notNull(), // 'staff' or 'system'
  content: text('content').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTranscript = z.infer<typeof insertTranscriptSchema>;
export type Transcript = typeof transcripts.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertCallSummary = z.infer<typeof insertCallSummarySchema>;
export type CallSummary = typeof callSummaries.$inferSelect;

// Types
export type StaffRequest = typeof staffRequests.$inferSelect;
export type InsertStaffRequest = typeof staffRequests.$inferInsert;
export type StaffMessage = typeof staffMessages.$inferSelect;
export type InsertStaffMessage = typeof staffMessages.$inferInsert;
