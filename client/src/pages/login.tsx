import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signInWithGoogle } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";
import { FcGoogle } from "react-icons/fc";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // If user is already logged in, redirect to home
  if (user) {
    setLocation("/");
    return null;
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      setLocation("/");
    } catch (error) {
      console.error("Failed to sign in:", error);
      toast({
        title: "Authentication Failed",
        description: "Unable to sign in with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>התחברות למערכת</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGoogleSignIn}
          >
            <FcGoogle className="h-5 w-5" />
            התחבר עם Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}