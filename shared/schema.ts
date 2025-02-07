import { pgTable, text, serial, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
});

export const tables = pgTable("tables", {
  id: serial("id").primaryKey(),
  number: integer("number").notNull().unique(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  tableId: integer("table_id").notNull(),
  status: text("status", { enum: ["pending", "preparing", "ready", "completed"] }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  menuItemId: integer("menu_item_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

export const insertMenuItemSchema = createInsertSchema(menuItems).pick({
  name: true,
  description: true,
  price: true,
  category: true,
  imageUrl: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  tableId: true,
  total: true,
}).extend({
  items: z.array(z.object({
    menuItemId: z.number(),
    quantity: z.number().min(1),
    price: z.number(),
  }))
});

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type Table = typeof tables.$inferSelect;
