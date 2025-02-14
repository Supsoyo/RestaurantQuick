import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { type MenuItem } from "@shared/schema";

// Mock data - In production, this would come from the backend
const CUSTOMIZATION_OPTIONS = {
  hamburger: {
    meatTypes: [
      { id: 'beef', label: 'בקר רגיל', price: 0 },
      { id: 'wagyu', label: 'בקר וואגיו', price: 30 },
      { id: 'lamb', label: 'כבש', price: 15 },
    ],
    bunTypes: [
      { id: 'regular', label: 'לחמניה רגילה', price: 0 },
      { id: 'pretzel', label: 'לחמניית בייגל', price: 5 },
      { id: 'gluten-free', label: 'ללא גלוטן', price: 8 },
    ],
    drinks: [
      { id: 'none', label: 'ללא שתייה', price: 0 },
      { id: 'cola', label: 'קולה', price: 12 },
      { id: 'sprite', label: 'ספרייט', price: 12 },
      { id: 'beer', label: 'בירה', price: 25 },
    ],
    toppings: [
      { id: 'cheese', label: 'גבינה', price: 5 },
      { id: 'egg', label: 'ביצת עין', price: 8 },
      { id: 'bacon', label: 'בייקון', price: 10 },
      { id: 'avocado', label: 'אבוקדו', price: 8 },
      { id: 'mushrooms', label: 'פטריות', price: 6 },
    ],
  },
};

interface MealCustomizationDialogProps {
  item: MenuItem;
  open: boolean;
  onClose: () => void;
  onConfirm: (customizations: {
    excludeIngredients: string[];
    specialInstructions: string;
    selectedOptions: {
      meatType?: string;
      bunType?: string;
      drink?: string;
      toppings: string[];
    };
    additionalPrice: number;
  }) => void;
}

export default function MealCustomizationDialog({
  item,
  open,
  onClose,
  onConfirm,
}: MealCustomizationDialogProps) {
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [excludeIngredients, setExcludeIngredients] = useState<string[]>([]);
  const [meatType, setMeatType] = useState(CUSTOMIZATION_OPTIONS.hamburger.meatTypes[0].id);
  const [bunType, setBunType] = useState(CUSTOMIZATION_OPTIONS.hamburger.bunTypes[0].id);
  const [drink, setDrink] = useState(CUSTOMIZATION_OPTIONS.hamburger.drinks[0].id);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);

  // Extract ingredients from the description
  const ingredients = item.description.split(',').map(i => i.trim());

  const calculateAdditionalPrice = () => {
    let total = 0;

    // Add meat type price
    const selectedMeat = CUSTOMIZATION_OPTIONS.hamburger.meatTypes.find(m => m.id === meatType);
    total += selectedMeat?.price || 0;

    // Add bun type price
    const selectedBun = CUSTOMIZATION_OPTIONS.hamburger.bunTypes.find(b => b.id === bunType);
    total += selectedBun?.price || 0;

    // Add drink price
    const selectedDrink = CUSTOMIZATION_OPTIONS.hamburger.drinks.find(d => d.id === drink);
    total += selectedDrink?.price || 0;

    // Add toppings prices
    selectedToppings.forEach(toppingId => {
      const topping = CUSTOMIZATION_OPTIONS.hamburger.toppings.find(t => t.id === toppingId);
      total += topping?.price || 0;
    });

    return total;
  };

  const handleConfirm = () => {
    onConfirm({
      excludeIngredients,
      specialInstructions,
      selectedOptions: {
        meatType,
        bunType,
        drink,
        toppings: selectedToppings,
      },
      additionalPrice: calculateAdditionalPrice(),
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>התאמה אישית - {item.name}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Meat Type Selection */}
          <div className="space-y-2">
            <Label>סוג בשר:</Label>
            <RadioGroup
              value={meatType}
              onValueChange={setMeatType}
              className="flex flex-col space-y-1"
            >
              {CUSTOMIZATION_OPTIONS.hamburger.meatTypes.map((meat) => (
                <div key={meat.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <RadioGroupItem value={meat.id} id={`meat-${meat.id}`} />
                    <Label htmlFor={`meat-${meat.id}`} className="mr-2">
                      {meat.label}
                    </Label>
                  </div>
                  {meat.price > 0 && <span>+₪{meat.price}</span>}
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Bun Type Selection */}
          <div className="space-y-2">
            <Label>סוג לחמנייה:</Label>
            <RadioGroup
              value={bunType}
              onValueChange={setBunType}
              className="flex flex-col space-y-1"
            >
              {CUSTOMIZATION_OPTIONS.hamburger.bunTypes.map((bun) => (
                <div key={bun.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <RadioGroupItem value={bun.id} id={`bun-${bun.id}`} />
                    <Label htmlFor={`bun-${bun.id}`} className="mr-2">
                      {bun.label}
                    </Label>
                  </div>
                  {bun.price > 0 && <span>+₪{bun.price}</span>}
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Drink Selection */}
          <div className="space-y-2">
            <Label>שתייה:</Label>
            <RadioGroup
              value={drink}
              onValueChange={setDrink}
              className="flex flex-col space-y-1"
            >
              {CUSTOMIZATION_OPTIONS.hamburger.drinks.map((drink) => (
                <div key={drink.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <RadioGroupItem value={drink.id} id={`drink-${drink.id}`} />
                    <Label htmlFor={`drink-${drink.id}`} className="mr-2">
                      {drink.label}
                    </Label>
                  </div>
                  {drink.price > 0 && <span>+₪{drink.price}</span>}
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Extra Toppings */}
          <div className="space-y-2">
            <Label>תוספות:</Label>
            <div className="space-y-2">
              {CUSTOMIZATION_OPTIONS.hamburger.toppings.map((topping) => (
                <div key={topping.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Checkbox
                      id={topping.id}
                      checked={selectedToppings.includes(topping.id)}
                      onCheckedChange={(checked) => {
                        setSelectedToppings(
                          checked
                            ? [...selectedToppings, topping.id]
                            : selectedToppings.filter((id) => id !== topping.id)
                        );
                      }}
                    />
                    <Label htmlFor={topping.id} className="mr-2">
                      {topping.label}
                    </Label>
                  </div>
                  <span>+₪{topping.price}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Remove Ingredients */}
          <div className="space-y-2">
            <Label>הסר רכיבים:</Label>
            {ingredients.map((ingredient) => (
              <div key={ingredient} className="flex items-center space-x-2">
                <Checkbox
                  id={ingredient}
                  checked={excludeIngredients.includes(ingredient)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setExcludeIngredients([...excludeIngredients, ingredient]);
                    } else {
                      setExcludeIngredients(
                        excludeIngredients.filter((i) => i !== ingredient)
                      );
                    }
                  }}
                />
                <Label htmlFor={ingredient} className="mr-2">
                  {ingredient}
                </Label>
              </div>
            ))}
          </div>

          {/* Special Instructions */}
          <div className="space-y-2">
            <Label>הערות מיוחדות:</Label>
            <Textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="הוסף הערות מיוחדות כאן..."
              className="resize-none"
            />
          </div>

          {/* Total Additional Price */}
          <div className="text-right font-medium">
            תוספת למחיר: ₪{calculateAdditionalPrice()}
          </div>
        </div>

        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            ביטול
          </Button>
          <Button type="button" onClick={handleConfirm}>
            אישור
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}