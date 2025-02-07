import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { type Order, type OrderItem } from "@shared/schema";
import { ArrowLeft } from "lucide-react";

interface OrderWithItems extends Order {
  items: OrderItem[];
  tip?: number;
  finalTotal?: number;
  isPaid?: boolean;
}

const TIP_PERCENTAGES = [10, 15, 20];

export default function Payment() {
  const { orderId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get order from localStorage
  const orders = JSON.parse(localStorage.getItem("orders") || "{}");
  const order: OrderWithItems | undefined = orderId ? orders[orderId] : undefined;

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

  const subtotal = Number(order.total);
  const tipAmount = selectedTip ? (subtotal * (selectedTip / 100)) : 0;
  const total = subtotal + tipAmount;

  const handlePayment = () => {
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      // Update order status in localStorage
      if (orderId) {
        const orders = JSON.parse(localStorage.getItem("orders") || "{}");
        orders[orderId] = {
          ...order,
          isPaid: true,
          tip: tipAmount,
          finalTotal: total,
        };
        localStorage.setItem("orders", JSON.stringify(orders));

        // Show success message
        toast({
          title: "Payment Successful!",
          description: "Thank you for your order.",
        });

        // Redirect back to order status
        setLocation(`/order/${orderId}`);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen p-4 max-w-md mx-auto">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => setLocation(`/order/${orderId}`)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Order
      </Button>

      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="font-medium mb-4">Add a Tip</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {TIP_PERCENTAGES.map((percentage) => (
              <Button
                key={percentage}
                variant={selectedTip === percentage ? "default" : "outline"}
                onClick={() => setSelectedTip(percentage)}
                className="w-full"
              >
                {percentage}%
              </Button>
            ))}
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Tip ({selectedTip || 0}%)</span>
              <span>${tipAmount.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center font-medium">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <Button
            className="w-full"
            onClick={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : `Pay $${total.toFixed(2)}`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}