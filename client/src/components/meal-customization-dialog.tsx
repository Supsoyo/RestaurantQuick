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
  const [ingredientQuantities, setIngredientQuantities] = useState<Record<string, Record<string, number>>>(() => {
    const initial: Record<string, Record<string, number>> = {};
    item.checkLists?.forEach(checklist => {
      initial[checklist.name] = {};
      console.log(JSON.stringify(item));
      checklist.possibleIngredients.forEach(ingredient => {
        initial[checklist.name][ingredient.name] = 0;
      });
    });
    return initial;
  });
  const [selectedRadioOptions, setSelectedRadioOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    item.radioLists?.forEach(radioList => {
      // Select first option by default
      initial[radioList.name] = radioList.options[0].name || '';
    });
    return initial;
  });

  // Extract ingredients from the description
  const ingredients = item.description.split(',').map(i => i.trim());

  const updateIngredientQuantity = (checklistName: string, ingredient: string, delta: number) => {
    setIngredientQuantities(prev => {
      const checklist = item.checkLists.find(c => c.name === checklistName);
      if (!checklist) return prev;

      const ingredientDef = checklist.possibleIngredients.find(i => i.name === ingredient);
      if (!ingredientDef) return prev;

      const currentQty = prev[checklistName][ingredient] || 0;
      const newQty = Math.max(0, currentQty + delta);

      // Check if new quantity would exceed ingredient's max amount
      if (newQty > ingredientDef.maxAmount) return prev;

      // Check if new quantity would exceed checklist's total amount
      const currentTotal = Object.values(prev[checklistName]).reduce((sum, qty) => sum + qty, 0);
      const newTotal = currentTotal + delta;
      if (newTotal > checklist.amount) return prev;

      return {
        ...prev,
        [checklistName]: {
          ...prev[checklistName],
          [ingredient]: newQty
        }
      };
    });
  };

  const handleConfirm = () => {
    // Convert quantities to selected ingredients array format
    const selectedIngredients: Record<string, string[]> = {};
    Object.entries(ingredientQuantities).forEach(([checklistName, ingredients]) => {
      selectedIngredients[checklistName] = Object.entries(ingredients).flatMap(
        ([ingredient, qty]) => Array(qty).fill(ingredient)
      );
    });

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
    setIngredientQuantities(() => {
      const initial: Record<string, Record<string, number>> = {};
      item.checkLists?.forEach(checklist => {
        initial[checklist.name] = {};
        checklist.possibleIngredients.forEach(ingredient => {
          initial[checklist.name][ingredient.name] = 0;
        });
      });
      return initial;
    });
    setSelectedRadioOptions(() => {
      const initial: Record<string, string> = {};
      item.radioLists?.forEach(radioList => {
        initial[radioList.name] = radioList.options[0].name || '';
      });
      return initial;
    });
    onClose();
  };

  const addDrinkFirst = () => {
    if (!specialInstructions.includes('הגש משקה ראשון בבקשה')){
    const newInstructions = specialInstructions.trim()
      ? `${specialInstructions.trim()}\n הגש משקה ראשון בבקשה`
      : "הגש משקה ראשון בבקשה";
    setSpecialInstructions(newInstructions);
  };
  }
  // Calculate additional cost from selected ingredients and radio options
  const calculateAdditionalCost = () => {
    let additionalCost = 0;

    // Calculate cost from checklist selections
    Object.entries(ingredientQuantities).forEach(([checklistName, ingredients]) => {
      const checklist = item.checkLists.find(c => c.name === checklistName);
      if (checklist) {
        Object.entries(ingredients).forEach(([ingredientName, qty]) => {
          const ingredient = checklist.possibleIngredients.find(i => i.name === ingredientName);
          if (ingredient) {
            additionalCost += Number(ingredient.price) * qty;
          }
        });
      }
    });

    // Calculate cost from radio selections
    Object.entries(selectedRadioOptions).forEach(([radioListName, selectedOption]) => {
      const radioList = item.radioLists.find(r => r.name === radioListName);
      if (radioList) {
        const option = radioList.options.find(o => o.name === selectedOption);
        if (option) {
          additionalCost += Number(option.price);
        }
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
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateIngredientQuantity(checklist.name, ingredient.name, -1)}
                        disabled={!ingredientQuantities[checklist.name][ingredient.name]}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center">
                        {ingredientQuantities[checklist.name][ingredient.name]}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateIngredientQuantity(checklist.name, ingredient.name, 1)}
                        disabled={
                          ingredientQuantities[checklist.name][ingredient.name] >= ingredient.maxAmount ||
                          Object.values(ingredientQuantities[checklist.name]).reduce((sum, qty) => sum + qty, 0) >= checklist.amount
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Label className="mr-2">
                      {ingredient.name}
                    </Label>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ₪{Number(ingredient.price).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="text-sm text-muted-foreground">
                נבחרו {Object.values(ingredientQuantities[checklist.name]).reduce((sum, qty) => sum + qty, 0)} מתוך {checklist.amount}
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
                  <div key={option.name} className="flex items-center justify-between" dir="rtl">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={option.name}
                        id={`${radioList.name}-${option.name}`}
                        className="w-7 h-7 rounded-full"
                      />
                      <Label htmlFor={`${radioList.name}-${option.name}`} className="mr-2">
                        {option.name}
                      </Label>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {Number(option.price) > 0 && `₪${Number(option.price).toFixed(2)}`}
                    </span>
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