import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BlessingForm } from "@/components/BlessingForm";
import { FloatingPetals } from "@/components/FloatingPetals";
import { BotanicalDecoration } from "@/components/BotanicalDecoration";
import { CouplePhotoBackground } from "@/components/CouplePhotoBackground";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReactWordcloud from "react-wordcloud";
import { Card } from "@/components/ui/card";

interface Blessing {
  id: string;
  message: string;
  created_at: string;
}

export default function Blessings() {
  const [blessings, setBlessings] = useState<Blessing[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlessings();
    
    // Subscribe to new blessings
    const channel = supabase
      .channel('blessings-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'blessings'
        },
        (payload) => {
          setBlessings(prev => [payload.new as Blessing, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBlessings = async () => {
    try {
      const { data, error } = await supabase
        .from("blessings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBlessings(data || []);
    } catch (error) {
      console.error("Error fetching blessings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Process blessings into word cloud format
  const getWordCloudData = () => {
    const wordFrequency: { [key: string]: number } = {};

    blessings.forEach(blessing => {
      const words = blessing.message
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3); // Only words longer than 3 characters

      words.forEach(word => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      });
    });

    return Object.entries(wordFrequency).map(([text, value]) => ({
      text,
      value,
    }));
  };

  const wordCloudOptions = {
    rotations: 2,
    rotationAngles: [0, 90] as [number, number],
    fontSizes: [20, 80] as [number, number],
    colors: ['#E97777', '#FF9F9F', '#FCDDB0', '#40A578', '#5B8E55'],
    enableTooltip: true,
    deterministic: true,
    fontFamily: 'Playfair Display',
    padding: 2,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-mint-light to-coral/10 p-4 md:p-8 relative overflow-hidden">
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

        {/* Word Cloud */}
        {blessings.length > 0 && (
          <Card className="p-6 md:p-8 shadow-card border-teal/20 bg-gradient-to-br from-cream to-white-smoke">
            <div className="text-center mb-6">
              <Heart className="w-10 h-10 text-coral mx-auto mb-3" />
              <h2 className="text-2xl md:text-3xl font-playfair font-semibold text-navy mb-2">
                Blessings Word Cloud
              </h2>
              <p className="text-muted-foreground">
                {blessings.length} {blessings.length === 1 ? 'blessing' : 'blessings'} received
              </p>
            </div>
            
            <div className="h-96 w-full">
              <ReactWordcloud
                words={getWordCloudData()}
                options={wordCloudOptions}
              />
            </div>
          </Card>
        )}

        {/* Recent Blessings */}
        {blessings.length > 0 && (
          <Card className="p-6 md:p-8 shadow-card border-teal/20 bg-gradient-to-br from-cream to-white-smoke">
            <h3 className="text-xl md:text-2xl font-playfair font-semibold text-navy mb-4 text-center">
              Recent Blessings
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {blessings.slice(0, 10).map((blessing) => (
                <div
                  key={blessing.id}
                  className="p-4 bg-white-smoke rounded-lg border border-teal/10"
                >
                  <p className="text-navy font-sans italic">"{blessing.message}"</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(blessing.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {loading && (
          <div className="text-center text-muted-foreground">
            Loading blessings...
          </div>
        )}
      </div>
    </div>
  );
}
