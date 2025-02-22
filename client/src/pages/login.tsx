import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signInWithGoogle } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // If user is already logged in, redirect to home
  if (user) {
    setLocation("/");
    return null;
  }
  console.log(window.location.href);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      setLocation("/");
    } catch (error) {
      console.error("Failed to sign in:", error);
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
