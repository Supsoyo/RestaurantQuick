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
import { type MenuItem } from "@shared/schema";
import { Minus, Plus } from "lucide-react";

interface MealCustomizationDialogProps {
  item: MenuItem;
  open: boolean;
  onClose: () => void;
  onConfirm: (customizations: { 
    excludeIngredients: string[];
    specialInstructions: string;
    selectedIngredients: Record<string, string[]>;
    selectedRadioOptions: Record<string, string>;
    quantity: number;
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
  const [quantity, setQuantity] = useState(1);
  const [selectedIngredients, setSelectedIngredients] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    item.checkLists?.forEach(checklist => {
      initial[checklist.name] = [];
    });
    return initial;
  });
  const [selectedRadioOptions, setSelectedRadioOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    item.radioLists?.forEach(radioList => {
      initial[radioList.name] = radioList.options[0] || ''; // Select first option by default
    });
    return initial;
  });

  // Extract ingredients from the description
  const ingredients = item.description.split(',').map(i => i.trim());

  const toggleIngredient = (checklistName: string, ingredient: string, ingredientPrice: string, maxAmount: number) => {
    setSelectedIngredients(prev => {
      const current = prev[checklistName] || [];
      const checklist = item.checkLists.find(c => c.name === checklistName);

      if (!checklist) return prev;

      // If ingredient is already selected, remove it
      if (current.includes(ingredient)) {
        return {
          ...prev,
          [checklistName]: current.filter(i => i !== ingredient)
        };
      }

      // Check if adding this ingredient would exceed the maximum amount for this ingredient
      const currentIngredientCount = current.filter(i => i === ingredient).length;
      if (currentIngredientCount >= maxAmount) {
        return prev;
      }

      // Check if adding this ingredient would exceed the checklist's total amount
      if (current.length >= checklist.amount) {
        return prev;
      }

      // Add the ingredient
      return {
        ...prev,
        [checklistName]: [...current, ingredient]
      };
    });
  };

  const handleConfirm = () => {
    onConfirm({
      excludeIngredients,
      specialInstructions,
      selectedIngredients,
      selectedRadioOptions,
      quantity,
    });
    // Reset state after confirming
    setQuantity(1);
    setExcludeIngredients([]);
    setSpecialInstructions("");
    setSelectedIngredients(() => {
      const initial: Record<string, string[]> = {};
      item.checkLists?.forEach(checklist => {
        initial[checklist.name] = [];
      });
      return initial;
    });
    setSelectedRadioOptions(() => {
      const initial: Record<string, string> = {};
      item.radioLists?.forEach(radioList => {
        initial[radioList.name] = radioList.options[0] || '';
      });
      return initial;
    });
    onClose();
  };

  const addDrinkFirst = () => {
    const newInstructions = specialInstructions.trim()
      ? `${specialInstructions.trim()}, drink first`
      : "drink first";
    setSpecialInstructions(newInstructions);
  };

  // Calculate additional cost from selected ingredients
  const calculateAdditionalCost = () => {
    let additionalCost = 0;
    Object.entries(selectedIngredients).forEach(([checklistName, ingredients]) => {
      const checklist = item.checkLists.find(c => c.name === checklistName);
      if (checklist) {
        ingredients.forEach(ingredientName => {
          const ingredient = checklist.possibleIngredients.find(i => i.name === ingredientName);
          if (ingredient) {
            additionalCost += Number(ingredient.price);
          }
        });
      }
    });
    return additionalCost;
  };

  const additionalCost = calculateAdditionalCost();
  const basePrice = Number(item.price);
  const totalPrice = (basePrice + additionalCost) * quantity;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-center">{item.name}</DialogTitle>
          <div className="py-4">
            <DialogTitle className="text-right">התאמה אישית:</DialogTitle>
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex justify-between items-center">
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
            <div className="text-lg font-semibold">
              סה"כ: ₪{totalPrice.toFixed(2)}
              {additionalCost > 0 && (
                <span className="text-sm text-muted-foreground block">
                  (כולל תוספות: ₪{additionalCost.toFixed(2)})
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Label>הסר רכיבים:</Label>
            {ingredients.map((ingredient) => (
              <div key={ingredient} className="flex items-center space-x-2">
                <Checkbox
                  id={`exclude-${ingredient}`}
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
                <Label htmlFor={`exclude-${ingredient}`} className="mr-2">
                  {ingredient}
                </Label>
              </div>
            ))}
          </div>

          {item.checkLists?.map((checklist, index) => (
            <div key={index} className="space-y-4">
              <Label>
                {checklist.name} (בחר עד {checklist.amount}):
              </Label>
              {checklist.possibleIngredients.map((ingredient) => (
                <div key={ingredient.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${checklist.name}-${ingredient.name}`}
                      checked={selectedIngredients[checklist.name]?.includes(ingredient.name)}
                      onCheckedChange={() => toggleIngredient(checklist.name, ingredient.name, ingredient.price, ingredient.maxAmount)}
                      className="w-7 h-7 rounded-full"
                    />
                    <Label htmlFor={`${checklist.name}-${ingredient.name}`} className="mr-2">
                      {ingredient.name}
                    </Label>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ₪{Number(ingredient.price).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="text-sm text-muted-foreground">
                נבחרו {selectedIngredients[checklist.name]?.length || 0} מתוך {checklist.amount}
              </div>
            </div>
          ))}

          {item.radioLists?.map((radioList, index) => (
            <div key={index} className="space-y-4">
              <Label>{radioList.name}:</Label>
              <RadioGroup
                value={selectedRadioOptions[radioList.name]}
                onValueChange={(value) => 
                  setSelectedRadioOptions(prev => ({
                    ...prev,
                    [radioList.name]: value
                  }))
                }
              >
                {radioList.options.map((option) => (
                  <div key={option} className="flex items-center space-x-2" dir="rtl">
                    <RadioGroupItem
                      value={option}
                      id={`${radioList.name}-${option}`}
                      className="w-7 h-7 rounded-full"
                    />
                    <Label htmlFor={`${radioList.name}-${option}`} className="mr-2">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>הערות מיוחדות:</Label>
              <Button 
                variant="outline" 
                size="sm"
                onClick={addDrinkFirst}
                type="button"
              >
                הגש משקה ראשון
              </Button>
            </div>
            <Textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="הוסף הערות מיוחדות כאן..."
              className="resize-none"
            />
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
            הוסף להזמנה
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}