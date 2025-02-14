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

interface MealCustomizationDialogProps {
  item: MenuItem;
  open: boolean;
  onClose: () => void;
  onConfirm: (customizations: { 
    excludeIngredients: string[];
    specialInstructions: string;
    selectedIngredients: Record<string, string[]>;
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
  const [selectedIngredients, setSelectedIngredients] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    item.checkLists?.forEach(checklist => {
      initial[checklist.name] = [];
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

          <div className="space-y-2">
            <Label>הערות מיוחדות:</Label>
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
            אישור
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}