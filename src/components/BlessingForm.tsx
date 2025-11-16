import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { z } from "zod";

const blessingSchema = z.object({
  message: z
    .string()
    .trim()
    .min(3, { message: "Blessing must be at least 3 characters" })
    .max(500, { message: "Blessing must be less than 500 characters" }),
});

export const BlessingForm = () => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate input
      const validatedData = blessingSchema.parse({ message });

      setIsSubmitting(true);

      // Only check for profanity in production using AI moderation
      if (import.meta.env.PROD) {
        const { data: moderationData, error: moderationError } = await supabase.functions
          .invoke('moderate-content', {
            body: { message: validatedData.message }
          });

        if (moderationError) {
          console.error("Moderation error:", moderationError);
          toast.error("Unable to verify content. Please try again.");
          setIsSubmitting(false);
          return;
        }

        if (!moderationData?.isAppropriate) {
          toast.error(
            moderationData?.reason || 
            "Your message contains inappropriate content. Please revise and keep it respectful for this family celebration."
          );
          setIsSubmitting(false);
          return;
        }
      }

      // If moderation passed, save the blessing
      const { error } = await supabase
        .from("blessings")
        .insert([{ message: validatedData.message }]);

      if (error) throw error;

      toast.success("Thank you for your blessing! 🌸");
      setMessage("");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error("Error submitting blessing:", error);
        toast.error("Failed to submit blessing. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 md:p-8 shadow-card border-teal/20 bg-gradient-to-br from-cream to-white-smoke">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <Heart className="w-12 h-12 text-coral mx-auto mb-4 animate-float" />
          <h2 className="text-2xl md:text-3xl font-playfair font-semibold mb-2 text-navy">
            Share Your Blessings
          </h2>
          <p className="text-muted-foreground font-sans">
            Send your heartfelt wishes to Pawan & Prachi
          </p>
        </div>

        <div className="space-y-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your blessing here..."
            className="min-h-32 border-teal/30 focus:border-teal bg-white-smoke font-sans resize-none"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {message.length}/500 characters
          </p>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || message.trim().length < 3}
          className="w-full h-12 text-lg font-sans bg-gradient-to-r from-coral to-peach text-navy hover:opacity-90 transition-opacity shadow-coral"
          size="lg"
        >
          {isSubmitting ? "Sending..." : "Send Blessing"}
        </Button>
      </form>
    </Card>
  );
};
