import { useParams, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { type Order } from "@shared/schema";

export default function TableOrders() {
  const { tableId } = useParams();
  const [, setLocation] = useLocation();

  // Get all orders for this table from localStorage
  const orders = Object.values(JSON.parse(localStorage.getItem("orders") || "{}"))
    .filter((order: Order) => order.tableId === Number(tableId))
    .sort((a: Order, b: Order) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  return (
    <div className="min-h-screen p-4">
      <header className="mb-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => setLocation(`/menu/${tableId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          חזרה לתפריט
        </Button>
        <h1 className="text-2xl font-bold">ההזמנות שלך</h1>
      </header>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            אין הזמנות קודמות
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order: Order) => (
            <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setLocation(`/order/${order.id}`)}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">הזמנה #{order.id}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm font-medium mt-1">
                      סטטוס: {
                        order.status === "pending" ? "בהמתנה" :
                        order.status === "preparing" ? "בהכנה" :
                        order.status === "ready" ? "מוכן להגשה" :
                        "הושלם"
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₪{Number(order.total).toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
