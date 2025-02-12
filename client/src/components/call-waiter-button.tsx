import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface CallWaiterButtonProps {
  tableId: string;
}

const SERVICE_OPTIONS = [
  { id: "napkins", label: "בקשת מפיות נוספות" },
  { id: "utensils", label: "בקשת סכו\"ם נוסף" },
  { id: "cleaning", label: "ניקוי השולחן" },
  { id: "bill", label: "בקשת חשבון" },
  { id: "order", label: "הזמנה נוספת" },
  { id: "other", label: "בקשה אחרת" },
];

export default function CallWaiterButton({ tableId }: CallWaiterButtonProps) {
  const [calling, setCalling] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [customReason, setCustomReason] = useState("");
  const { toast } = useToast();

  const handleCallWaiter = () => {
    setCalling(true);

    const finalReason = selectedOption === "other" 
      ? customReason.trim()
      : SERVICE_OPTIONS.find(option => option.id === selectedOption)?.label || "";

    // Store the call in localStorage with a timestamp and reason
    const calls = JSON.parse(localStorage.getItem("waiterCalls") || "{}");
    calls[tableId] = {
      timestamp: new Date().toISOString(),
      reason: finalReason,
    };
    localStorage.setItem("waiterCalls", JSON.stringify(calls));

    // Show success message
    toast({
      title: "המלצר בדרך",
      description: "המלצר יגיע בהקדם.",
    });

    // Close dialog and reset form
    setShowDialog(false);
    setSelectedOption("");
    setCustomReason("");

    // Reset button after 30 seconds
    setTimeout(() => {
      setCalling(false);
    }, 30000);
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground z-50"
        onClick={() => setShowDialog(true)}
        disabled={calling}
      >
        <Bell className={`h-6 w-6 ${calling ? 'animate-bounce' : ''}`} />
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>קריאה למלצר</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <Label>במה נוכל לעזור?</Label>
              <RadioGroup 
                value={selectedOption} 
                onValueChange={setSelectedOption}
                className="gap-3"
              >
                {SERVICE_OPTIONS.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id}>{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>

              {selectedOption === "other" && (
                <div className="space-y-2">
                  <Label>פרט את בקשתך:</Label>
                  <Textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="הסבר במה המלצר יכול לעזור..."
                    className="resize-none"
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowDialog(false)}
            >
              ביטול
            </Button>
            <Button 
              type="button" 
              onClick={handleCallWaiter}
              disabled={!selectedOption || (selectedOption === "other" && !customReason.trim())}
            >
              קרא למלצר
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}