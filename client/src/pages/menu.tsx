import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import MenuItemCard from "@/components/menu-item-card";
import CallWaiterButton from "@/components/call-waiter-button";
import { type MenuItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Menu() {
  const { tableId } = useParams();
  const { toast } = useToast();

  const { data: menuItems, isLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu"],
  });

  const handleAddToCart = (item: MenuItem, quantity: number) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push({ ...item, quantity });
    localStorage.setItem("cart", JSON.stringify(cart));

    toast({
      title: "Added to cart",
      description: `${quantity}x ${item.name}`,
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[300px] w-full" />
        ))}
      </div>
    );
  }

  const categories = [...new Set(menuItems?.map(item => item.category))];

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b p-4">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">Menu</h1>
          <Link href={`/cart/${tableId}`}>
            <Button variant="outline" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto space-y-8">
        {categories.map(category => (
          <section key={category}>
            <h2 className="text-xl font-semibold mb-4">{category}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {menuItems
                ?.filter(item => item.category === category)
                .map(item => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onAddToCart={(quantity) => handleAddToCart(item, quantity)}
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