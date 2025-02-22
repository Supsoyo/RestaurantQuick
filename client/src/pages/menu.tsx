import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import MenuItemCard from "@/components/menu-item-card";
import CallWaiterButton from "@/components/call-waiter-button";
import { type MenuItem, type Restaurant } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

export default function Menu() {
  const { tableId } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: restaurant, isLoading: isLoadingRestaurant } = useQuery<Restaurant>({
    queryKey: ['/api/restaurants', tableId],
    queryFn: async () => {
      const response = await fetch(`/api/restaurants/${tableId}`);
      if (!response.ok) throw new Error('Failed to fetch restaurant');
      return response.json();
    },
  });

  const { data: menuItems, isLoading: isLoadingMenu } = useQuery<MenuItem[]>({
    queryKey: ['/api/restaurants', tableId, 'menu'],
    queryFn: async () => {
      const response = await fetch(`/api/restaurants/${tableId}/menu`);
      if (!response.ok) throw new Error('Failed to fetch menu items');
      return response.json();
    },
    enabled: !!restaurant,
  });

  const handleAddToCart = (
    item: MenuItem,
    quantity: number,
    customizations?: {
      excludeIngredients: string[];
      specialInstructions: string;
      selectedIngredients: Record<string, string[]>;
      selectedRadioOptions: Record<string, string>;
    }
  ) => {
    if (!user) {
      toast({
        title: "נדרשת התחברות",
        description: "יש להתחבר כדי להוסיף פריטים לסל",
        variant: "destructive",
      });
      return;
    }

    const cart = JSON.parse(localStorage.getItem(`cart-${user.uid}`) || "[]");
    const cartItem = {
      ...item,
      quantity,
      customizations: customizations || {
        excludeIngredients: [],
        specialInstructions: "",
        selectedIngredients: {},
        selectedRadioOptions: {},
      },
    };
    cart.push(cartItem);
    localStorage.setItem(`cart-${user.uid}`, JSON.stringify(cart));

    toast({
      title: "נוסף לסל",
      description: `${quantity}x ${item.name}${
        customizations?.excludeIngredients.length
          ? ` (ללא ${customizations.excludeIngredients.join(", ")})`
          : ""
      }`,
      onClick: () => location.href = `/personal/${tableId}`,
    });
  };

  const scrollToCategory = (category: string) => {
    const element = document.getElementById(`category-${category}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (isLoadingRestaurant || isLoadingMenu) {
    return (
      <div className="p-4 space-y-4" dir="rtl">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[300px] w-full" />
        ))}
      </div>
    );
  }

  if (!restaurant || !menuItems) {
    return (
      <div className="p-4 text-center" dir="rtl">
        <h1 className="text-2xl font-bold">מסעדה לא נמצאה</h1>
      </div>
    );
  }

  const categories = [...new Set(menuItems.map(item => item.category))];

  return (
    <div className="min-h-screen pb-20" dir="rtl">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="flex justify-between items-center max-w-4xl mx-auto p-4">
          <div>
            <h1 className="text-2xl font-bold">{restaurant.name}</h1>
            <p className="text-muted-foreground">{restaurant.description}</p>
          </div>

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
                .filter(item => item.category === category)
                .map(item => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onAddToCart={handleAddToCart}
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