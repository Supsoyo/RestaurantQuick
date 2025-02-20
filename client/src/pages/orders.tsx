import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, ChefHat, TruckIcon, CheckCircle2, CreditCard } from "lucide-react";
import { type Order } from "@shared/schema";
import { Separator } from "@/components/ui/separator";

interface TableOrder {
  tableId: string;
  orderees: string[];
  personalOrders: Array<{
    ordererName: string;
    cartItems: any[];
    price: string;
  }>;
}

const STATUS_ICONS = {
  pending: { icon: Clock, label: "ממתין" },
  preparing: { icon: ChefHat, label: "בהכנה" },
  ready: { icon: TruckIcon, label: "מוכן להגשה" },
  completed: { icon: CheckCircle2, label: "הושלם" },
};

export default function Orders() {
  const { tableId } = useParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tableOrders, setTableOrders] = useState<TableOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();


  useEffect(() => {
    try {
      // Load individual orders from localStorage
      const storedOrders = JSON.parse(localStorage.getItem("orders") || "{}");
      const individualOrders = Object.values(storedOrders)
        .filter((order: Order) => order.tableId === Number(tableId))
        .sort((a: Order, b: Order) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      setOrders(individualOrders);

      // Load table orders from localStorage
      const storedTableOrders = JSON.parse(localStorage.getItem("tableOrders") || "[]");
      setTableOrders(storedTableOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  }, [tableId]);

  if (loading) {
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
          <h1 className="text-2xl font-bold">ההזמנות שלי</h1>
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

  const calculateItemPrice = (item: any) => {
    let additionalCost = 0;

    // Calculate additional cost from selected ingredients
    Object.entries(item.customizations.selectedIngredients).forEach(([checklistName, selectedIngredients]: [string, any[]]) => {
      const checklist = item.checkLists.find((c: any) => c.name === checklistName);
      if (checklist) {
        // Count occurrences of each ingredient
        const ingredientCounts: Record<string, number> = {};
        selectedIngredients.forEach(ing => {
          ingredientCounts[ing] = (ingredientCounts[ing] || 0) + 1;
        });

        // Calculate cost based on counts
        Object.entries(ingredientCounts).forEach(([ingredientName, count]) => {
          const ingredient = checklist.possibleIngredients.find((i: any) => i.name === ingredientName);
          if (ingredient) {
            additionalCost += Number(ingredient.price) * count;
          }
        });
      }
    });

    // Calculate additional cost from radio selections
    Object.entries(item.customizations.selectedRadioOptions).forEach(([radioListName, selectedOption]) => {
      const radioList = item.radioLists.find((r: any) => r.name === radioListName);
      if (radioList) {
        const option = radioList.options.find((o: any) => o.name === selectedOption);
        if (option) {
          additionalCost += Number(option.price);
        }
      }
    });

    return (Number(item.price) + additionalCost) * item.quantity;
  };
  console.log("tableOrders: ",JSON.stringify(tableOrders));

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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">ההזמנות שלי</h1>
          {tableOrders.length > 0 && (
            <Button
              onClick={() => setLocation(`/table-payment/${tableId}`)}
              className="flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              תשלום שולחן
            </Button>
          )}
        </div>
      </header>

      <div className="space-y-8">
        {/* Table Orders Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">הזמנות שולחן</h2>
          {tableOrders.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                אין הזמנות שולחן
              </CardContent>
            </Card>
          ) : (
            tableOrders.map((tableOrder, index) => (
              <Card key={index} className="mb-4">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <h3 className="font-medium">שולחן מספר {tableOrder.tableId}</h3>
                    <div className="text-sm text-muted-foreground">
                      סועדים: {tableOrder.orderees.join(", ")}
                    </div>

                    {tableOrder.personalOrders.map((personalOrder, orderIndex) => (
                      <div key={orderIndex} className="bg-muted/50 rounded-lg p-4 mt-4">
                        <h4 className="font-medium mb-2">{personalOrder.ordererName}</h4>
                        {personalOrder.cartItems.map((item, itemIndex) => (
                          <div key={itemIndex} className="mb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <span>{item.name} x{item.quantity}</span>
                              </div>
                              <span className="font-medium">₪{calculateItemPrice(item).toFixed(2)}</span>
                            </div>
                            <div className="ml-14">
                              {item.customizations?.excludeIngredients.length > 0 && (
                                <p className="text-sm text-muted-foreground">
                                  ללא: {item.customizations.excludeIngredients.join(", ")}
                                </p>
                              )}
                              {/* Display selected ingredients with quantities */}
                              {Object.entries(item.customizations?.selectedIngredients || {}).map(([name, ingredients]: [string, any[]]) => {
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
                              {/* Display radio selections */}
                              {Object.entries(item.customizations?.selectedRadioOptions || {}).map(([name, option]) => (
                                <p key={name} className="text-sm text-muted-foreground">
                                  {name}: {option}
                                </p>
                              ))}
                              {item.customizations?.specialInstructions && (
                                <p className="text-sm text-muted-foreground">
                                  הערות: {item.customizations.specialInstructions}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                        <Separator className="my-2" />
                        <div className="flex justify-between font-medium">
                          <span>סה״כ להזמנה</span>
                          <span>₪{personalOrder.price}</span>
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between font-bold">
                        <span>סה״כ שולחן</span>
                        <span>
                          ₪{tableOrder.personalOrders.reduce((sum, order) =>
                            sum + Number(order.price), 0
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </section>

        {/* Individual Orders Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">הזמנות אישיות</h2>
          {orders.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                אין הזמנות אישיות
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => {
              const StatusIcon = STATUS_ICONS[order.status as keyof typeof STATUS_ICONS].icon;
              return (
                <Link key={order.id} href={`/order/${order.id}`}>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">הזמנה #{order.id}</h3>
                            <span className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            סה״כ: ₪{Number(order.total).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {STATUS_ICONS[order.status as keyof typeof STATUS_ICONS].label}
                          </span>
                          <StatusIcon className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}