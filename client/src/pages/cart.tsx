import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { type MenuItem } from "@shared/schema";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import CallWaiterButton from "@/components/call-waiter-button";
import PaymentForm from "@/components/payment-form";

interface CartItem extends MenuItem {
  quantity: {
    quantity: number;
    customizations?: {
      excludeIngredients: string[];
      specialInstructions: string;
    };
  };
}

export default function Cart() {
  const { tableId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPayment, setShowPayment] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(0);

  // Get current customer's name
  const customerName = localStorage.getItem("customerName") || "לקוח";

  // Get all orders for the table
  const allOrders = JSON.parse(localStorage.getItem("orders") || "{}");
  const tableOrders = Object.values(allOrders).filter(
    (order: any) => order.tableId === Number(tableId)
  );

  // Get current cart items
  const cartItems = JSON.parse(localStorage.getItem("cart") || "[]") as CartItem[];

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) {
      const newItems = cartItems.filter((_, i) => i !== index);
      setItems(newItems);
      localStorage.setItem("cart", JSON.stringify(newItems));
      return;
    }

    const newItems = cartItems.map((item, i) =>
      i === index ? { ...item, quantity: { ...item.quantity, quantity: newQuantity } } : item
    );
    localStorage.setItem("cart", JSON.stringify(newItems));
  };

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity.quantity,
    0
  );

  const ordersTotal = tableOrders.reduce(
    (sum: number, order: any) => sum + Number(order.total),
    0
  );

  const handlePaymentSuccess = async (paymentIntent: any) => {
    setIsPlacingOrder(true);

    try {
      // Create order from current cart
      if (cartItems.length > 0) {
        const newOrder = {
          id: Math.floor(Math.random() * 1000) + 1,
          tableId: Number(tableId),
          status: "pending",
          total: cartTotal,
          customerName,
          items: cartItems.map((item) => ({
            id: Math.floor(Math.random() * 1000) + 1,
            orderId: 0,
            menuItemId: item.id,
            quantity: item.quantity.quantity,
            price: Number(item.price),
            customizations: item.quantity.customizations,
          })),
          createdAt: new Date().toISOString(),
        };

        // Add to orders in localStorage
        allOrders[newOrder.id] = newOrder;
        localStorage.setItem("orders", JSON.stringify(allOrders));

        // Clear cart
        localStorage.removeItem("cart");
      }

      // Show success message
      toast({
        title: "התשלום בוצע בהצלחה!",
        description: `שולם: ₪${selectedAmount.toFixed(2)}`,
      });

      // Reset state
      setShowPayment(false);
      setSelectedAmount(0);
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בביצוע התשלום.",
        variant: "destructive",
      });
    }
    setIsPlacingOrder(false);
  };

  const setItems = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem("cart", JSON.stringify(newItems));
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
        <h1 className="text-2xl font-bold">ההזמנות בשולחן</h1>
      </header>

      {/* Current Cart Section */}
      {cartItems.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">ההזמנה שלי ({customerName})</h2>
          <div className="space-y-4">
            {cartItems.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      {item.quantity.customizations?.excludeIngredients.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          ללא: {item.quantity.customizations.excludeIngredients.join(", ")}
                        </p>
                      )}
                      {item.quantity.customizations?.specialInstructions && (
                        <p className="text-xs text-muted-foreground">
                          הערה: {item.quantity.customizations.specialInstructions}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        ₪{Number(item.price).toFixed(2)} ליחידה
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(index, item.quantity.quantity - 1)}
                        >
                          {item.quantity.quantity === 1 ? (
                            <Trash2 className="h-4 w-4" />
                          ) : (
                            <Minus className="h-4 w-4" />
                          )}
                        </Button>
                        <span className="w-8 text-center">{item.quantity.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(index, item.quantity.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ₪{(Number(item.price) * item.quantity.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Previous Orders Section */}
      {tableOrders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">הזמנות קודמות בשולחן</h2>
          {tableOrders.map((order: any) => (
            <Card key={order.id} className="mb-4">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">
                    הזמנה #{order.id} - {order.customerName || "לקוח"}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="space-y-4">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {item.quantity}x {item.name}
                        </p>
                        {item.customizations?.excludeIngredients?.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            ללא: {item.customizations.excludeIngredients.join(", ")}
                          </p>
                        )}
                        {item.customizations?.specialInstructions && (
                          <p className="text-xs text-muted-foreground">
                            הערה: {item.customizations.specialInstructions}
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Payment Section */}
      {(cartItems.length > 0 || tableOrders.length > 0) && (
        <Card className="mt-6">
          <CardContent className="p-4">
            {cartItems.length > 0 && (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span>סכום ההזמנה הנוכחית</span>
                  <span>₪{cartTotal.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
              </>
            )}
            <div className="flex justify-between items-center mb-2">
              <span>סה״כ הזמנות קודמות</span>
              <span>₪{ordersTotal.toFixed(2)}</span>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between items-center font-medium mb-4">
              <span>סה״כ לתשלום</span>
              <span>₪{(cartTotal + ordersTotal).toFixed(2)}</span>
            </div>

            {showPayment ? (
              <PaymentForm 
                amount={selectedAmount} 
                onSuccess={handlePaymentSuccess} 
              />
            ) : (
              <div className="space-y-4">
                <Button
                  className="w-full"
                  onClick={() => {
                    setSelectedAmount(cartTotal + ordersTotal);
                    setShowPayment(true);
                  }}
                  disabled={isPlacingOrder}
                >
                  שלם את כל החשבון (₪{(cartTotal + ordersTotal).toFixed(2)})
                </Button>
                {cartTotal > 0 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedAmount(cartTotal);
                      setShowPayment(true);
                    }}
                    disabled={isPlacingOrder}
                  >
                    שלם רק את ההזמנה הנוכחית (₪{cartTotal.toFixed(2)})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tableId && <CallWaiterButton tableId={tableId} />}
    </div>
  );
}