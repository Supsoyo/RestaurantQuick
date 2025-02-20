import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { type MenuItem } from "@shared/schema";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import CallWaiterButton from "@/components/call-waiter-button";
// import { useLocation } from "wouter";
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
  const [tipPercentage, setTipPercentage] = useState("10"); // Default 10% tip
  const [customTipAmount, setCustomTipAmount] = useState("");
  const [items, setItems] = useState<CartItem[]>(() =>
    JSON.parse(localStorage.getItem("cart") || "[]")
  );
  // const [, setLocation] = useLocation();

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

  const handleAddPersonalOrderSuccess = async () => {
    setIsPlacingOrder(true);
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

      // localStorage.removeItem("cart");
    //   const tableOrder = JSON.parse(localStorage.getItem("tableorder") || "[]");

    // const customerName = localStorage.getItem("customerName") || "Guest"

    // // Create a personal order object
    // const personalOrder = {
    //   ordererName: customerName,
    //   cartItems: cart,
    // };

    //     tableOrder.push(personalOrder);
    //   localStorage.setItem("tableOrder", JSON.stringify(tableOrder));


    //   console.log("Order created:", tableOrder)
    // console.log("🔍 Current Cart Before Adding Item:", JSON.stringify(tableOrder, null, 2));
      // localStorage.removeItem("cart");




    
      const tableOrders = JSON.parse(localStorage.getItem("tableOrders") || "[]");
      // const tableOrders = [
      //   {
      //     tableId: "someTableId",  // Replace with actual tableId
      //     orderees: [],  // Add the first customer
      //     personalOrders: [],
      //   }
      // ];

    const customerName = localStorage.getItem("customerName") || "Guest"

    // Create a personal order object
    const personalOrder = {
      ordererName: customerName,
      cartItems: cart,
      price: subtotal.toFixed(2),
    };

    const tableOrder = {}

    console.log("tableOrders.length: ",tableOrders.length)
    

    if (tableOrders.length === 0) {
      // If no order exists for this table, create a new tableOrder 
      const tableOrder = {
        tableId: "someTableId",  // Replace with actual tableId
        orderees: [customerName],  // Add the first customer
        personalOrders: [personalOrder],
      };
      console.log("🔍 tableOrder:", JSON.stringify(tableOrder, null, 2));
      tableOrders.push(tableOrder);
      console.log("🔍 tableOrders:", JSON.stringify(tableOrders, null, 2));
    }
    else{
      
    const tableOrder = tableOrders[0]
      if (!tableOrder.orderees.includes(customerName)) {
        tableOrder.orderees.push(customerName);
      }
      tableOrder.personalOrders.push(personalOrder);
  }
    console.log("hiiiii!!!: ",tableOrder.toString())

    // tableOrders.push(tableOrder);
    // tableOrders.push(tableOrder);
    


        // tableOrder.push(personalOrder);
      localStorage.setItem("tableOrders", JSON.stringify(tableOrders));
        // tableOrder.push(personalOrder);
      // localStorage.removeItem("tableOrders");


      console.log("Order created:", tableOrder)
    console.log("🔍 Current Cart Before Adding Item:", JSON.stringify(tableOrder, null, 2));

      




      // Redirect to menu
      setLocation(`/tableorder/${tableId}`);
  
      
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
                  <span>סכום </span>
                  <span>₪{subtotal.toFixed(2)}</span>
                </div>

                


                <Separator className="my-4" />
                <Button
                  className="w-full"
                  onClick={() => handleAddPersonalOrderSuccess()}
                  disabled={isPlacingOrder}
                >
                  הוסף להזמנה של שולחן
                </Button>


              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {tableId && <CallWaiterButton tableId={tableId} />}
    </div>
  );
}
