import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { type Order, type OrderItem } from "@shared/schema";

interface OrderWithItems extends Order {
  items: OrderItem[];
}

const STATUS_STEPS = {
  pending: 25,
  preparing: 50,
  ready: 75,
  completed: 100,
};

export default function OrderStatus() {
  const { orderId } = useParams();

  const { data: order, isLoading } = useQuery<OrderWithItems>({
    queryKey: [`/api/orders/${orderId}`],
    refetchInterval: 10000, // Polling every 10 seconds
  });

  if (isLoading) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6">
            Loading order status...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6">
            Order not found
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Order #{order.id}</h1>

      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="font-medium mb-4">Order Status</h2>
          <Progress value={STATUS_STEPS[order.status]} className="mb-4" />
          <p className="text-center capitalize font-medium text-primary">
            {order.status}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="font-medium mb-4">Order Summary</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.quantity}x Menu Item</p>
                  <p className="text-sm text-muted-foreground">
                    ${Number(item.price).toFixed(2)} each
                  </p>
                </div>
                <p className="font-medium">
                  ${(Number(item.price) * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center font-medium">
                <span>Total</span>
                <span>${Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
