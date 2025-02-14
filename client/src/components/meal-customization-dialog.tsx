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
    selectedCheckListItems: { [key: string]: string[] };
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
  const [selectedCheckListItems, setSelectedCheckListItems] = useState<{ [key: string]: string[] }>({});

  // Extract ingredients from the description
  const ingredients = item.description.split(',').map(i => i.trim());

  const handleConfirm = () => {
    onConfirm({
      excludeIngredients,
      specialInstructions,
      selectedCheckListItems,
    });
    onClose();
  };

  const handleCheckListItemToggle = (listName: string, itemValue: string) => {
    setSelectedCheckListItems(prev => {
      const currentList = prev[listName] || [];
      const newList = currentList.includes(itemValue)
        ? currentList.filter(item => item !== itemValue)
        : [...currentList, itemValue];

      return {
        ...prev,
        [listName]: newList
      };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>התאמה אישית - {item.name}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Ingredients Section */}
          <div className="space-y-4">
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

          <Separator className="my-4" />

          {/* CheckLists Section */}
          {item.checkLists && Object.entries(item.checkLists).map(([listName, options]) => (
            <div key={listName} className="space-y-4">
              <Label>{listName}:</Label>
              {options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${listName}-${option}`}
                    checked={(selectedCheckListItems[listName] || []).includes(option)}
                    onCheckedChange={(checked) => {
                      handleCheckListItemToggle(listName, option);
                    }}
                  />
                  <Label htmlFor={`${listName}-${option}`} className="mr-2">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          ))}

          <Separator className="my-4" />

          {/* Special Instructions Section */}
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