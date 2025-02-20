import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowLeft } from "lucide-react";

export default function PaymentSuccess() {
  const { tableId } = useParams();
  const [, setLocation] = useLocation();
  const paymentAmount = new URLSearchParams(window.location.search).get("amount") || "0";

  return (
    <div className="min-h-screen p-4" dir="rtl">
      <header className="mb-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => setLocation(`/menu/${tableId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          חזרה לתפריט
        </Button>
      </header>

      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">התשלום בוצע בהצלחה!</h1>
            <p className="text-muted-foreground">
              שולם: ₪{Number(paymentAmount).toFixed(2)}
            </p>
          </div>

          <div className="space-y-4">
            <Button
              className="w-full"
              onClick={() => setLocation(`/menu/${tableId}`)}
            >
              חזרה לתפריט
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setLocation(`/orders/${tableId}`)}
            >
              צפייה בהזמנות
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
