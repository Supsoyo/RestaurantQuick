import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type MenuItem } from '@shared/schema';
import { Minus, Plus } from 'lucide-react';
import MealCustomizationDialog from './meal-customization-dialog';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem ,
    quantity: number,
    customizations?: {
      excludeIngredients: string[];
      specialInstructions: string;

  }) => void;
}

export default function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [showCustomization, setShowCustomization] = useState(false);

  const handleAddToCart = (item: MenuItem, quantity: number, customizations?: { 
    excludeIngredients: string[];
    specialInstructions: string;
  }) => {
    console.log("vsdvdv 27 ",quantity);  // Should output the correct quantity
    // onAddToCart(item, quantity, customizations);
    // console.log(` menu item catd Item: ${item.name}, Quantity: ${quantity.toString()}`);
    try {
      // console.log("line 30 Quantity:");
    } catch (error) {
      console.error("line 30 Error accessing quantity:", error);
    }
    // const newItem = {
    //   ...item,
    //   quantity,  // Quantity should be a number
    //   customizations // Optional customizations
    // };
    onAddToCart(
      item,
      quantity,
      customizations,
    );
    setQuantity(1);
  };

  return (
    <div className="flex w-full flex-wrap items-center gap-0 p-0 max-w-md mx-auto">
      <div className="w-28 h-full relative flex-shrink-0">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="object-cover w-full h-full"
          onClick={() => setShowCustomization(true)}
        />
      </div>
      <Card className="flex-1 overflow-visible hover:shadow-lg transition-shadow w-24 max-w-md mx-auto rounded-none h-full"
        >
        <div className="flex items-center gap-0 p-2"
          >
          <div className="flex-1"
            >
            <div className="flex justify-between items-start mb-2"
              onClick={() => setShowCustomization(true)}>
              <div>
                <h3 className="font-bold text-lg">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <span className="font-bold text-lg">
                ₪{Number(item.price).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center gap-0">
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
                className="px-6 p-2"
                onClick={() => setShowCustomization(true)}
              >
                הוסף להזמנה
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <MealCustomizationDialog
        item={item}
        open={showCustomization}
        onClose={() => setShowCustomization(false)}
        onConfirm={(customizations) => handleAddToCart(item, quantity,customizations)}
      />
    </div>
  );
}