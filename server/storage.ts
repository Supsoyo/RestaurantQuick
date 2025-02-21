import { MenuItem, Order, OrderItem, Table, TableOrder, Feedback, Restaurant,
  type InsertMenuItem, type InsertOrder, type InsertTableOrder, type InsertFeedback, type InsertRestaurant } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { menuItems, orders, orderItems, tables, tableOrders, feedback, restaurants } from "@shared/schema";

export interface IStorage {
  // Restaurants
  getRestaurants(): Promise<Restaurant[]>;
  getRestaurant(id: number): Promise<Restaurant | undefined>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;

  // Menu Items
  getMenuItems(restaurantId: number): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;

  // Tables
  getTables(restaurantId: number): Promise<Table[]>;
  getTable(id: number): Promise<Table | undefined>;

  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  updateOrderStatus(id: number, status: Order["status"]): Promise<Order>;

  // Table Orders
  createTableOrder(tableOrder: InsertTableOrder): Promise<TableOrder>;
  getTableOrder(id: number): Promise<TableOrder | undefined>;
  getTableOrdersByTableId(tableId: number): Promise<TableOrder[]>;
  updateTableOrder(id: number, updates: Partial<TableOrder>): Promise<TableOrder>;
  deleteTableOrder(id: number): Promise<void>;

  // Feedback
  createFeedback(feedbackData: InsertFeedback): Promise<Feedback>;
  getFeedbackByRestaurantId(restaurantId: number): Promise<Feedback[]>;
}

export class DatabaseStorage implements IStorage {
  async getRestaurants(): Promise<Restaurant[]> {
    return await db.select().from(restaurants);
  }

  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, id));
    return restaurant;
  }

  async createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant> {
    const [created] = await db.insert(restaurants).values(restaurant).returning();
    return created;
  }

  async getMenuItems(restaurantId: number): Promise<MenuItem[]> {
    return await db.select().from(menuItems).where(eq(menuItems.restaurantId, restaurantId));
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return item;
  }

  async getTables(restaurantId: number): Promise<Table[]> {
    return await db.select().from(tables).where(eq(tables.restaurantId, restaurantId));
  }

  async getTable(id: number): Promise<Table | undefined> {
    const [table] = await db.select().from(tables).where(eq(tables.id, id));
    return table;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders)
      .values({
        tableId: insertOrder.tableId,
        restaurantId: insertOrder.restaurantId,
        status: "pending",
        total: insertOrder.total,
      })
      .returning();

    await db.insert(orderItems)
      .values(insertOrder.items.map(item => ({
        orderId: order.id,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: item.price.toString(),
      })));

    return order;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async updateOrderStatus(id: number, status: Order["status"]): Promise<Order> {
    const [order] = await db.update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  async createTableOrder(tableOrder: InsertTableOrder): Promise<TableOrder> {
    const [created] = await db.insert(tableOrders)
      .values(tableOrder)
      .returning();
    return created;
  }

  async getTableOrder(id: number): Promise<TableOrder | undefined> {
    const [order] = await db.select().from(tableOrders).where(eq(tableOrders.id, id));
    return order;
  }

  async getTableOrdersByTableId(tableId: number): Promise<TableOrder[]> {
    return await db.select().from(tableOrders).where(eq(tableOrders.tableId, tableId));
  }

  async updateTableOrder(id: number, updates: Partial<TableOrder>): Promise<TableOrder> {
    const [updated] = await db.update(tableOrders)
      .set(updates)
      .where(eq(tableOrders.id, id))
      .returning();
    return updated;
  }

  async deleteTableOrder(id: number): Promise<void> {
    await db.delete(tableOrders)
      .where(eq(tableOrders.id, id));
  }

  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const [created] = await db.insert(feedback)
      .values(feedbackData)
      .returning();
    return created;
  }

  async getFeedbackByRestaurantId(restaurantId: number): Promise<Feedback[]> {
    return await db.select().from(feedback).where(eq(feedback.restaurantId, restaurantId));
  }
}

export const storage = new DatabaseStorage();

export const samplePersonalOrders = [
  {
    orderNumber: "001",
    price: "25.50",
    nameOfCustomer: "John Doe",
    cartItems: [
      { itemId: "burger", quantity: 2, specialInstructions: "No pickles" },
      { itemId: "fries", quantity: 1 }
    ]
  },
  {
    orderNumber: "002",
    price: "15.00",
    nameOfCustomer: "Jane Smith",
    cartItems: [
      { itemId: "salad", quantity: 1, specialInstructions: "Dressing on side" }
    ]
  }
];