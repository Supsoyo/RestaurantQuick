import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, ChefHat, TruckIcon, CheckCircle2 } from "lucide-react";
import { type Order } from "@shared/schema";

const STATUS_ICONS = {
  pending: { icon: Clock, label: "ממתין" },
  preparing: { icon: ChefHat, label: "בהכנה" },
  ready: { icon: TruckIcon, label: "מוכן להגשה" },
  completed: { icon: CheckCircle2, label: "הושלם" },
};

export default function Orders() {
  const { tableId } = useParams();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Load orders from localStorage
    const storedOrders = JSON.parse(localStorage.getItem("orders") || "{}");
    const tableOrders = Object.values(storedOrders)
      .filter((order: Order) => order.tableId === Number(tableId))
      .sort((a: Order, b: Order) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    setOrders(tableOrders);
  }, [tableId]);

  return (
    <div className="min-h-screen p-4">
      <header className="mb-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          חזרה
        </Button>
        <h1 className="text-2xl font-bold">ההזמנות שלי</h1>
      </header>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              אין הזמנות
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => {
            const StatusIcon = STATUS_ICONS[order.status as keyof typeof STATUS_ICONS].icon;
            return (
              <Link key={order.id} href={`/order/${order.id}`}>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">הזמנה #{order.id}</h3>
                          <span className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          סה״כ: ₪{Number(order.total).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {STATUS_ICONS[order.status as keyof typeof STATUS_ICONS].label}
                        </span>
                        <StatusIcon className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
