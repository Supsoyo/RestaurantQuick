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
import { object } from "zod";

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
  const [tableOrders, setTableOrders] = useState<CartItem[][]>(() =>
    JSON.parse(localStorage.getItem("tableOrders") || "[]")
  );
  console.log("tableOrders: ",tableOrders)
  console.log("tableOrders[0]: ",tableOrders[0])
  console.log("tableOrders[1]: ",tableOrders[1])

  const calculateItemPrice2 = (item: CartItem) => {
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


  
  let totalSum = tableOrders[0].personalOrders.reduce((sum, personalOrder) => {
    let personalOrderTotal = personalOrder.cartItems.reduce((orderSum, item) => {
      console.log("item.price: ",item.price)
      console.log("item.name: ",item.price)
        return orderSum + calculateItemPrice2(item); // Convert price to float and multiply by quantity
    }, 0);
    return sum + personalOrderTotal;
  }, 0);

  console.log("Total sum of all cart items:", totalSum);
  // const [, setLocation] = useLocation();
  const [orderees, setOrderees] = useState<String[]>(() =>
    JSON.parse(localStorage.getItem("tableOrders") || "[]").orderees
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
      const tableOrders = JSON.parse(localStorage.getItem("tableOrders") || "[]");

          tableOrders.push(cart);
      localStorage.setItem("tableOrders", JSON.stringify(tableOrders));


      console.log("Order created:", tableOrders)
    console.log("🔍 Current Cart Before Adding Item:", JSON.stringify(tableOrders, null, 2));






      // Redirect to menu
      setLocation(`/order/${tableId}`);


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
  // console.log("tableOrders: ",tableOrders)

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
        <h1 className="text-2xl font-bold">ההזמנה של השולחן</h1>
      </header>
      {/* <p>
        {
          JSON.stringify(tableOrders[0].personalOrders, null, 2)
        }
      </p> */}
      

      <main className="p-4 max-w-1xl mx-auto space-y-8">
        {/* <h1 className="text-2xl font-bold">
          orderees:
        </h1> */}
        <p>
          {/* {
            Object.keys(tableOrders[0])
          }
          <br />
          hvhv
          <br />
          {
            JSON.stringify(tableOrders[0], null, 2)
          }
          <br />
          hvhv
          <br /> */}
          {/* {
            tableOrders[0].orderees.map((orderee) =>
              <p>
                ordeee: {orderee}
              </p>
            )
          } */}
          {
            tableOrders[0].orderees.map((orderee) =>
              <section
                key={orderee}
                id={`category-${orderee}`}
                className="bg-gray-50 rounded-lg p-0 scroll-mt-32"
              >
                <h2 className="text-xl font-semibold mb-4 text-center bg-gray-200 py-2 rounded">
                  {orderee}
                </h2>
                {/* personalOrders ordererName */}
                {
                  tableOrders[0].personalOrders?.filter(orderee2 => orderee2.ordererName === orderee)
                  .map(orderee2 => 
                    <p>
                      {/* orderee: {JSON.stringify(orderee2, null, 2)} */}
                      {/* cartItems: {JSON.stringify(orderee2.cartItems, null, 2)} */}
                      {orderee2.cartItems.map((item, index) =>
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
                                
                                <span className="w-8 text-center">x{item.quantity}</span>
                               
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
                      


                      )
                      }
                            <Card className="mt-6">
                              <CardContent className="p-4">
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center">
                                    <span>סכום </span>
                                    <span>₪{orderee2.price}</span>
                                  </div>





                                </div>
                              </CardContent>
                            </Card>
                    
                    </p>
                       
                                              )
                                              }

                
              <br />
              </section>
            )
          }
        </p>

        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>סכום </span>
                <span>₪{totalSum.toFixed(2)}</span>
              </div>




              <Separator className="my-4" />
              <Button
                className="w-full"
                onClick={() => handleAddPersonalOrderSuccess()}
                disabled={isPlacingOrder}
              >
                הזמן
              </Button>


            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
