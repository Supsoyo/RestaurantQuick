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

  const toggleIngredient = (checklistName: string, ingredient: string) => {
    setSelectedIngredients(prev => {
      const current = prev[checklistName] || [];
      const updated = current.includes(ingredient)
        ? current.filter(i => i !== ingredient)
        : [...current, ingredient];
      return { ...prev, [checklistName]: updated };
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

  const totalPrice = Number(item.price) * quantity;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>התאמה אישית - {item.name}</DialogTitle>
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
              <Label>{checklist.name}:</Label>
              {checklist.possibleIngredients.map((ingredient) => (
                <div key={ingredient} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${checklist.name}-${ingredient}`}
                    checked={selectedIngredients[checklist.name]?.includes(ingredient)}
                    onCheckedChange={() => toggleIngredient(checklist.name, ingredient)}
                  />
                  <Label htmlFor={`${checklist.name}-${ingredient}`} className="mr-2">
                    {ingredient}
                  </Label>
                </div>
              ))}
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
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option}
                      id={`${radioList.name}-${option}`}
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