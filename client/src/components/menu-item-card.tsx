import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type MenuItem } from '@shared/schema';
import { Minus, Plus } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (quantity: number) => void;
}

export default function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  const [quantity, setQuantity] = useState(1);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4 p-4">
        <div className="w-24 h-24 relative flex-shrink-0">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="object-cover w-full h-full rounded"
          />
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-lg">{item.name}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <span className="font-bold text-lg">
              ₪{Number(item.price).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button 
              variant="secondary"
              className="px-6"
              onClick={() => onAddToCart(quantity)}
            >
              הוסף להזמנה
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}