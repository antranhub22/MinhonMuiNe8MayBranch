import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const staff = pgTable('staff', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const request = pgTable('request', {
  id: serial('id').primaryKey(),
  room_number: varchar('room_number', { length: 255 }).notNull(),
  orderId: varchar('order_id', { length: 255 }).notNull(),
  guestName: varchar('guest_name', { length: 255 }).notNull(),
  request_content: text('request_content').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const message = pgTable('message', {
  id: serial('id').primaryKey(),
  requestId: serial('request_id').references(() => request.id).notNull(),
  sender: varchar('sender', { length: 255 }).notNull(),
  content: text('content').notNull(),
  time: timestamp('time').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}); 