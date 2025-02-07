import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CallWaiterButtonProps {
  tableId: string;
}

export default function CallWaiterButton({ tableId }: CallWaiterButtonProps) {
  const [calling, setCalling] = useState(false);
  const { toast } = useToast();

  const handleCallWaiter = () => {
    setCalling(true);

    // Store the call in localStorage with a timestamp
    const calls = JSON.parse(localStorage.getItem("waiterCalls") || "{}");
    calls[tableId] = new Date().toISOString();
    localStorage.setItem("waiterCalls", JSON.stringify(calls));

    // Show success message
    toast({
      title: "Waiter Called",
      description: "A waiter will be with you shortly.",
    });

    // Reset button after 30 seconds
    setTimeout(() => {
      setCalling(false);
    }, 30000);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg bg-background hover:bg-primary hover:text-primary-foreground"
      onClick={handleCallWaiter}
      disabled={calling}
    >
      <Bell className={`h-6 w-6 ${calling ? 'animate-bounce' : ''}`} />
    </Button>
  );
}
