import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useLocation, useSearch } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearch();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "auth_failed") {
      toast({
        title: "Authentication Failed",
        description: "Unable to sign in. Please try again.",
        variant: "destructive",
      });
    }
  }, [searchParams, toast]);

  // If user is already logged in, redirect to home
  if (user) {
    setLocation("/");
    return null;
  }

  const handleLogin = () => {
    window.location.href = "/api/auth/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>התחברות למערכת</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="default"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleLogin}
          >
            התחבר עם Replit
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}