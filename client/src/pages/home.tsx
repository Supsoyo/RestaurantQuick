import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import QRScanner from "@/components/qr-scanner";

export default function Home() {
  const [showScanner, setShowScanner] = useState(false);
  const [name, setName] = useState("");
  const [, setLocation] = useLocation();

  const handleScan = (tableId: string) => {
    if (name.trim()) {
      localStorage.setItem("customerName", name.trim());
    }
    setLocation(`/menu/${tableId}`);
  };

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 space-y-6 text-center">
          <h1 className="text-3xl font-bold text-center text-primary">
            Welcome to Our Restaurant
          </h1>

          <Avatar className="h-32 w-32 mx-auto">
            <AvatarFallback className="bg-primary/10">
              <User className="h-16 w-16 text-primary" />
            </AvatarFallback>
          </Avatar>

          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-center"
            />

            {showScanner ? (
              <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
            ) : (
              <Button 
                className="w-full" 
                onClick={() => setShowScanner(true)}
                disabled={!name.trim()}
              >
                Start Ordering
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}