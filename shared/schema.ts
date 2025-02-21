import { pgTable, text, serial, integer, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  imageUrl: text("image_url").notNull(),
  openingHours: jsonb("opening_hours").notNull(),
  categories: text("categories").array().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  checkLists: jsonb("check_lists").notNull(),
  radioLists: jsonb("radio_lists").notNull(),
});

export const tables = pgTable("tables", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  number: integer("number").notNull(),
});

export const tablesRelations = relations(tables, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [tables.restaurantId],
    references: [restaurants.id],
  }),
}));

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  tableId: integer("table_id").notNull(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
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

export const tableOrders = pgTable("table_orders", {
  id: serial("id").primaryKey(),
  tableId: integer("table_id").notNull(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  orderDetails: jsonb("order_details").$type<{
    orderees: string[];
    personalOrders: Array<{
      ordererName: string;
      cartItems: Array<{
        id: number;
        name: string;
        price: string;
        imageUrl: string;
        quantity: number;
        customizations: {
          excludeIngredients: string[];
          specialInstructions: string;
          selectedIngredients: Record<string, string[]>;
          selectedRadioOptions: Record<string, string>;
        };
      }>;
      price: string;
    }>;
  }>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  tableId: integer("table_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRestaurantSchema = createInsertSchema(restaurants).pick({
  name: true,
  description: true,
  address: true,
  imageUrl: true,
  openingHours: true,
  categories: true,
});

export const insertTableOrderSchema = createInsertSchema(tableOrders).pick({
  tableId: true,
  restaurantId: true,
  orderDetails: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).pick({
  restaurantId: true,
  tableId: true,
  rating: true,
  comment: true,
});

const ingredientsSchema = z.object({
  name: z.string(),
  price: z.string(),
  maxAmount: z.number(),
});

const optIngredientsSchema = z.object({
  name: z.string(),
  price: z.string(),
});

const checklistSchema = z.object({
  name: z.string(),
  amount: z.number(),
});

export const customChecklistSchema = checklistSchema.extend({
  possibleIngredients: z.array(ingredientsSchema).min(1),
});

const radiolistSchema = z.object({
  name: z.string(),
  options: z.array(optIngredientsSchema).min(1),
});

export const insertMenuItemSchema = createInsertSchema(menuItems).pick({
  restaurantId: true,
  name: true,
  description: true,
  price: true,
  category: true,
  imageUrl: true,
});

export const customInsertMenuItemSchema = insertMenuItemSchema.extend({
  checkLists: z.array(customChecklistSchema).min(1),
  radioLists: z.array(radiolistSchema).min(1),
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  tableId: true,
  restaurantId: true,
  total: true,
}).extend({
  items: z.array(z.object({
    menuItemId: z.number(),
    quantity: z.number().min(1),
    price: z.number(),
  }))
});

export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof customInsertMenuItemSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type Table = typeof tables.$inferSelect;
export type TableOrder = typeof tableOrders.$inferSelect;
export type InsertTableOrder = z.infer<typeof customInsertTableOrderSchema>;
export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

export const personalOrderSchema = z.object({
  ordererName: z.string(),
  cartItems: z.array(z.object({
    id: z.number(),
    name: z.string(),
    price: z.string(),
    imageUrl: z.string(),
    quantity: z.number(),
    customizations: z.object({
      excludeIngredients: z.array(z.string()),
      specialInstructions: z.string(),
      selectedIngredients: z.record(z.string(), z.array(z.string())),
      selectedRadioOptions: z.record(z.string(), z.string()),
    }),
  })),
  price: z.string(),
});

export const tableOrderDetailsSchema = z.object({
  orderees: z.array(z.string()),
  personalOrders: z.array(personalOrderSchema),
});

export const customInsertTableOrderSchema = insertTableOrderSchema.extend({
  orderDetails: tableOrderDetailsSchema,
});

export type PersonalOrder = z.infer<typeof personalOrderSchema>;
export type TableOrderDetails = z.infer<typeof tableOrderDetailsSchema>;