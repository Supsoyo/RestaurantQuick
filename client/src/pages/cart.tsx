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
  customizations: {
    excludeIngredients: string[];
    specialInstructions: string;
    selectedIngredients: Record<string, string[]>;
    selectedRadioOptions: Record<string, string>;
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
  const [tipPercentage, setTipPercentage] = useState("10"); // Default 10% tip jbjb3232
  const [customTipAmount, setCustomTipAmount] = useState("");
  const [items, setItems] = useState<CartItem[]>(() =>
    JSON.parse(localStorage.getItem("cart") || "[]")
  );

  const calculateItemPrice = (item: CartItem) => {
    let additionalCost = 0;

    // Calculate additional cost from selected ingredients
    Object.entries(item.customizations.selectedIngredients).forEach(([checklistName, selectedIngredients]) => {
      const checklist = item.checkLists.find(c => c.name === checklistName);
      if (checklist) {
        // Count occurrences of each ingredient
        const ingredientCounts: Record<string, number> = {};
        selectedIngredients.forEach(ing => {
          ingredientCounts[ing] = (ingredientCounts[ing] || 0) + 1;
        });

        // Calculate cost based on counts
        Object.entries(ingredientCounts).forEach(([ingredientName, count]) => {
          const ingredient = checklist.possibleIngredients.find(i => i.name === ingredientName);
          if (ingredient) {
            additionalCost += Number(ingredient.price) * count;
          }
        });
      }
    });

    // Calculate additional cost from radio selections
    Object.entries(item.customizations.selectedRadioOptions).forEach(([radioListName, selectedOption]) => {
      const radioList = item.radioLists.find(r => r.name === radioListName);
      if (radioList) {
        const option = radioList.options.find(o => o.name === selectedOption);
        if (option) {
          additionalCost += Number(option.price);
        }
      }
    });

    return (Number(item.price) + additionalCost) * item.quantity;
  };

  const handlePaymentSuccess = async (paymentIntent: any) => {
    setIsPlacingOrder(true);

    try {
      // Calculate total with tip
      const subtotal = items.reduce(
        (sum, item) => sum + calculateItemPrice(item),
        0
      );
      const tipAmount = tipPercentage === "custom"
        ? Number(customTipAmount) || 0
        : (subtotal * Number(tipPercentage)) / 100;
      const total = subtotal + tipAmount;

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
            quantity: item.quantity,
            price: Number(item.price),
          })),
          tipAmount: tipAmount.toString(),
          paymentIntentId: paymentIntent.id,
        }),
      });

      const order = await response.json();

      // Create mock order
      const mockOrder = {
        id: order.id || Math.floor(Math.random() * 1000) + 1,
        tableId: Number(tableId),
        status: "pending",
        total,
        tipAmount,
        items: items.map((item) => ({
          id: Math.floor(Math.random() * 1000) + 1,
          orderId: 0,
          menuItemId: item.id,
          quantity: item.quantity,
          price: Number(item.price),
        })),
        createdAt: new Date().toISOString(),
      };

      // Store mock order in localStorage
      const orders = JSON.parse(localStorage.getItem("orders") || "{}");
      orders[mockOrder.id] = mockOrder;
      localStorage.setItem("orders", JSON.stringify(orders));

      // Clear cart
      localStorage.removeItem("cart");

      // Show success message
      toast({
        title: "ההזמנה בוצעה!",
        description: `הזמנה מספר ${mockOrder.id} התקבלה בהצלחה.`,
        onClick: () => setLocation(`/order/${mockOrder.id}`),
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
    (sum, item) => sum + calculateItemPrice(item),
    0
  );

  const tipAmount = tipPercentage === "custom"
    ? Number(customTipAmount) || 0
    : (subtotal * Number(tipPercentage)) / 100;

  const total = subtotal + tipAmount;

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
                    {item.customizations?.excludeIngredients.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        ללא: {item.customizations.excludeIngredients.join(", ")}
                      </p>
                    )}
                    {Object.entries(item.customizations?.selectedIngredients || {}).map(([name, ingredients]) => {
                      if (ingredients.length === 0) return null;

                      // Count occurrences of each ingredient
                      const ingredientCounts: Record<string, number> = {};
                      ingredients.forEach(ing => {
                        ingredientCounts[ing] = (ingredientCounts[ing] || 0) + 1;
                      });

                      // Format the display string
                      const displayString = Object.entries(ingredientCounts)
                        .map(([ing, count]) => `${ing} (${count})`)
                        .join(", ");

                      return (
                        <p key={name} className="text-sm text-muted-foreground">
                          {name}: {displayString}
                        </p>
                      );
                    })}
                    {Object.entries(item.customizations?.selectedRadioOptions || {}).map(([name, option]) => (
                      <p key={name} className="text-sm text-muted-foreground">
                        {name}: {option}
                      </p>
                    ))}
                    {item.customizations?.specialInstructions && (
                      <p className="text-sm text-muted-foreground">
                        הערה: {item.customizations.specialInstructions}
                      </p>
                    )}

                    <p className="text-sm text-muted-foreground">
                      ₪{calculateItemPrice(item) / item.quantity} ליחידה
                    </p>
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
                      ₪{calculateItemPrice(item).toFixed(2)}
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