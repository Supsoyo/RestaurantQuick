import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type MenuItem } from '@shared/schema';
import MealCustomizationDialog from './meal-customization-dialog';
import { useAuth } from '@/contexts/auth-context';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem,
    quantity: number,
    customizations?: {
      excludeIngredients: string[];
      specialInstructions: string;
      selectedIngredients: Record<string, string[]>;
      selectedRadioOptions: Record<string, string>;
  }) => void;
}

export default function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  const [showCustomization, setShowCustomization] = useState(false);
  const { user } = useAuth();

  const handleAddToCart = (customizations: { 
    excludeIngredients: string[];
    specialInstructions: string;
    selectedIngredients: Record<string, string[]>;
    selectedRadioOptions: Record<string, string>;
    quantity: number;
  }) => {
    // Get existing cart items for this user
    const existingCart = JSON.parse(localStorage.getItem(`cart-${user?.uid}`) || '[]');

    // Add new item to cart
    const newItem = {
      ...item,
      quantity: customizations.quantity,
      customizations: {
        excludeIngredients: customizations.excludeIngredients,
        specialInstructions: customizations.specialInstructions,
        selectedIngredients: customizations.selectedIngredients,
        selectedRadioOptions: customizations.selectedRadioOptions,
      }
    };

    // Update cart in localStorage
    localStorage.setItem(`cart-${user?.uid}`, JSON.stringify([...existingCart, newItem]));

    // Call the original onAddToCart
    onAddToCart(
      item,
      customizations.quantity,
      {
        excludeIngredients: customizations.excludeIngredients,
        specialInstructions: customizations.specialInstructions,
        selectedIngredients: customizations.selectedIngredients,
        selectedRadioOptions: customizations.selectedRadioOptions,
      }
    );
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
      <Card className="flex-1 overflow-visible hover:shadow-lg transition-shadow w-24 max-w-md mx-auto rounded-none h-full">
        <div className="flex items-center gap-0 p-2">
          <div className="flex-1">
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

            <div className="flex justify-end mt-4">
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
        onConfirm={handleAddToCart}
      />
    </div>
  );
}