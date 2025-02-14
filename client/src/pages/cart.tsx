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
    selectedOptions?: {
      meatType?: string;
      bunType?: string;
      drink?: string;
      toppings: string[];
    };
    excludeIngredients: string[];
    specialInstructions: string;
    additionalPrice: number;
  };
  customizationOptions?: {
    meatTypes?: {id: string, label: string, price: number}[];
    bunTypes?: {id: string, label: string, price: number}[];
    drinks?: {id: string, label: string, price: number}[];
    toppings?: {id: string, label: string, price: number}[];
  }
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
  const [tipPercentage, setTipPercentage] = useState("10"); // Default 10% tip
  const [customTipAmount, setCustomTipAmount] = useState("");
  const [items, setItems] = useState<CartItem[]>(() =>
    JSON.parse(localStorage.getItem("cart") || "[]")
  );

  const handlePaymentSuccess = async (paymentIntent: any) => {
    setIsPlacingOrder(true);

    try {
      // Calculate total with tip
      const subtotal = items.reduce(
        (sum, item) =>
          sum +
          (Number(item.price) + (item.customizations?.additionalPrice || 0)) *
            item.quantity,
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
            price: Number(item.price) + (item.customizations?.additionalPrice || 0),
          })),
          tipAmount: tipAmount.toString(),
          paymentIntentId: paymentIntent.id,
        }),
      });

      const order = await response.json();

      // For development, create a mock order ID
      order.id = Math.floor(Math.random() * 1000) + 1;

      // Create mock order
      const mockOrder = {
        id: order.id,
        tableId: Number(tableId),
        status: "pending",
        total,
        tipAmount,
        items: items.map((item) => ({
          id: Math.floor(Math.random() * 1000) + 1,
          orderId: order.id,
          menuItemId: item.id,
          quantity: item.quantity,
          price: Number(item.price) + (item.customizations?.additionalPrice || 0),
          name: item.name,
          customizations: item.customizations,
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
        description: `הזמנה מספר ${order.id} התקבלה בהצלחה.`,
        onClick: () => setLocation(`/order/${order.id}`),
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
    (sum, item) =>
      sum +
      (Number(item.price) + (item.customizations?.additionalPrice || 0)) *
        item.quantity,
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
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Item Header */}
                <div className="flex items-start gap-4 p-4 bg-muted/50">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-lg">
                      ₪{Number(item.price).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">מחיר בסיס</p>
                  </div>
                </div>

                {/* Customizations Section */}
                {item.customizations && (
                  <div className="p-4 space-y-3 border-t">
                    {/* Selected Options with Prices */}
                    <div className="space-y-2">
                      {item.customizations.selectedOptions?.meatType && (
                        <div className="flex justify-between text-sm">
                          <span>סוג בשר: {item.customizations.selectedOptions.meatType}</span>
                          {item.customizationOptions?.meatTypes?.find(
                            m => m.id === item.customizations?.selectedOptions.meatType
                          )?.price > 0 && (
                            <span>
                              +₪{item.customizationOptions.meatTypes.find(
                                m => m.id === item.customizations?.selectedOptions.meatType
                              )?.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      )}

                      {item.customizations.selectedOptions?.bunType && (
                        <div className="flex justify-between text-sm">
                          <span>לחמנייה: {item.customizations.selectedOptions.bunType}</span>
                          {item.customizationOptions?.bunTypes?.find(
                            b => b.id === item.customizations?.selectedOptions.bunType
                          )?.price > 0 && (
                            <span>
                              +₪{item.customizationOptions.bunTypes.find(
                                b => b.id === item.customizations?.selectedOptions.bunType
                              )?.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      )}

                      {item.customizations.selectedOptions?.drink && (
                        <div className="flex justify-between text-sm">
                          <span>שתייה: {item.customizations.selectedOptions.drink}</span>
                          {item.customizationOptions?.drinks?.find(
                            d => d.id === item.customizations?.selectedOptions.drink
                          )?.price > 0 && (
                            <span>
                              +₪{item.customizationOptions.drinks.find(
                                d => d.id === item.customizations?.selectedOptions.drink
                              )?.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      )}

                      {item.customizations.selectedOptions?.toppings.length > 0 && (
                        <div className="text-sm">
                          <div className="flex justify-between mb-1">
                            <span>תוספות:</span>
                            <span>מחיר</span>
                          </div>
                          {item.customizations.selectedOptions.toppings.map(toppingId => {
                            const topping = item.customizationOptions?.toppings?.find(
                              t => t.id === toppingId
                            );
                            return (
                              <div key={toppingId} className="flex justify-between pl-4">
                                <span>{topping?.label}</span>
                                <span>+₪{topping?.price.toFixed(2)}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Excluded Ingredients */}
                    {item.customizations.excludeIngredients.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">ללא: </span>
                        {item.customizations.excludeIngredients.join(", ")}
                      </div>
                    )}

                    {/* Special Instructions */}
                    {item.customizations.specialInstructions && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">הערות: </span>
                        {item.customizations.specialInstructions}
                      </div>
                    )}

                    {/* Total Price with Customizations */}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-medium">סה״כ עם תוספות:</span>
                      <span className="font-bold text-lg">
                        ₪{((Number(item.price) + item.customizations.additionalPrice)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Quantity Controls */}
                <div className="flex items-center justify-between p-4 border-t">
                  <div className="flex items-center gap-2">
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

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">סה״כ למנה:</p>
                    <p className="font-bold text-lg">
                      ₪{((Number(item.price) + (item.customizations?.additionalPrice || 0)) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Order Summary Card */}
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>סכום ביניים</span>
                  <span>₪{subtotal.toFixed(2)}</span>
                </div>

                {/* Tip Section */}
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