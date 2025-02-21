import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import MenuItemCard from "@/components/menu-item-card";
import CallWaiterButton from "@/components/call-waiter-button";
import { type MenuItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Frontend fetch example
const fetchMenuItems = async () => {
  const response = await fetch("http://localhost:5000/api/menu"); // Your backend URL
  if (!response.ok) {
    throw new Error("Failed to fetch menu items");
  }
  console.log(response)
  return response.json();
};


export default function Menu() {
  const { tableId } = useParams();
  const { toast } = useToast();

  // const { data: menuItems, isLoading } = useQuery<MenuItem[]>({
  //   queryKey: ["/api/menu"],
  // });
  const { data: menuItems, isLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu"],
    queryFn: fetchMenuItems, // Use the fetchMenuItems function to fetch data
  });

  const handleAddToCart = (item: MenuItem ,
    quantity: number,
    customizations: {
      excludeIngredients: string[];
      specialInstructions: string;
    }
  ) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const itemAndQuantity = item
    itemAndQuantity.quantity = quantity;
    itemAndQuantity.customizations = customizations;
    cart.push(itemAndQuantity);
    localStorage.setItem("cart", JSON.stringify(cart));
    // localStorage.removeItem("cart");


    // Accessing quantity for each item
    // const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    // console.log("🔍 Current Cart Before Adding Item:", JSON.stringify(cart, null, 2));

    // console.log("vsdvdv 37");  // Should output the 
    // console.log("quantity ",quantity);  // Should output the 
    console.log(`Item: ${item.name}, Quantity: ${quantity}`);
    // const quantityPropertyNames = Object.keys(item.quantity);
    // console.log(quantityPropertyNames); // ["amount"]



    toast({
      title: "נוסף לסל",
      description: `${quantity}x ${item.name}${
        customizations?.excludeIngredients.length
          ? ` (ללא ${customizations.excludeIngredients.join(", ")})`
          : ""
      }`,
      onClick: () => location.href = `/cart/${tableId}`, // Redirects on click

    });
  };

  const scrollToCategory = (category: string) => {
    const element = document.getElementById(`category-${category}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4" dir="rtl">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[300px] w-full" />
        ))}
      </div>
    );
  }

  const categories = [...new Set(menuItems?.map(item => item.category))];

  return (
    <div className="min-h-screen pb-20" dir="rtl">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="flex justify-between items-center max-w-4xl mx-auto p-4">
          <h1 className="text-2xl font-bold">מה בא לנו היום?</h1>

          <div className="flex gap-2">
            <Link href={`/orders/${tableId}`}>
              <Button variant="outline">
                ההזמנות שלי
              </Button>
            </Link>
            <Link href={`/personal/${tableId}`}>
              <Button variant="outline" size="icon">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide border-t bg-card">
          <div className="flex gap-2 p-2 max-w-4xl mx-auto">
            {categories.map(category => (
              <Button
                key={category}
                variant="ghost"
                className="whitespace-nowrap px-4"
                onClick={() => scrollToCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <main className="p-4 max-w-1xl mx-auto space-y-8">
        {categories.map(category => (
          <section
            key={category}
            id={`category-${category}`}
            className="bg-gray-50 rounded-lg p-0 scroll-mt-32"
          >
            <h2 className="text-xl font-semibold mb-4 text-center bg-gray-200 py-2 rounded">
              {category}
            </h2>
            <div className="grid gap-4 sm:grid-cols-1">
              {menuItems
                ?.filter(item => item.category === category)
                .map(item => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onAddToCart={(item, quantity, customizations) =>
                      handleAddToCart(item, quantity, customizations) // Correct way
                    }
                  />
                ))}
            </div>
          </section>
        ))}
      </main>

      {tableId && <CallWaiterButton tableId={tableId} />}
    </div>
  );
}