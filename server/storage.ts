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
        name: "כריך המיוחד",
        description: "עגבניה, בצל, חסה, רוטב הבית",
        price: "59.00",
        category: "המיוחדות שלנו",
        imageUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187",
        checkLists: [
          { possibleIngredients: ["עגבנייה", "בצל", "חסה", "רוטב הבית"], name: "תוספות" },
          { possibleIngredients: ["לחם", "פיתה", "באגט"], name: "סוג לחם" },
        ],
      },
      {
        name: "המבורגר קלאסי ארוחה",
        description: "נתחי בקר טרי, חסה, עגבניה ורוטב הבית",
        price: "59.00",
        category: "ראשונות",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
        checkLists: [
          { possibleIngredients: ["עגבנייה", "בצל", "חסה", "לוטוס"], name: "תוספות" },
          { possibleIngredients: ["בקבוק מים", "שתייה מוגזת", "מיץ טבעי"], name: "משקה" },
        ],
      },
      {
        name: "המבורגר קלאסי",
        description: "נתחי בקר טרי, חסה, עגבניה ורוטב הבית",
        price: "59.00",
        category: "ראשונות",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
        checkLists: [ ],
      },
      {
        name: "סלט ירקות",
        description: "ירקות טריים, שמן זית וחומץ בלסמי",
        price: "45.00",
        category: "ראשונות",
        imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
        checkLists: [
          { possibleIngredients: ["חסה", "עגבנייה", "קולורבי", "גזר"], name: "תוספות ירק" },
          { possibleIngredients: ["שמן זית", "חומץ בלסמי", "לימון", "תיבול"], name: "רוטב" },
        ],
      },
      {
        name: "פסטה ברוטב עגבניות",
        description: "פסטה טרייה ברוטב עגבניות ביתי",
        price: "52.00",
        category: "עיקריות",
        imageUrl: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601",
        checkLists: [
          { possibleIngredients: ["פסטה", "רוטב עגבניות", "שום", "חול", "בזיליקום"], name: "הוספות" },
          { possibleIngredients: ["גבינת פרמזן", "מוצרלה", "ריקוטה"], name: "הגשה" },
        ],
      },
      {
        name: "טירמיסו",
        description: "קינוח איטלקי קלאסי",
        price: "32.00",
        category: "קינוחים",
        imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9",
        checkLists: [
          { possibleIngredients: ["קקאו", "מסקרפונה", "שוקולד מריר"], name: "עיטור" },
          { possibleIngredients: ["קפוצ'ינו", "קפה נמס", "מים"], name: "רוטב קפה" },
        ],
      },
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