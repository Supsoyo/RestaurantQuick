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
          { name: "תוספות", amount: 3, possibleIngredients: [
              { name: "אבוקדו", price: "2.00", maxAmount: 2 },
              { name: "גבינת פטה", price: "3.00", maxAmount: 2 }
            ]
          },
          { name: "רטבים נוספים", amount: 4, possibleIngredients: [
              { name: "מיונז", price: "0.50", maxAmount: 1 },
              { name: "צ'ילי מתוק", price: "0.50", maxAmount: 1 }
            ]
          }
        ],
        radioLists: [
          { name: "סוג לחם", options: ["חיטה מלאה", "לבן", "שיפון"] },
          { name: "אופן ההכנה", options: ["רגיל", "קלוי", "חם"] }
        ]
      },
      {
        name: "המבורגר קלאסי ארוחה",
        description: "נתחי בקר טרי, חסה, עגבניה ורוטב הבית",
        price: "59.00",
        category: "ראשונות",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
        checkLists: [
          { name: "תוספות להמבורגר",amount: 4, possibleIngredients: [
              { name: "בצל מקורמל", price: "1.00", maxAmount: 1 },
              { name: "בייקון", price: "2.50", maxAmount: 1 }
            ]
          },
          { name: "רטבים",amount: 7, possibleIngredients: [
              { name: "ברביקיו", price: "0.50", maxAmount: 1 },
              { name: "איולי", price: "0.50", maxAmount: 1 }
            ]
          }
        ],
        radioLists: [
          { name: "גודל המנה", options: ["בינוני", "גדול", "ענק"] },
          { name: "דרגת עשייה", options: ["נא", "מדיום", "וול-דאן"] }
        ]
      },
      {
        name: "המבורגר קלאסי",
        description: "נתחי בקר טרי, חסה, עגבניה ורוטב הבית",
        price: "59.00",
        category: "ראשונות",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
        checkLists: [],
        radioLists: [
          { options: ["לחמנייה רגילה", "לחמנייה ללא גלוטן", "לחמנייה מתוקה"], name: "סוג לחמנייה" },

        ],
      },
      {
        name: "סלט ירקות",
        description: "ירקות טריים, שמן זית וחומץ בלסמי",
        price: "45.00",
        category: "ראשונות",
        imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
        checkLists: [
          { amount: 3,
            possibleIngredients: [
              {
                name: "קקאו",
                price: "0.50",
                maxAmount: 10,
              },
              {
                name: "קקאו",
                price: "0.50",
                maxAmount: 10,
              },
              {
                name: "קקאו",
                price: "0.50",
                maxAmount: 10,
              },
                                 ]
           , name: "עיטור" 
          },
          { amount: 2,
            possibleIngredients: [
              {
                name: "קקאו",
                price: "0.50",
                maxAmount: 10,
              },
              {
                name: "קקאו",
                price: "0.50",
                maxAmount: 10,
              },
              {
                name: "קקאו",
                price: "0.50",
                maxAmount: 10,
              },
                                 ]
           , name: "עיטור" 
          },
        ],
        radioLists: [
          { options: ["חסה בלבד", "מיקס ירוקים", "ללא חסה"], name: "סוג ירקות" },
          { options: ["קוביות", "רצועות דקות", "פרוסות עבות"], name: "סגנון חיתוך" },
          { options: ["רגיל", "מתובל", "פיקנטי"], name: "תיבול ההמבורגר" },
        ],
      },
      {
        name: "פסטה ברוטב עגבניות",
        description: "פסטה טרייה ברוטב עגבניות ביתי",
        price: "52.00",
        category: "עיקריות",
        imageUrl: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601",
        checkLists: [
          { amount: 4,
            possibleIngredients: [
              {
                name: "קקאו",
                price: "0.50",
                maxAmount: 10,
              },
              {
                name: "קקאו",
                price: "0.50",
                maxAmount: 10,
              },
              {
                name: "קקאו",
                price: "0.50",
                maxAmount: 10,
              },
                                 ]
           , name: "עיטור" 
          },
          { amount: 6,
            possibleIngredients: [
              {
                name: "קקאו",
                price: "0.50",
                maxAmount: 10,
              },
              {
                name: "קקאו",
                price: "0.50",
                maxAmount: 10,
              },
              {
                name: "קקאו",
                price: "0.50",
                maxAmount: 10,
              },
                                 ]
           , name: "עיטור" 
          },
        ],
        radioLists: [
          { options: ["פנה", "ספגטי", "פטוצ'יני"], name: "סוג פסטה" },
          { options: ["שמנת", "רוטב עגבניות", "שמן זית"], name: "בסיס הרוטב" },
        ],
      },
      {
        name: "טירמיסו",
        description: "קינוח איטלקי קלאסי",
        price: "32.00",
        category: "קינוחים",
        imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9",
        checkLists: [
          { amount: 5,
            possibleIngredients: [
              {
                name: "קקאו",
                price: "0.50",
                maxAmount: 10,
              },
              {
                name: "קקאו",
                price: "0.50",
                maxAmount: 10,
              },
              {
                name: "קקאו",
                price: "0.50",
                maxAmount: 10,
              },
                                 ]
           , name: "עיטור" 
          },
          { amount: 2,
            possibleIngredients: [
              {
                name: "קקאו",
                price: "0.50",
                maxAmount: 10,
              },
              {
                name: "קקאו",
                price: "0.50",
                maxAmount: 10,
              },
              {
                name: "קקאו",
                price: "0.50",
                maxAmount: 10,
              },
                                 ]
           , name: "עיטור" 
          },
        ],
        radioLists: [
          { options: ["חם", "קר"], name: "טמפרטורת ההגשה" },
          { options: ["רגיל", "ללא סוכר"], name: "מתיקות" },
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