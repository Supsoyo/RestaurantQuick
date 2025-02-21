import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, MapPin, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Restaurant } from "@shared/schema";

export default function Home() {
  const [name, setName] = useState("");
  const [, setLocation] = useLocation();

  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ['/api/restaurants'],
    queryFn: async () => {
      const response = await fetch('/api/restaurants');
      if (!response.ok) throw new Error('Failed to fetch restaurants');
      return response.json() as Promise<Restaurant[]>;
    },
  });

  const handleRestaurantSelect = (restaurantId: number) => {
    if (name.trim()) {
      localStorage.setItem("customerName", name.trim());
    }
    setLocation(`/menu/${restaurantId}`);
  };

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col" dir="rtl">
      <div className="max-w-xl mx-auto w-full">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">ברוכים הבאים</h1>
          <p className="text-muted-foreground">בחר מסעדה והזמן בקלות</p>
        </header>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-4">הכנס את שמך</h2>
          <Input
            type="text"
            placeholder="השם שלך"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-center rounded-full font-bold text-xl"
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">מסעדות</h2>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                אין מסעדות זמינות כרגע
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {restaurants.map((restaurant) => (
                <Card
                  key={restaurant.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleRestaurantSelect(restaurant.id)}
                >
                  <CardContent className="p-4 flex gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={restaurant.imageUrl} alt={restaurant.name} />
                      <AvatarFallback>
                        <User className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{restaurant.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{restaurant.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {restaurant.address}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          פתוח
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}