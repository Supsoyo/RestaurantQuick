import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { type MenuItem } from "@shared/schema";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import CallWaiterButton from "@/components/call-waiter-button";
import { useAuth } from "@/contexts/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface CartItem extends MenuItem {
  quantity: number;
  customizations: {
    excludeIngredients: string[];
    specialInstructions: string;
    selectedIngredients: Record<string, string[]>;
    selectedRadioOptions: Record<string, string>;
  };
}

export default function Personal() {
  const { tableId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<CartItem[]>(() =>
    JSON.parse(localStorage.getItem(`cart-${user?.uid}`) || "[]")
  );

  const { data: tableOrders, isLoading } = useQuery({
    queryKey: ["table-orders", tableId, user?.uid],
    queryFn: async () => {
      const response = await apiRequest(`/api/table-orders/${tableId}?userId=${user?.uid}`);
      return response.json();
    },
    enabled: !!user?.uid, // Only fetch when user is logged in
  });

  const createTableOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("/api/table-orders", {
        method: "POST",
        body: JSON.stringify({
          ...orderData,
          userId: user?.uid,
          userEmail: user?.email,
          userName: user?.displayName
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["table-orders", tableId, user?.uid] });
      localStorage.removeItem(`cart-${user?.uid}`);
      setLocation(`/tableorder/${tableId}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create table order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const calculateItemPrice = (item: CartItem) => {
    let additionalCost = 0;

    // Calculate additional cost from selected ingredients
    Object.entries(item.customizations.selectedIngredients).forEach(([checklistName, selectedIngredients]) => {
      const checklist = item.checkLists.find(c => c.name === checklistName);
      if (checklist) {
        const ingredientCounts: Record<string, number> = {};
        selectedIngredients.forEach(ing => {
          ingredientCounts[ing] = (ingredientCounts[ing] || 0) + 1;
        });

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

  const handleAddPersonalOrder = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to place an order",
        variant: "destructive",
      });
      return;
    }

    const personalOrder = {
      tableId: Number(tableId),
      restaurantId: 1, // This should be dynamic based on the restaurant context
      orderDetails: {
        orderees: [user.displayName || user.email || "Anonymous"],
        personalOrders: [{
          ordererName: user.displayName || user.email || "Anonymous",
          cartItems: items,
          price: subtotal.toFixed(2),
        }],
      },
    };

    createTableOrderMutation.mutate(personalOrder);
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      localStorage.setItem(`cart-${user?.uid}`, JSON.stringify(newItems));
      return;
    }

    const newItems = items.map((item, i) =>
      i === index ? { ...item, quantity: newQuantity } : item
    );
    setItems(newItems);
    localStorage.setItem(`cart-${user?.uid}`, JSON.stringify(newItems));
  };

  const subtotal = items.reduce(
    (sum, item) => sum + calculateItemPrice(item),
    0
  );

  if (isLoading) {
    return (
      <div className="min-h-screen p-4">
        <Card>
          <CardContent className="p-6">
            Loading...
          </CardContent>
        </Card>
      </div>
    );
  }

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
        {user && (
          <p className="text-sm text-muted-foreground mt-1">
            מחובר כ- {user.displayName || user.email}
          </p>
        )}
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

                      const ingredientCounts: Record<string, number> = {};
                      ingredients.forEach(ing => {
                        ingredientCounts[ing] = (ingredientCounts[ing] || 0) + 1;
                      });

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
                  onClick={handleAddPersonalOrder}
                  disabled={createTableOrderMutation.isPending}
                >
                  {createTableOrderMutation.isPending ? "מוסיף להזמנה..." : "הוסף להזמנה של שולחן"}
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