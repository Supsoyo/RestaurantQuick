import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Clock, ChefHat, TruckIcon, ArrowLeft } from "lucide-react";
import { type Order, type OrderItem } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface OrderWithItems extends Order {
  items: OrderItem[];
}

const STATUS_STEPS = {
  pending: { progress: 25, icon: Clock, label: "Order Received", description: "Your order has been received and is being reviewed" },
  preparing: { progress: 50, icon: ChefHat, label: "Preparing", description: "Our chefs are preparing your delicious meal" },
  ready: { progress: 75, icon: TruckIcon, label: "Ready for Pickup", description: "Your order is ready to be served" },
  completed: { progress: 100, icon: CheckCircle2, label: "Completed", description: "Enjoy your meal!" },
};

// Mock status progression for development
const STATUS_SEQUENCE = ["pending", "preparing", "ready", "completed"] as const;

export default function OrderStatus() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load order from localStorage
    const orders = JSON.parse(localStorage.getItem("orders") || "{}");
    const currentOrder = orders[orderId];
    setOrder(currentOrder);
    setLoading(false);

    // Simulate status changes every 10 seconds for development
    const interval = setInterval(() => {
      setOrder(prevOrder => {
        if (!prevOrder) return null;

        const currentStatusIndex = STATUS_SEQUENCE.indexOf(prevOrder.status as typeof STATUS_SEQUENCE[number]);
        const nextStatusIndex = (currentStatusIndex + 1) % STATUS_SEQUENCE.length;

        const updatedOrder = {
          ...prevOrder,
          status: STATUS_SEQUENCE[nextStatusIndex]
        };

        // Update in localStorage
        const orders = JSON.parse(localStorage.getItem("orders") || "{}");
        orders[orderId] = updatedOrder;
        localStorage.setItem("orders", JSON.stringify(orders));

        return updatedOrder;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [orderId]);

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
            Order not found
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = STATUS_STEPS[order.status as keyof typeof STATUS_STEPS];
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen p-4 max-w-md mx-auto">
      <header className="mb-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          חזרה
        </Button>
        <h1 className="text-2xl font-bold">הזמנה #{order.id}</h1>
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
          <h2 className="font-medium mb-4">סיכום הזמנה</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{item.quantity}x {item.name}</p>
                    {item.customizations && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {/* Show selected options */}
                        {item.customizations.selectedOptions?.meatType && (
                          <p>סוג בשר: {item.customizations.selectedOptions.meatType}</p>
                        )}
                        {item.customizations.selectedOptions?.bunType && (
                          <p>לחמנייה: {item.customizations.selectedOptions.bunType}</p>
                        )}
                        {item.customizations.selectedOptions?.drink && (
                          <p>שתייה: {item.customizations.selectedOptions.drink}</p>
                        )}
                        {/* Show toppings */}
                        {item.customizations.selectedOptions?.toppings.length > 0 && (
                          <p>תוספות: {item.customizations.selectedOptions.toppings.join(", ")}</p>
                        )}
                        {/* Show excluded ingredients */}
                        {item.customizations.excludeIngredients.length > 0 && (
                          <p>ללא: {item.customizations.excludeIngredients.join(", ")}</p>
                        )}
                        {/* Show special instructions */}
                        {item.customizations.specialInstructions && (
                          <p>הערות: {item.customizations.specialInstructions}</p>
                        )}
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      ₪{Number(item.price).toFixed(2)} ליחידה
                      {item.customizations?.additionalPrice > 0 && (
                        <span className="mr-1">
                          + ₪{item.customizations.additionalPrice.toFixed(2)} תוספות
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="font-medium">
                    ₪{((Number(item.price) + (item.customizations?.additionalPrice || 0)) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>סכום ביניים</span>
                <span>${(Number(order.total) - Number(order.tipAmount || 0)).toFixed(2)}</span>
              </div>
              {order.tipAmount && Number(order.tipAmount) > 0 && (
                <div className="flex justify-between items-center">
                  <span>טיפ</span>
                  <span>${Number(order.tipAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center font-medium">
                <span>סה״כ</span>
                <span>${Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}