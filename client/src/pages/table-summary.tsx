import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import PaymentForm from "@/components/payment-form";
import { type Order, type OrderItem } from "@shared/schema";
import { ArrowLeft } from "lucide-react";

interface OrderWithCustomer extends Order {
  customerName: string;
  items: OrderItem[];
}

export default function TableSummary() {
  const { tableId } = useParams();
  const [, setLocation] = useLocation();
  const [showPayment, setShowPayment] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(0);

  // Get all orders for this table from localStorage
  const orders = Object.values(JSON.parse(localStorage.getItem("orders") || "{}"))
    .filter((order: OrderWithCustomer) => order.tableId === Number(tableId));

  // Group orders by customer
  const ordersByCustomer = orders.reduce((acc: { [key: string]: OrderWithCustomer[] }, order: OrderWithCustomer) => {
    const customerName = order.customerName || "אורח";
    if (!acc[customerName]) {
      acc[customerName] = [];
    }
    acc[customerName].push(order);
    return acc;
  }, {});

  // Calculate totals
  const customerTotals = Object.entries(ordersByCustomer).reduce(
    (acc: { [key: string]: number }, [customer, orders]) => {
      acc[customer] = orders.reduce((sum, order) => sum + Number(order.total), 0);
      return acc;
    },
    {}
  );

  const tableTotal = Object.values(customerTotals).reduce((sum, total) => sum + total, 0);

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
        <h1 className="text-2xl font-bold">סיכום ההזמנות של השולחן</h1>
      </header>

      {Object.entries(ordersByCustomer).map(([customerName, customerOrders]) => (
        <div key={customerName} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            הזמנות של {customerName}
          </h2>
          {customerOrders.map((order) => (
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
                        <p className="font-medium">{item.quantity}x {item.name}</p>
                        {item.customizations?.excludeIngredients?.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            ללא: {item.customizations.excludeIngredients.join(", ")}
                          </p>
                        )}
                        {item.customizations?.specialInstructions && (
                          <p className="text-sm text-muted-foreground">
                            הערות: {item.customizations.specialInstructions}
                          </p>
                        )}
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
                <Separator className="my-4" />
                <div className="flex justify-between items-center font-medium">
                  <span>סה״כ להזמנה</span>
                  <span>₪{Number(order.total).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex justify-between items-center font-semibold">
                <span>סה״כ ל{customerName}</span>
                <span>₪{customerTotals[customerName].toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}

      <Card className="mt-6">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span>סה״כ השולחן</span>
            <span>₪{tableTotal.toFixed(2)}</span>
          </div>
          <Separator className="my-4" />

          {showPayment ? (
            <PaymentForm amount={selectedAmount || tableTotal} onSuccess={handlePaymentSuccess} />
          ) : (
            <div className="space-y-4">
              <Button
                className="w-full"
                onClick={() => {
                  setSelectedAmount(tableTotal);
                  setShowPayment(true);
                }}
              >
                שלם את כל החשבון (₪{tableTotal.toFixed(2)})
              </Button>
              {Object.entries(ordersByCustomer).map(([customerName, orders]) => (
                <Button
                  key={customerName}
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedAmount(customerTotals[customerName]);
                    setShowPayment(true);
                  }}
                >
                  שלם עבור {customerName} (₪{customerTotals[customerName].toFixed(2)})
                </Button>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSelectedAmount(0);
                  setShowPayment(true);
                }}
              >
                שלם סכום מותאם אישית
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}