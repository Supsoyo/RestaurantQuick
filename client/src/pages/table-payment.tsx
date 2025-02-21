import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import PaymentForm from "@/components/payment-form";
import { useQuery } from "@tanstack/react-query";

interface TableOrder {
  id: number;
  tableId: number;
  orderDetails: {
    orderees: string[];
    personalOrders: Array<{
      ordererName: string;
      cartItems: any[];
      price: string;
    }>;
  };
  createdAt: string;
}

export default function TablePayment() {
  const { tableId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<Record<string, boolean>>({});

  // Fetch table orders from the database
  const { data: tableOrders = [], isLoading } = useQuery({
    queryKey: ['/api/table-orders', tableId],
    queryFn: async () => {
      const response = await fetch(`/api/table-orders/${tableId}`);
      if (!response.ok) throw new Error('Failed to fetch table orders');
      return response.json();
    },
  });

  useEffect(() => {
    if (tableOrders[0]?.orderDetails?.personalOrders) {
      const initialSelection: Record<string, boolean> = {};
      tableOrders[0].orderDetails.personalOrders.forEach((order: any) => {
        initialSelection[order.ordererName] = false;
      });
      setSelectedOrders(initialSelection);
    }
  }, [tableOrders]);

  const handleOrderSelection = (ordererName: string) => {
    setSelectedOrders(prev => ({
      ...prev,
      [ordererName]: !prev[ordererName]
    }));
  };

  const calculateSelectedTotal = () => {
    if (!tableOrders[0]) return 0;
    return tableOrders[0].orderDetails.personalOrders
      .filter(order => selectedOrders[order.ordererName])
      .reduce((sum, order) => sum + Number(order.price), 0);
  };

  const handlePaymentSuccess = async (paymentIntent: any) => {
    setIsProcessingPayment(true);
    try {
      // Update the table order in the database
      const updatedPersonalOrders = tableOrders[0].orderDetails.personalOrders.filter(
        (order: any) => !selectedOrders[order.ordererName]
      );

      if (updatedPersonalOrders.length === 0) {
        // Delete the table order if all items are paid
        await fetch(`/api/table-orders/${tableOrders[0].id}`, {
          method: 'DELETE'
        });
      } else {
        // Update the table order with remaining items
        await fetch(`/api/table-orders/${tableOrders[0].id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderDetails: {
              ...tableOrders[0].orderDetails,
              personalOrders: updatedPersonalOrders
            }
          })
        });
      }

      const selectedTotal = calculateSelectedTotal();
      setLocation(`/payment-success/${tableId}?amount=${selectedTotal}`);
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בביצוע התשלום.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4" dir="rtl">
        <header className="mb-6">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            חזרה
          </Button>
          <h1 className="text-2xl font-bold">תשלום שולחן</h1>
        </header>
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

  if (!tableOrders[0]) {
    return (
      <div className="min-h-screen p-4" dir="rtl">
        <header className="mb-6">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            חזרה
          </Button>
          <h1 className="text-2xl font-bold">תשלום שולחן</h1>
        </header>
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            לא נמצאו הזמנות שולחן
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedTotal = calculateSelectedTotal();

  return (
    <div className="min-h-screen p-4" dir="rtl">
      <header className="mb-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          חזרה
        </Button>
        <h1 className="text-2xl font-bold">תשלום שולחן</h1>
      </header>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <h2 className="font-medium mb-4">בחר הזמנות לתשלום</h2>
            {tableOrders[0].orderDetails.personalOrders.map((order, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedOrders[order.ordererName]}
                    onCheckedChange={() => handleOrderSelection(order.ordererName)}
                  />
                  <span>{order.ordererName}</span>
                </div>
                <span>₪{order.price}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>סכום נבחר</span>
                <span>₪{selectedTotal.toFixed(2)}</span>
              </div>

              <Separator className="my-4" />

              {showPayment ? (
                <PaymentForm
                  amount={selectedTotal}
                  onSuccess={handlePaymentSuccess}
                />
              ) : (
                <Button
                  className="w-full"
                  onClick={() => setShowPayment(true)}
                  disabled={selectedTotal === 0 || isProcessingPayment}
                >
                  המשך לתשלום
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}