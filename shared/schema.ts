import { pgTable, text, serial, integer, decimal, timestamp ,jsonb} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  checkLists: jsonb("check_lists").notNull(), // Use jsonb to store structured data
  radioLists: jsonb("radio_lists").notNull(), // Use jsonb to store structured data
  
  
  
});
// Personal Orders: Each customer's order
export const personalOrders = pgTable("personal_orders", {
  id: serial("id").primaryKey(),
  tableId: integer("table_id").notNull().references(() => tables.id),
  customerId: text("customer_id").notNull(), // Could be session-based
  items: jsonb("items").notNull(), // Store menu items and customizations
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Table Orders: Aggregated orders from all customers
export const tableOrders = pgTable("table_orders", {
  id: serial("id").primaryKey(),
  tableId: integer("table_id").notNull().references(() => tables.id),
  items: jsonb("items").notNull(), // Aggregate of all personal orders
  status: text("status", { enum: ["pending", "preparing", "ready", "completed"] }).default("pending"),
  total: decimal("total", { precision: 10, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

// Define the structure for the checklist objects
const ingredientsSchema = z.object({
  name: z.string(), // Name of the checklist (e.g., "תוספות")
  price: z.string(),
  maxAmount: z.number(),
});


// Define the structure for the checklist objects  
const optIngredientsSchema = z.object({
  name: z.string(), // Name of the checklist (e.g., "תוספות")
  price: z.string(),
});
// Define the structure for the checklist objects
const checklistSchema = z.object({
  name: z.string(), // Name of the checklist (e.g., "תוספות")
  amount: z.number(),
  // possibleIngredients: z.array(z.string()).min(1), // List of ingredients for this checklist (e.g., ["עגבנייה", "בצל", "חסה"])
});
// Create a custom schema that includes `checkLists` as an array of checklist objects
export const customChecklistSchema = checklistSchema.extend({
    possibleIngredients: z.array(ingredientsSchema).min(1), // Custom 
});

// Define the structure for the checklist objects
const radiolistSchema = z.object({
  name: z.string(), // Name of the checklist (e.g., "תוספות")
    options: z.array(optIngredientsSchema).min(1), // List of ingredients for this checklist (e.g., ["עגבנייה", "בצל", "חסה"])
});
// Define the structure for the checklist objects
const selectedRadiolistSchema = z.object({
  name: z.string(), // Name of the checklist (e.g., "תוספות")
    options: optIngredientsSchema, // List of ingredients for this checklist (e.g., ["עגבנייה", "בצל", "חסה"])
});


export const insertMenuItemSchema = createInsertSchema(menuItems).pick({
  id: true,
  name: true,
  description: true,
  price: true,
  category: true,
  imageUrl: true,
});

// Create a custom schema that includes `checkLists` as an array of checklist objects
export const customInsertMenuItemSchema = insertMenuItemSchema.extend({
  checkLists: z.array(customChecklistSchema).min(1), // Custom validation for `checkLists` as an array of checklist objects
  radioLists: z.array(radiolistSchema).min(1), // Custom validation for `checkLists` as an array of checklist objects
  
});
// Personal Order Schema
export const personalOrderSchema = z.object({
  tableId: z.number().min(1),
  customerId: z.string().min(1),
  items: z.array(z.object({
    menuItemId: z.number().min(1),
    quantity: z.number().min(1),
    price: z.number().min(0),
    checkLists: z.array(customChecklistSchema).optional(),
    radioLists: z.array(selectedRadiolistSchema).optional(),
  })),
});

// Table Order Schema (aggregate of personal orders)
export const tableOrderSchema = z.object({
  tableId: z.number().min(1),
  items: z.array(z.object({
    customerId: z.string(),
    items: personalOrderSchema.shape.items,
  })),
  total: z.number().min(0),
  status: z.enum(["pending", "preparing", "ready", "completed"]),
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


// You can now use this custom schema for your menu item creation
export type InsertMenuItem = z.infer<typeof customInsertMenuItemSchema>;

export type MenuItem = typeof menuItems.$inferSelect;
// export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type Table = typeof tables.$inferSelect;
export type PersonalOrder = typeof personalOrders.$inferSelect;
export type TableOrder = typeof tableOrders.$inferSelect;
export type InsertPersonalOrder = z.infer<typeof personalOrderSchema>;
export type InsertTableOrder = z.infer<typeof tableOrderSchema>;
