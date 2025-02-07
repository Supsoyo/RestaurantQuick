import { useState, useEffect } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface CallWaiterButtonProps {
  tableId: string;
}

export default function CallWaiterButton({ tableId }: CallWaiterButtonProps) {
  const { toast } = useToast();
  const [isWaiterCalled, setIsWaiterCalled] = useState(false);

  // Check if waiter was already called for this table
  useEffect(() => {
    const waiterCalls = JSON.parse(localStorage.getItem('waiterCalls') || '{}');
    setIsWaiterCalled(!!waiterCalls[tableId]);
  }, [tableId]);

  const handleCallWaiter = () => {
    const waiterCalls = JSON.parse(localStorage.getItem('waiterCalls') || '{}');
    
    if (isWaiterCalled) {
      delete waiterCalls[tableId];
      localStorage.setItem('waiterCalls', JSON.stringify(waiterCalls));
      setIsWaiterCalled(false);
      toast({
        title: "Waiter call cancelled",
        description: "Your waiter call has been cancelled.",
      });
    } else {
      waiterCalls[tableId] = new Date().toISOString();
      localStorage.setItem('waiterCalls', JSON.stringify(waiterCalls));
      setIsWaiterCalled(true);
      toast({
        title: "Waiter called",
        description: "A waiter will be with you shortly.",
      });

      // Auto-cancel after 5 minutes (simulating waiter arrival)
      setTimeout(() => {
        const currentCalls = JSON.parse(localStorage.getItem('waiterCalls') || '{}');
        delete currentCalls[tableId];
        localStorage.setItem('waiterCalls', JSON.stringify(currentCalls));
        setIsWaiterCalled(false);
      }, 5 * 60 * 1000);
    }
  };

  return (
    <Button
      variant={isWaiterCalled ? "destructive" : "default"}
      size="icon"
      onClick={handleCallWaiter}
      className="relative"
    >
      {isWaiterCalled ? (
        <BellRing className="h-5 w-5" />
      ) : (
        <Bell className="h-5 w-5" />
      )}
      {isWaiterCalled && (
        <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full animate-pulse" />
      )}
    </Button>
  );
}
