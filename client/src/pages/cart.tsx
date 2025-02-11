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
  quantity: number;
}

export default function Cart() {
  const { tableId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPayment, setShowPayment] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [items, setItems] = useState<CartItem[]>(() =>
    JSON.parse(localStorage.getItem("cart") || "[]")
  );

  const handlePaymentSuccess = async (paymentIntent: any) => {
    
    setIsPlacingOrder(true);

    try {
      
      // Calculate total
      const total = items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity?.quantity,
        0
      );

      // Create the order with the successful payment
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tableId: Number(tableId),
          total: total.toString(),
          items: items.map((item) => ({
            menuItemId: item.id,
            quantity: item.quantity?.quantity,
            price: Number(item.price),
          })),
          paymentIntentId: paymentIntent.id,
        }),
      });

      const order = await response.json();
      
      order.id = Math.floor(Math.random() * 1000) + 1

      // Create mock order
      const mockOrder = {
        id: order.id,
        tableId: Number(tableId),
        status: "pending",
        total,
        items: items.map((item) => ({
          id: Math.floor(Math.random() * 1000) + 1,
          orderId: 0,
          menuItemId: item.id,
          quantity: item.quantity?.quantity,
          price: Number(item.price),
        })),
        createdAt: new Date().toISOString(),
      };

      // Store mock order in localStorage
      const orders = JSON.parse(localStorage.getItem("orders") || "{}");
      orders[mockOrder.id] = mockOrder;
      localStorage.setItem("orders", JSON.stringify(orders));


      // if (!response.ok) throw new Error(order.message);

      // Clear cart
      localStorage.removeItem("cart");

      // Show success message
      toast({
        title: "Order Placed!",
        description: `Your order #${order.id} has been placed successfully.`,
      });

      // Redirect to order status page
      setLocation(`/order/${order.id.toString()}`);
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Error",
        description: "There was an error placing your order.",
        variant: "destructive",
      });
      setIsPlacingOrder(false);
    }
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    console.log("newQuantity: ", newQuantity);
    if (newQuantity < 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      localStorage.setItem("cart", JSON.stringify(newItems));
      return;
    }

    const newItems = items.map((item, i) =>
      i === index ? { ...item, quantity: {quantity: newQuantity} } : item
    );
    setItems(newItems);
    localStorage.setItem("cart", JSON.stringify(newItems));
  };

  const total = items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity?.quantity,
    0
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
          Back to Menu
        </Button>
        <h1 className="text-2xl font-bold">Your Order</h1>
      </header>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Your cart is empty
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
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
                    <p className="text-sm text-muted-foreground">
                      ${Number(item.price).toFixed(2)} each
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(index, item.quantity?.quantity - 1)}
                      >
                        {item.quantity?.quantity === 1 ? (
                          <Trash2 className="h-4 w-4" />
                        ) : (
                          <Minus className="h-4 w-4" />
                        )}
                      </Button>
                      <span className="w-8 text-center">{item.quantity?.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(index, item.quantity?.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${(Number(item.price) * item.quantity?.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between items-center font-medium mb-4">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              {showPayment ? (
                <PaymentForm amount={total} onSuccess={handlePaymentSuccess} />
              ) : (
                <Button
                  className="w-full"
                  onClick={() => setShowPayment(true)}
                  disabled={isPlacingOrder}
                >
                  Proceed to Payment
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      {tableId && <CallWaiterButton tableId={tableId} />}
    </div>
  );
}