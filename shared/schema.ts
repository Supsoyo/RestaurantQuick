import { pgTable, text, serial, integer, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Customization Types
export const pricedOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  price: z.number(),
});

export const itemCustomizationOptionsSchema = z.object({
  meatTypes: z.array(pricedOptionSchema).optional(),
  bunTypes: z.array(pricedOptionSchema).optional(),
  drinks: z.array(pricedOptionSchema).optional(),
  toppings: z.array(pricedOptionSchema).optional(),
  allowsExcludeIngredients: z.boolean().optional(),
  allowsSpecialInstructions: z.boolean().optional(),
});

export type PricedOption = z.infer<typeof pricedOptionSchema>;
export type ItemCustomizationOptions = z.infer<typeof itemCustomizationOptionsSchema>;

// Selected Customization Types
export const selectedOptionsSchema = z.object({
  meatType: z.string().optional(),
  bunType: z.string().optional(),
  drink: z.string().optional(),
  toppings: z.array(z.string()).default([]),
});

export const customizationsSchema = z.object({
  selectedOptions: selectedOptionsSchema,
  excludeIngredients: z.array(z.string()).default([]),
  specialInstructions: z.string().default(""),
  additionalPrice: z.number().default(0),
});

export type SelectedOptions = z.infer<typeof selectedOptionsSchema>;
export type Customizations = z.infer<typeof customizationsSchema>;

// Database Tables
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  customizationOptions: jsonb("customization_options").notNull().$type<ItemCustomizationOptions>(),
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
  customizations: jsonb("customizations").$type<Customizations>(),
});

// Insert Schemas
export const insertMenuItemSchema = createInsertSchema(menuItems).extend({
  customizationOptions: itemCustomizationOptionsSchema,
});

export const insertOrderItemSchema = z.object({
  menuItemId: z.number(),
  quantity: z.number().min(1),
  price: z.number(),
  customizations: customizationsSchema.optional(),
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  tableId: true,
  total: true,
}).extend({
  items: z.array(insertOrderItemSchema)
});

// Types
export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type Table = typeof tables.$inferSelect;