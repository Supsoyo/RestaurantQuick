import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QRScanner from "@/components/qr-scanner";

export default function Home() {
  const [showScanner, setShowScanner] = useState(false);
  const [, setLocation] = useLocation();

  const handleScan = (tableId: string) => {
    setLocation(`/menu/${tableId}`);
  };

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 space-y-6">
          <h1 className="text-3xl font-bold text-center text-primary">
            Welcome to Our Restaurant
          </h1>
          
          <p className="text-center text-muted-foreground">
            Scan your table's QR code to start ordering
          </p>

          {showScanner ? (
            <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
          ) : (
            <Button 
              className="w-full" 
              onClick={() => setShowScanner(true)}
            >
              Scan QR Code
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
