import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, ArrowLeft, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

export default function PaymentSuccess() {
  const { tableId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const paymentAmount = new URLSearchParams(window.location.search).get("amount") || "0";
  const [rating, setRating] = useState<string>("5");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedback: { tableId: number; rating: number; comment: string }) => {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      });
      if (!response.ok) throw new Error('Failed to submit feedback');
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "תודה על המשוב!",
        description: "המשוב שלך יעזור לנו להשתפר.",
      });
    },
    onError: () => {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשליחת המשוב. אנא נסה שוב.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitFeedback = () => {
    submitFeedbackMutation.mutate({
      tableId: Number(tableId),
      rating: Number(rating),
      comment: comment,
    });
  };

  return (
    <div className="min-h-screen p-4" dir="rtl">
      <header className="mb-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => setLocation(`/menu/${tableId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          חזרה לתפריט
        </Button>
      </header>

      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">התשלום בוצע בהצלחה!</h1>
            <p className="text-muted-foreground">
              שולם: ₪{Number(paymentAmount).toFixed(2)}
            </p>
          </div>

          {!submitted ? (
            <div className="space-y-4 text-right mb-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">נשמח לשמוע את דעתך!</h2>
                <div className="space-y-4">
                  <div>
                    <Label>איך היה האוכל? </Label>
                    <RadioGroup
                      value={rating}
                      onValueChange={setRating}
                      className="flex gap-4 justify-center my-2"
                    >
                      {[5, 4, 3, 2, 1].map((value) => (
                        <div key={value} className="flex flex-col items-center">
                          <RadioGroupItem
                            value={value.toString()}
                            id={`rating-${value}`}
                            className="sr-only"
                          />
                          <Label
                            htmlFor={`rating-${value}`}
                            className={`cursor-pointer p-2 rounded-full hover:bg-muted ${
                              rating === value.toString() ? "text-primary" : ""
                            }`}
                          >
                            <Star
                              className={`h-8 w-8 ${
                                rating === value.toString() ? "fill-current" : ""
                              }`}
                            />
                          </Label>
                          <span className="text-sm">{value}</span>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  <div>
                    <Label htmlFor="comment">תגובה (אופציונלי)</Label>
                    <Textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="ספר לנו על החוויה שלך..."
                      className="mt-1"
                    />
                  </div>
                  <Button
                    onClick={handleSubmitFeedback}
                    className="w-full"
                    disabled={submitFeedbackMutation.isPending}
                  >
                    {submitFeedbackMutation.isPending ? "שולח משוב..." : "שלח משוב"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground mb-4">
                תודה על המשוב שלך!
              </p>
              <Button
                className="w-full"
                onClick={() => setLocation(`/menu/${tableId}`)}
              >
                חזרה לתפריט
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setLocation(`/orders/${tableId}`)}
              >
                צפייה בהזמנות
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}