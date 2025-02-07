import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
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
    <Card className="overflow-hidden">
      <div className="aspect-video relative">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="object-cover w-full h-full"
        />
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{item.name}</h3>
          <span className="font-medium text-primary">
            ${Number(item.price).toFixed(2)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{item.description}</p>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(quantity + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <Button 
          className="flex-1"
          onClick={() => onAddToCart(quantity)}
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
