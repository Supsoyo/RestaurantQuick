import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // If user is already logged in, redirect to home
  if (user) {
    setLocation("/");
    return null;
  }

  const login = () => {
    window.location.href = `https://replit.com/auth_with_repl_site?domain=${window.location.hostname}`;
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
            onClick={login}
          >
            התחבר עם Replit
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}