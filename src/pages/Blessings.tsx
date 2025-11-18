import { BlessingForm } from "@/components/BlessingForm";
import { FloatingPetals } from "@/components/FloatingPetals";
import { BotanicalDecoration } from "@/components/BotanicalDecoration";
import { CouplePhotoBackground } from "@/components/CouplePhotoBackground";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Blessings() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream p-4 md:p-8 relative overflow-hidden">
      <CouplePhotoBackground />
      <FloatingPetals />
      <BotanicalDecoration />

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        {/* Header */}
        <header className="text-center mb-8">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Game
          </Button>
          
          <div className="flex justify-center mb-6">
            <div className="text-6xl md:text-7xl font-script text-coral-dark animate-float">
              Pawan & Prachi
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-playfair font-semibold text-navy mb-3">
            Blessings & Wishes
          </h1>
        </header>

        {/* Blessing Form */}
        <BlessingForm />
      </div>
    </div>
  );
}
