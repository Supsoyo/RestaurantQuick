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
    <div className="f bg-background p-4 flex flex-col items-center justify-center overflow-hidden">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 space-y-6 text-center">
          <h1 className="text-4xl font-bold text-center ">
            ברוכים הבאים

          
          
          </h1>
          <h1 className="text-3xl font-bold text-center ">
            
          
            ל[שם העסק]
          </h1>

          <Avatar className="h-72 w-72 mx-auto">
            <AvatarFallback className="bg-primary/10">
              <User className="h-16 w-16 text-primary" />
            </AvatarFallback>
          </Avatar>

          <div className="space-y-3 ">
            {/* <h1 className="font-bold text-center ">
              הכנס את שמך


            </h1> */}
            <h1 className="text-2xl font-bold text-black mb-4">הכנס את שמך</h1> {/* New h1 tag */}

            <Input
              type="text"
              placeholder=""
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-center rounded-full font-bold text-black placeholder-red-400 text-2xl"
            />

            {showScanner ? (
              <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
            ) : (
      <div className="space-y-8 ">
              <Button 
                className="w-52 rounded-full" 
                onClick={() => {
                  if (name.trim()) {
                    localStorage.setItem("customerName", name.trim());
                  }
                  setLocation(`/menu/12`);
                }}
                disabled={!name.trim()}
              >
                התחל הזמנה
              </Button>
        </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}