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

interface CallWaiterButtonProps {
  tableId: string;
}

export default function CallWaiterButton({ tableId }: CallWaiterButtonProps) {
  const [calling, setCalling] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const handleCallWaiter = () => {
    setCalling(true);

    // Store the call in localStorage with a timestamp and reason
    const calls = JSON.parse(localStorage.getItem("waiterCalls") || "{}");
    calls[tableId] = {
      timestamp: new Date().toISOString(),
      reason: reason.trim(),
    };
    localStorage.setItem("waiterCalls", JSON.stringify(calls));

    // Show success message
    toast({
      title: "המלצר בדרך",
      description: "המלצר יגיע בהקדם.",
    });

    // Close dialog and reset form
    setShowDialog(false);
    setReason("");

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
            <div className="space-y-2">
              <Label>במה נוכל לעזור?</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="לדוגמה: צריך תוספת סכו״ם, רוצה להזמין קינוח..."
                className="resize-none"
              />
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
              disabled={!reason.trim()}
            >
              קרא למלצר
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}