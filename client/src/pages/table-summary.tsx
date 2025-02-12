import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import PaymentForm from "@/components/payment-form";
import { type Order, type OrderItem } from "@shared/schema";
import { ArrowLeft } from "lucide-react";

export default function TableSummary() {
  const { tableId } = useParams();
  const [, setLocation] = useLocation();
  const [showPayment, setShowPayment] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(0);

  // Get all orders for this table from localStorage
  const orders = Object.values(JSON.parse(localStorage.getItem("orders") || "{}"))
    .filter((order: Order) => order.tableId === Number(tableId));

  const total = orders.reduce((sum, order: Order) => sum + Number(order.total), 0);

  const handlePaymentSuccess = async (paymentIntent: any) => {
    // Here you would typically update the orders' payment status
    // For now, we'll just show a success message and redirect
    setLocation(`/menu/${tableId}`);
  };

  return (
    <div className="min-h-screen p-4" dir="rtl">
      <header className="mb-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => setLocation(`/menu/${tableId}`)}
        >
          <ArrowLeft className="h-4 w-4 ml-2" />
          חזרה לתפריט
        </Button>
        <h1 className="text-2xl font-bold">סיכום ההזמנה של השולחן:</h1>
      </header>

      {orders.map((order: Order & { items: OrderItem[] }) => (
        <Card key={order.id} className="mb-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">הזמנה #{order.id}</h3>
              <span className="text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.quantity}x [שם המנה]</p>
                    <p className="text-sm text-muted-foreground">
                      ₪{Number(item.price).toFixed(2)} ליחידה
                    </p>
                  </div>
                  <p className="font-medium">
                    ₪{(Number(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="mt-6">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span>סכום ביניים</span>
            <span>₪{total.toFixed(2)}</span>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between items-center font-medium mb-4">
            <span>סך הכל</span>
            <span>₪{total.toFixed(2)}</span>
          </div>

          {showPayment ? (
            <PaymentForm amount={selectedAmount || total} onSuccess={handlePaymentSuccess} />
          ) : (
            <div className="space-y-4">
              <Button
                className="w-full"
                onClick={() => {
                  setSelectedAmount(total);
                  setShowPayment(true);
                }}
              >
                שלם את כל החשבון (₪{total.toFixed(2)})
              </Button>
              {orders.map((order: Order) => (
                <Button
                  key={order.id}
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedAmount(Number(order.total));
                    setShowPayment(true);
                  }}
                >
                  שלם הזמנה #{order.id} (₪{Number(order.total).toFixed(2)})
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
