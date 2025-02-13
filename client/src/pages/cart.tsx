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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CartItem extends MenuItem {
  quantity: number;
  customizations?: {
    excludeIngredients: string[];
    specialInstructions: string;
    selectedToppings: Array<{ name: string, price: string }>;
    selectedSide?: { name: string, price: string };
    selectedDrink?: { name: string, price: string };
  };
}

const TIP_OPTIONS = [
  { value: "0", label: "ללא טיפ" },
  { value: "10", label: "10%" },
  { value: "12", label: "12%" },
  { value: "15", label: "15%" },
  { value: "18", label: "18%" },
  { value: "20", label: "20%" },
  { value: "custom", label: "סכום אחר" },
];

export default function Cart() {
  const { tableId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPayment, setShowPayment] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [tipPercentage, setTipPercentage] = useState("10");
  const [customTipAmount, setCustomTipAmount] = useState("");
  const [items, setItems] = useState<CartItem[]>(() =>
    JSON.parse(localStorage.getItem("cart") || "[]")
  );

  const calculateItemTotal = (item: CartItem) => {
    let total = Number(item.price);

    if (item.customizations) {
      // Add toppings costs
      total += item.customizations.selectedToppings.reduce(
        (sum, topping) => sum + Number(topping.price),
        0
      );

      // Add side dish cost if selected
      if (item.customizations.selectedSide) {
        total += Number(item.customizations.selectedSide.price);
      }

      // Add drink cost if selected
      if (item.customizations.selectedDrink) {
        total += Number(item.customizations.selectedDrink.price);
      }
    }

    return total * item.quantity;
  };

  const handlePaymentSuccess = async (paymentIntent: any) => {
    setIsPlacingOrder(true);

    try {
      const subtotal = items.reduce(
        (sum, item) => sum + calculateItemTotal(item),
        0
      );

      const tipAmount = tipPercentage === "custom"
        ? Number(customTipAmount) || 0
        : (subtotal * Number(tipPercentage)) / 100;
      const total = subtotal + tipAmount;

      // Create mock order
      const orderId = Math.floor(Math.random() * 1000) + 1;
      const mockOrder = {
        id: orderId,
        tableId: Number(tableId),
        status: "pending",
        total,
        tipAmount,
        items: items.map((item) => ({
          id: Math.floor(Math.random() * 1000) + 1,
          orderId,
          menuItemId: item.id,
          quantity: item.quantity,
          price: calculateItemTotal(item) / item.quantity,
          customizations: item.customizations,
        })),
        createdAt: new Date().toISOString(),
      };

      // Store mock order in localStorage
      const orders = JSON.parse(localStorage.getItem("orders") || "{}");
      orders[orderId] = mockOrder;
      localStorage.setItem("orders", JSON.stringify(orders));

      // Clear cart
      localStorage.removeItem("cart");

      // Show success message
      toast({
        title: "ההזמנה בוצעה!",
        description: `הזמנה מספר ${orderId} התקבלה בהצלחה.`,
        onClick: () => setLocation(`/order/${orderId}`),
      });

      // Redirect to menu
      setLocation(`/menu/${tableId}`);
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בביצוע ההזמנה.",
        variant: "destructive",
      });
      setIsPlacingOrder(false);
    }
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      localStorage.setItem("cart", JSON.stringify(newItems));
      return;
    }

    const newItems = items.map((item, i) =>
      i === index ? { ...item, quantity: newQuantity } : item
    );
    setItems(newItems);
    localStorage.setItem("cart", JSON.stringify(newItems));
  };

  const subtotal = items.reduce(
    (sum, item) => sum + calculateItemTotal(item),
    0
  );

  const tipAmount = tipPercentage === "custom"
    ? Number(customTipAmount) || 0
    : (subtotal * Number(tipPercentage)) / 100;

  const total = subtotal + tipAmount;

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
        <h1 className="text-2xl font-bold">ההזמנה שלך</h1>
      </header>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            העגלה ריקה
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
                      ₪{calculateItemTotal(item) / item.quantity} ליחידה
                    </p>
                    {item.customizations && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {item.customizations.selectedToppings.length > 0 && (
                          <p>תוספות: {item.customizations.selectedToppings.map(t => t.name).join(", ")}</p>
                        )}
                        {item.customizations.selectedSide && (
                          <p>תוספת בצד: {item.customizations.selectedSide.name}</p>
                        )}
                        {item.customizations.selectedDrink && (
                          <p>שתייה: {item.customizations.selectedDrink.name}</p>
                        )}
                        {item.customizations.excludeIngredients.length > 0 && (
                          <p>ללא: {item.customizations.excludeIngredients.join(", ")}</p>
                        )}
                        {item.customizations.specialInstructions && (
                          <p>הערות: {item.customizations.specialInstructions}</p>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                      >
                        {item.quantity === 1 ? (
                          <Trash2 className="h-4 w-4" />
                        ) : (
                          <Minus className="h-4 w-4" />
                        )}
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ₪{calculateItemTotal(item).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>סכום ביניים</span>
                  <span>₪{subtotal.toFixed(2)}</span>
                </div>

                <div className="space-y-2">
                  <Label>בחר אחוז טיפ:</Label>
                  <RadioGroup
                    value={tipPercentage}
                    onValueChange={setTipPercentage}
                    className="flex flex-wrap gap-2"
                  >
                    {TIP_OPTIONS.map((option) => (
                      <div key={option.value} className="flex items-center">
                        <RadioGroupItem
                          value={option.value}
                          id={`tip-${option.value}`}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={`tip-${option.value}`}
                          className="px-3 py-2 rounded-md border cursor-pointer peer-checked:bg-primary peer-checked:text-primary-foreground hover:bg-muted"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  {tipPercentage === "custom" && (
                    <div className="mt-2">
                      <Label>הכנס סכום טיפ:</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">₪</span>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={customTipAmount}
                          onChange={(e) => setCustomTipAmount(e.target.value)}
                          placeholder="0"
                          className="w-24"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {(Number(tipPercentage) > 0 || tipPercentage === "custom") && (
                  <div className="flex justify-between items-center">
                    <span>
                      {tipPercentage === "custom" ? "טיפ" : `טיפ (${tipPercentage}%)`}
                    </span>
                    <span>₪{tipAmount.toFixed(2)}</span>
                  </div>
                )}

                <Separator className="my-4" />
                <div className="flex justify-between items-center font-medium mb-4">
                  <span>סה״כ לתשלום</span>
                  <span>₪{total.toFixed(2)}</span>
                </div>

                {showPayment ? (
                  <PaymentForm amount={total} onSuccess={handlePaymentSuccess} />
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => setShowPayment(true)}
                    disabled={isPlacingOrder}
                  >
                    המשך לתשלום
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {tableId && <CallWaiterButton tableId={tableId} />}
    </div>
  );
}