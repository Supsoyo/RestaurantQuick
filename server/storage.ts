import { MenuItem, Order, OrderItem, Table, type InsertMenuItem, type InsertOrder } from "@shared/schema";

export interface IStorage {
  // Menu Items
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  
  // Tables
  getTable(id: number): Promise<Table | undefined>;
  
  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  updateOrderStatus(id: number, status: Order["status"]): Promise<Order>;
}

export class MemStorage implements IStorage {
  private menuItems: Map<number, MenuItem>;
  private tables: Map<number, Table>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem[]>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.menuItems = new Map();
    this.tables = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.currentIds = { menuItem: 1, table: 1, order: 1, orderItem: 1 };

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleMenuItems: InsertMenuItem[] = [
      {
        name: "Classic Burger",
        description: "Juicy beef patty with lettuce, tomato, and special sauce",
        price: "12.99",
        category: "Mains",
        imageUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187",
      },
      {
        name: "Caesar Salad",
        description: "Crispy romaine lettuce with parmesan and croutons",
        price: "9.99",
        category: "Starters",
        imageUrl: "https://images.unsplash.com/photo-1494390248081-4e521a5940db",
      },
      // Add more sample items...
    ];

    sampleMenuItems.forEach((item) => {
      const id = this.currentIds.menuItem++;
      this.menuItems.set(id, { ...item, id });
    });

    // Create some sample tables
    for (let i = 1; i <= 10; i++) {
      const id = this.currentIds.table++;
      this.tables.set(id, { id, number: i });
    }
  }

  async getMenuItems(): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values());
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }

  async getTable(id: number): Promise<Table | undefined> {
    return this.tables.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentIds.order++;
    const order: Order = {
      id,
      tableId: insertOrder.tableId,
      status: "pending",
      total: insertOrder.total,
      createdAt: new Date(),
    };
    
    this.orders.set(id, order);
    
    const orderItems: OrderItem[] = insertOrder.items.map((item) => ({
      id: this.currentIds.orderItem++,
      orderId: id,
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      price: item.price,
    }));
    
    this.orderItems.set(id, orderItems);
    return order;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return this.orderItems.get(orderId) || [];
  }

  async updateOrderStatus(id: number, status: Order["status"]): Promise<Order> {
    const order = this.orders.get(id);
    if (!order) throw new Error("Order not found");
    
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
}

export const storage = new MemStorage();
