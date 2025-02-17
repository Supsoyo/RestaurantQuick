import { MenuItem, Order, OrderItem, Table, PersonalOrder, type InsertMenuItem, type InsertOrder ,type InsertPersonalOrder} from "@shared/schema";

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
  private personalOrders: Map<number, PersonalOrder>;


  constructor() {
    this.menuItems = new Map();
    this.tables = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.currentIds = { menuItem: 1, table: 1, order: 1, orderItem: 1 , personalOrder: 1 };
    this.personalOrders = new Map();

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const samplePersonalOrder: InsertPersonalOrder = {
      tableId: 12,
      customerId: "customer123",
      createdAt: new Date(),
      items: [
        {
          menuItemId: 1,
          quantity: 2,
          price: 59.00,
          customizations: {
            excludeIngredients: ["בצל"],
            specialInstructions: "drink first",
            selectedIngredients: {
              "תוספות": ["אבוקדו", "אבוקדו", "גבינת פטה"],
              "רטבים נוספים": ["מיונז", "פסטו"]
            },
            selectedRadioOptions: {
              "סוג לחם": "חיטה מלאה",
              "רמת חריפות": "בינוני"
            }
          }
        },
        {
          menuItemId: 2,
          quantity: 1,
          price: 72.00,
          customizations: {
            excludeIngredients: [],
            specialInstructions: "extra spicy please",
            selectedIngredients: {
              "תוספות להמבורגר": ["בצל מקורמל", "גבינת צ׳דר"],
              "רטבים": ["ברביקיו", "קטשופ חריף"]
            },
            selectedRadioOptions: {
              "סוג לחם": "לחמניית בריוש",
              "מידת עשייה": "מדיום"
            }
          }
        }
      ]
    };

    // Initialize the sample personal order
    const personalOrderId = this.currentIds.personalOrder++;
    this.personalOrders.set(personalOrderId, {
      ...samplePersonalOrder,
      id: personalOrderId,
      status: 'preparing',
      total: 190.00,
      tipAmount: 20.00
    });

    const sampleMenuItems: InsertMenuItem[] = [
      {
        id: 1,
        name: "כריך המיוחד",
        description: "עגבניה, בצל, חסה, רוטב הבית",
        price: "59.00",
        category: "המיוחדות שלנו",
        imageUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187",
        checkLists: [
          {
            name: "תוספות",
            amount: 3,  
            possibleIngredients: [
              { name: "אבוקדו", price: "2.00", maxAmount: 2 },
              { name: "גבינת פטה", price: "3.00", maxAmount: 2 },
              { name: "פטריות מוקפצות", price: "2.50", maxAmount: 2 }
            ]
          },
          { 
            name: "רטבים נוספים",
            amount: 2, 
            possibleIngredients: [
              { name: "מיונז", price: "0.50", maxAmount: 1 },
              { name: "צ'ילי מתוק", price: "0.50", maxAmount: 1 },
              { name: "פסטו", price: "0.80", maxAmount: 1 }
            ]
          }
        ],
        radioLists: [
          { 
            name: "סוג לחם",
            options: [
              { name: "חיטה מלאה", price: "0.00" },
              { name: "לבן", price: "0.00" },
              { name: "שיפון", price: "1.00" },
              { name: "לחם כפרי", price: "1.50" }
            ] 
          },
          { 
            name: "רמת חריפות",
            options: [
              { name: "עדין", price: "0.00" },
              { name: "בינוני", price: "0.00" },
              { name: "חריף", price: "0.00" }
            ] 
          }
        ]
      },
      {
        id: 2,
        name: "המבורגר קלאסי ארוחה",
        description: "נתחי בקר טרי, חסה, עגבניה ורוטב הבית",
        price: "72.00",
        category: "עיקריות",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
        checkLists: [
          {
            name: "תוספות להמבורגר",
            amount: 2, 
            possibleIngredients: [ 
              { name: "בצל מקורמל", price: "1.00", maxAmount: 1 },
              { name: "בייקון", price: "2.50", maxAmount: 1 },
              { name: "גבינת צ׳דר", price: "2.00", maxAmount: 1 }
            ]
          },
          { 
            name: "רטבים",
            amount: 2, 
            possibleIngredients: [
              { name: "ברביקיו", price: "0.50", maxAmount: 1 },
              { name: "איולי", price: "0.50", maxAmount: 1 },
              { name: "קטשופ חריף", price: "0.60", maxAmount: 1 }
            ]
          }
        ],
        radioLists: [
          { 
            name: "סוג לחם",
            options: [
              { name: "חיטה מלאה", price: "0.00" },
              { name: "לבן", price: "0.00" },
              { name: "שיפון", price: "1.00" },
              { name: "לחמניית בריוש", price: "1.50" }
            ] 
          },
          { 
            name: "מידת עשייה",
            options: [
              { name: "נא", price: "0.00" },
              { name: "מדיום", price: "0.00" },
              { name: "עשוי היטב", price: "0.00" }
            ] 
          }
        ]
      },
      {
        id: 3,
        name: "סושי רול סלמון",
        description: "רול במילוי סלמון, אבוקדו ומלפפון",
        price: "48.00",
        category: "מנות אסייתיות",
        imageUrl: "https://images.unsplash.com/photo-1546069901-eacef0df6022",
        checkLists: [
          {
            name: "תוספות לרול",
            amount: 2, 
            possibleIngredients: [
              { name: "שומשום שחור", price: "0.50", maxAmount: 1 },
              { name: "ג׳ינג׳ר כבוש", price: "0.50", maxAmount: 1 },
              { name: "אבוקדו נוסף", price: "1.00", maxAmount: 1 }
            ]
          },
          { 
            name: "רטבים לצד הסושי",
            amount: 2, 
            possibleIngredients: [
              { name: "סויה", price: "0.00", maxAmount: 1 },
              { name: "טריאקי", price: "0.50", maxAmount: 1 },
              { name: "ווסאבי", price: "0.30", maxAmount: 1 }
            ]
          }
        ],
        radioLists: [
          { 
            name: "סוג רול",
            options: [
              { name: "מאקי", price: "0.00" },
              { name: "אינסייד אאוט", price: "0.50" }
            ] 
          },
          { 
            name: "טמפרטורת הגשה",
            options: [
              { name: "קר", price: "0.00" },
              { name: "בטמפורה", price: "1.50" }
            ] 
          }
        ]
      },
      
        {
          id: 4,
          name: "המבורגר קלאסי",
          description: "נתחי בקר טרי, חסה, עגבניה ורוטב הבית",
          price: "59.00",
          category: "עיקריות",
          imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
          checkLists: [
            {
              name: "תוספות להמבורגר",
              amount: 2,
              possibleIngredients: [
                { name: "בצל מקורמל", price: "1.00", maxAmount: 1 },
                { name: "גבינת צ'דר", price: "2.00", maxAmount: 1 },
                { name: "בייקון", price: "2.50", maxAmount: 1 }
              ]
            }
          ],
          radioLists: [
            { 
              name: "סוג לחם",
              options: [
                { name: "לחמניית בריוש", price: "1.50" },
                { name: "חיטה מלאה", price: "0.00" },
                { name: "שיפון", price: "1.00" }
              ] 
            },
            {
              name: "מידת עשייה",
              options: [
                { name: "נא", price: "0.00" },
                { name: "מדיום", price: "0.00" },
                { name: "עשוי היטב", price: "0.00" }
              ]
            }
          ]
        },
        {
          id: 5,
          name: "סלט קפרזה",
          description: "עגבניות שרי, מוצרלה טרייה, בזיליקום ושמן זית",
          price: "42.00",
          category: "ראשונות",
          imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
          checkLists: [
            {
              name: "תוספות לסלט",
              amount: 2,
              possibleIngredients: [
                { name: "אגוזי מלך", price: "0.70", maxAmount: 2 },
                { name: "קרוטונים", price: "0.50", maxAmount: 2 },
                { name: "זיתי קלמטה", price: "0.60", maxAmount: 2 }
              ]
            }
          ],
          radioLists: [
            {
              name: "תיבול מועדף",
              options: [
                { name: "שמן זית ולימון", price: "0.00" },
                { name: "בלסמי מצומצם", price: "0.50" },
                { name: "שמן זית ופסטו", price: "0.70" }
              ]
            },
            {
              name: "תוספת לחם לצד הסלט",
              options: [
                { name: "פוקצ'ה טרייה", price: "5.00" },
                { name: "לחם כפרי", price: "3.00" },
                { name: "קרקר כוסמין", price: "2.50" }
              ]
            }
          ]
        },
        {
          id: 6,
          name: "פיצה מרגריטה",
          description: "בצק דק עם רוטב עגבניות וגבינת מוצרלה",
          price: "58.00",
          category: "עיקריות",
          imageUrl: "https://images.unsplash.com/photo-1594007654729-407eedc4be80",
          checkLists: [
            {
              name: "תוספות לפיצה",
              amount: 3,
              possibleIngredients: [
                { name: "פטריות שמפיניון", price: "0.80", maxAmount: 2 },
                { name: "זיתים שחורים", price: "0.60", maxAmount: 2 },
                { name: "תירס", price: "0.50", maxAmount: 2 },
                { name: "ארטישוק", price: "1.20", maxAmount: 2 }
              ]
            }
          ],
          radioLists: [
            {
              name: "סוג בצק",
              options: [
                { name: "בצק דק קלאסי", price: "0.00" },
                { name: "בצק עבה בסגנון אמריקאי", price: "1.50" },
                { name: "בצק כוסמין", price: "2.00" }
              ]
            },
            {
              name: "תוספת גבינה",
              options: [
                { name: "פרמזן", price: "1.00" },
                { name: "גבינת מוצרלה נוספת", price: "2.00" },
                { name: "גבינה טבעונית", price: "2.50" }
              ]
            }
          ]
        },
        
        {
          id: 7,
          name: "מרק עדשים",
          description: "מרק עדשים כתומות עם ירקות שורש",
          price: "28.00",
          category: "ראשונות",
          imageUrl: "https://images.unsplash.com/photo-1607478900762-9b5c27581fda",
          checkLists: [
            {
              name: "תוספות",
              amount: 2,
              possibleIngredients: [
                { name: "שמן זית", price: "0.30", maxAmount: 3 },
                { name: "קרוטונים", price: "0.40", maxAmount: 3 },
                { name: "עשבי תיבול טריים", price: "0.20", maxAmount: 2 }
              ]
            }
          ],
          radioLists: [
            {
              name: "דרגת חריפות",
              options: [
                { name: "ללא חריפות", price: "0.00" },
                { name: "פיקנטי קל", price: "0.20" },
                { name: "חריף", price: "0.40" }
              ]
            }
          ]
        },
        {
          id: 8,
          name: "סלמון אפוי",
          description: "פילה סלמון בתנור עם רוטב לימון ושום",
          price: "89.00",
          category: "עיקריות",
          imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947",
          checkLists: [
            {
              name: "תוספות ירק",
              amount: 2,
              possibleIngredients: [
                { name: "אספרגוס", price: "1.20", maxAmount: 5 },
                { name: "תרד מוקפץ", price: "1.00", maxAmount: 5 },
                { name: "ברוקולי מאודה", price: "1.30", maxAmount: 5 }
              ]
            }
          ],
          radioLists: [
            {
              name: "דרגת עשייה",
              options: [
                { name: "נא קל", price: "0.00" },
                { name: "מדיום", price: "0.00" },
                { name: "עשוי היטב", price: "0.00" }
              ]
            },
            {
              name: "רטבים נלווים",
              options: [
                { name: "רוטב שמנת לימון", price: "1.50" },
                { name: "רוטב חמאת שום", price: "1.20" },
                { name: "רוטב טריאקי", price: "1.00" }
              ]
            }
          ]
        },
        {
          id: 9,
          name: "שוקולד פאדג׳",
          description: "עוגת פאדג' חמה עם כדור גלידת וניל",
          price: "39.00",
          category: "קינוחים",
          imageUrl: "https://images.unsplash.com/photo-1599785209707-19d68f9c4dd5",
          checkLists: [
            {
              name: "תוספות",
              amount: 2,
              possibleIngredients: [
                { name: "אגוזי לוז", price: "0.60", maxAmount: 5 },
                { name: "רוטב קרמל", price: "0.50", maxAmount: 3 },
                { name: "שברי שוקולד לבן", price: "0.70", maxAmount: 3 }
              ]
            }
          ],
          radioLists: [
            {
              name: "סוג גלידה",
              options: [
                { name: "וניל קלאסי", price: "0.00" },
                { name: "שוקולד מריר", price: "0.50" },
                { name: "גלידת אגוזים", price: "0.70" }
              ]
            },
            {
              name: "תוספת קצפת",
              options: [
                { name: "ללא", price: "0.00" },
                { name: "קצפת רגילה", price: "0.30" },
                { name: "קצפת בטעם קרמל", price: "0.50" }
              ]
            }
          ]
        }
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
  async createPersonalOrder(order: InsertPersonalOrder): Promise<PersonalOrder> {
    const id = this.currentIds.personalOrder++; // Increment order ID
    const personalOrder: PersonalOrder = {
      id,
      tableId: order.tableId,
      customerId: order.customerId,
      items: order.items,
      createdAt: new Date(),
    };

    this.personalOrders.set(id, personalOrder);
    return personalOrder;
  }
  async getPersonalOrders(id: number): Promise<PersonalOrder | undefined> {
    return this.personalOrders.get(id);
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