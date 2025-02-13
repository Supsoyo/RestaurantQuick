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
import { type MenuItem } from "@shared/schema";
import { Separator } from "@/components/ui/separator";

interface MealCustomizationDialogProps {
  item: MenuItem;
  open: boolean;
  onClose: () => void;
  onConfirm: (customizations: { 
    excludeIngredients: string[];
    specialInstructions: string;
    selectedToppings: Array<{ name: string, price: string }>;
    selectedSide?: { name: string, price: string };
    selectedDrink?: { name: string, price: string };
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
  const [selectedToppings, setSelectedToppings] = useState<Array<{ name: string, price: string }>>([]);
  const [selectedSide, setSelectedSide] = useState<{ name: string, price: string } | undefined>();
  const [selectedDrink, setSelectedDrink] = useState<{ name: string, price: string } | undefined>();

  // Extract ingredients from the description
  const ingredients = item.description.split(',').map(i => i.trim());

  const handleConfirm = () => {
    onConfirm({
      excludeIngredients,
      specialInstructions,
      selectedToppings,
      selectedSide,
      selectedDrink,
    });
    onClose();
  };

  const calculateTotal = () => {
    let total = Number(item.price);
    selectedToppings.forEach(topping => {
      total += Number(topping.price);
    });
    if (selectedSide) {
      total += Number(selectedSide.price);
    }
    if (selectedDrink) {
      total += Number(selectedDrink.price);
    }
    return total.toFixed(2);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>התאמה אישית - {item.name}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Original ingredients section */}
          <div className="space-y-4">
            <Label>הסר רכיבים:</Label>
            {ingredients.map((ingredient) => (
              <div key={ingredient} className="flex items-center space-x-2 space-x-reverse">
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

          {/* Toppings section */}
          {item.customizationOptions?.toppings && (
            <>
              <Separator />
              <div className="space-y-4">
                <Label>תוספות:</Label>
                {item.customizationOptions.toppings.map((topping) => (
                  <div key={topping.name} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`topping-${topping.name}`}
                      checked={selectedToppings.some(t => t.name === topping.name)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedToppings([...selectedToppings, topping]);
                        } else {
                          setSelectedToppings(
                            selectedToppings.filter((t) => t.name !== topping.name)
                          );
                        }
                      }}
                    />
                    <Label htmlFor={`topping-${topping.name}`} className="mr-2 flex-1">
                      {topping.name}
                    </Label>
                    <span className="text-muted-foreground">₪{topping.price}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Sides section */}
          {item.customizationOptions?.sides && (
            <>
              <Separator />
              <div className="space-y-4">
                <Label>תוספת בצד:</Label>
                {item.customizationOptions.sides.map((side) => (
                  <div key={side.name} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`side-${side.name}`}
                      checked={selectedSide?.name === side.name}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedSide(side);
                        } else {
                          setSelectedSide(undefined);
                        }
                      }}
                    />
                    <Label htmlFor={`side-${side.name}`} className="mr-2 flex-1">
                      {side.name}
                    </Label>
                    <span className="text-muted-foreground">₪{side.price}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Drinks section */}
          {item.customizationOptions?.drinks && (
            <>
              <Separator />
              <div className="space-y-4">
                <Label>שתייה:</Label>
                {item.customizationOptions.drinks.map((drink) => (
                  <div key={drink.name} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`drink-${drink.name}`}
                      checked={selectedDrink?.name === drink.name}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedDrink(drink);
                        } else {
                          setSelectedDrink(undefined);
                        }
                      }}
                    />
                    <Label htmlFor={`drink-${drink.name}`} className="mr-2 flex-1">
                      {drink.name}
                    </Label>
                    <span className="text-muted-foreground">₪{drink.price}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>הערות מיוחדות:</Label>
            <Textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="הוסף הערות מיוחדות כאן..."
              className="resize-none"
            />
          </div>

          <div className="text-right font-medium">
            סה"כ: ₪{calculateTotal()}
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