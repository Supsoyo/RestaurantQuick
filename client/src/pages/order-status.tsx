import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Clock, ChefHat, TruckIcon, ArrowLeft } from "lucide-react";
import { type MenuItem } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface OrderItem {
  menuItemId: number;
  quantity: number;
  price: number;
  checkLists?: {
    name: string;
    amount: number;
    possibleIngredients: Array<{
      name: string;
      price: string;
      maxAmount: number;
    }>;
  }[];
  radioLists?: {
    name: string;
    options: Array<{
      name: string;
      price: string;
    }>;
  }[];
  customizations: {
    excludeIngredients: string[];
    specialInstructions: string;
    selectedIngredients: Record<string, string[]>;
    selectedRadioOptions: Record<string, string>;
  };
}

interface PersonalOrder {
  tableId: number;
  customerId: string;
  items: OrderItem[];
  status?: 'pending' | 'preparing' | 'ready' | 'completed';
  total?: number;
  tipAmount?: number;
  createdAt?: string;
}

const STATUS_STEPS = {
  pending: { progress: 25, icon: Clock, label: "הזמנה התקבלה", description: "ההזמנה שלך התקבלה ונמצאת בבדיקה" },
  preparing: { progress: 50, icon: ChefHat, label: "בהכנה", description: "השפים שלנו מכינים את הארוחה הטעימה שלך" },
  ready: { progress: 75, icon: TruckIcon, label: "מוכן להגשה", description: "ההזמנה שלך מוכנה להגשה" },
  completed: { progress: 100, icon: CheckCircle2, label: "הושלם", description: "בתיאבון!" },
};

const STATUS_SEQUENCE = ["pending", "preparing", "ready", "completed"] as const;

export default function OrderStatus() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<PersonalOrder | null>(null);
  const [menuItems, setMenuItems] = useState<Record<number, MenuItem>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load order from localStorage
    const personalOrders = JSON.parse(localStorage.getItem("personalOrders") || "{}");
    const currentOrder = personalOrders[orderId];

    // Load menu items for reference
    const storedMenuItems = JSON.parse(localStorage.getItem("menuItems") || "[]");
    const menuItemsMap = storedMenuItems.reduce((acc: Record<number, MenuItem>, item: MenuItem) => {
      acc[item.id] = item;
      return acc;
    }, {});

    setMenuItems(menuItemsMap);
    setOrder(currentOrder);
    setLoading(false);

    // Simulate status changes every 10 seconds for development
    const interval = setInterval(() => {
      setOrder(prevOrder => {
        if (!prevOrder) return null;

        const currentStatusIndex = STATUS_SEQUENCE.indexOf(prevOrder.status as typeof STATUS_SEQUENCE[number] || 'pending');
        const nextStatusIndex = (currentStatusIndex + 1) % STATUS_SEQUENCE.length;

        const updatedOrder = {
          ...prevOrder,
          status: STATUS_SEQUENCE[nextStatusIndex]
        };

        // Update in localStorage
        const orders = JSON.parse(localStorage.getItem("personalOrders") || "{}");
        orders[orderId] = updatedOrder;
        localStorage.setItem("personalOrders", JSON.stringify(orders));

        return updatedOrder;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [orderId]);

  const calculateItemPrice = (item: OrderItem) => {
    let additionalCost = 0;
    const menuItem = menuItems[item.menuItemId];
    if (!menuItem) return 0;

    // Calculate additional cost from selected ingredients
    Object.entries(item.customizations.selectedIngredients).forEach(([checklistName, selectedIngredients]) => {
      const checklist = menuItem.checkLists.find(c => c.name === checklistName);
      if (checklist) {
        // Count occurrences of each ingredient
        const ingredientCounts: Record<string, number> = {};
        selectedIngredients.forEach(ing => {
          ingredientCounts[ing] = (ingredientCounts[ing] || 0) + 1;
        });

        // Calculate cost based on counts
        Object.entries(ingredientCounts).forEach(([ingredientName, count]) => {
          const ingredient = checklist.possibleIngredients.find(i => i.name === ingredientName);
          if (ingredient) {
            additionalCost += Number(ingredient.price) * count;
          }
        });
      }
    });

    // Calculate additional cost from radio selections
    Object.entries(item.customizations.selectedRadioOptions).forEach(([radioListName, selectedOption]) => {
      const radioList = menuItem.radioLists.find(r => r.name === radioListName);
      if (radioList) {
        const option = radioList.options.find(o => o.name === selectedOption);
        if (option) {
          additionalCost += Number(option.price);
        }
      }
    });

    return (Number(menuItem.price) + additionalCost) * item.quantity;
  };

  if (loading) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-2 bg-muted rounded"></div>
              <div className="h-2 bg-muted rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            הזמנה לא נמצאה
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = STATUS_STEPS[order.status || 'pending'];
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen p-4 max-w-md mx-auto" dir="rtl">
      <header className="mb-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          חזרה
        </Button>
        <h1 className="text-2xl font-bold">הזמנה שולחן {order.tableId}</h1>
      </header>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-2 rounded-full bg-primary/10">
              <StatusIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-medium">{status.label}</h2>
              <p className="text-sm text-muted-foreground">{status.description}</p>
            </div>
          </div>

          <Progress value={status.progress} className="mb-4" />

          <div className="grid grid-cols-4 gap-2 text-center text-sm">
            {Object.entries(STATUS_STEPS).map(([key, value]) => (
              <div
                key={key}
                className={`${order.status === key ? 'text-primary font-medium' : 'text-muted-foreground'}`}
              >
                <value.icon className="h-4 w-4 mx-auto mb-1" />
                {value.label}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="font-medium mb-4">פרטי ההזמנה</h2>
          <div className="space-y-4">
            {order.items.map((item, index) => {
              const menuItem = menuItems[item.menuItemId];
              if (!menuItem) return null;

              return (
                <div key={index} className="flex items-start gap-4">
                  <img
                    src={menuItem.imageUrl}
                    alt={menuItem.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{menuItem.name}</h3>
                    {item.customizations?.excludeIngredients.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        ללא: {item.customizations.excludeIngredients.join(", ")}
                      </p>
                    )}
                    {Object.entries(item.customizations?.selectedIngredients || {}).map(([name, ingredients]) => {
                      if (ingredients.length === 0) return null;

                      // Count occurrences of each ingredient
                      const ingredientCounts: Record<string, number> = {};
                      ingredients.forEach(ing => {
                        ingredientCounts[ing] = (ingredientCounts[ing] || 0) + 1;
                      });

                      // Format the display string
                      const displayString = Object.entries(ingredientCounts)
                        .map(([ing, count]) => `${ing} (${count})`)
                        .join(", ");

                      return (
                        <p key={name} className="text-sm text-muted-foreground">
                          {name}: {displayString}
                        </p>
                      );
                    })}
                    {Object.entries(item.customizations?.selectedRadioOptions || {}).map(([name, option]) => (
                      <p key={name} className="text-sm text-muted-foreground">
                        {name}: {option}
                      </p>
                    ))}
                    {item.customizations?.specialInstructions && (
                      <p className="text-sm text-muted-foreground">
                        הערה: {item.customizations.specialInstructions}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      כמות: {item.quantity}
                    </p>
                    <p className="font-medium mt-1">
                      ₪{calculateItemPrice(item).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>סכום ביניים</span>
                <span>
                  ₪{order.items.reduce((sum, item) => sum + calculateItemPrice(item), 0).toFixed(2)}
                </span>
              </div>
              {order.tipAmount && Number(order.tipAmount) > 0 && (
                <div className="flex justify-between items-center">
                  <span>טיפ</span>
                  <span>₪{Number(order.tipAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center font-medium">
                <span>סה״כ</span>
                <span>
                  ₪{(
                    order.items.reduce((sum, item) => sum + calculateItemPrice(item), 0) +
                    (Number(order.tipAmount) || 0)
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}