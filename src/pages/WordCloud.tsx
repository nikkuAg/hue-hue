import { useEffect, useState, Suspense, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingPetals } from "@/components/FloatingPetals";
import { toast } from "sonner";
import { BotanicalDecoration } from "@/components/BotanicalDecoration";
import { CouplePhotoBackground } from "@/components/CouplePhotoBackground";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { WordCloud3D } from "@/components/WordCloud3D";

interface Blessing {
  id: string;
  message: string;
  created_at: string;
}

export default function WordCloud() {
  const [blessings, setBlessings] = useState<Blessing[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestBlessing, setLatestBlessing] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlessings();
    
    // Subscribe to new blessings with real-time updates
    const channel = supabase
      .channel('blessings-cloud-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'blessings'
        },
        (payload) => {
          const newBlessing = payload.new as Blessing;
          setBlessings(prev => [newBlessing, ...prev]);
          
          // Show thought bubble toast for new blessing
          setLatestBlessing(newBlessing.message);
          
          // Clear any existing timeout
          if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
          }
          
          // Hide the thought bubble after 5 seconds
          toastTimeoutRef.current = setTimeout(() => {
            setLatestBlessing(null);
          }, 5000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
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


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-mint-light to-coral/10 p-4 md:p-8 relative overflow-hidden">
      <CouplePhotoBackground />
      <FloatingPetals />
      <BotanicalDecoration />

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex justify-center gap-4 mb-4">
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Game
            </Button>
            <Button
              onClick={() => navigate("/blessings")}
              variant="outline"
              className="border-coral text-coral hover:bg-coral hover:text-white"
            >
              <Send className="mr-2 h-4 w-4" />
              Send a Blessing
            </Button>
          </div>
          
          <div className="flex justify-center mb-6">
            <div className="text-6xl md:text-7xl font-script text-coral-dark animate-float">
              Pawan & Prachi
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-playfair font-semibold text-navy mb-3">
            Blessings Word Cloud
          </h1>
        </header>

        {/* Thought Bubble Toast for Latest Blessing */}
        {latestBlessing && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 max-w-md w-full px-4 animate-fade-in" style={{ zIndex: 9999 }}>
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 border-2 border-coral/30">
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                <div className="w-6 h-6 bg-white border-l-2 border-b-2 border-coral/30 transform rotate-45"></div>
              </div>
              <div className="flex items-start gap-3">
                <Heart className="w-6 h-6 text-coral flex-shrink-0 mt-1 animate-float" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-navy mb-1">New Blessing Received! 🌸</p>
                  <p className="text-sm text-muted-foreground line-clamp-3">{latestBlessing}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Word Cloud */}
        {loading ? (
          <div className="text-center text-muted-foreground">
            Loading blessings...
          </div>
        ) : blessings.length > 0 ? (
          <Card className="p-6 md:p-8 shadow-card border-teal/20 bg-gradient-to-br from-cream to-white-smoke">
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground">
                Drag to rotate • Scroll to zoom
              </p>
            </div>
            
            <div className="h-[600px] w-full rounded-lg overflow-hidden bg-gradient-to-br from-navy/5 to-teal/5">
              <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
                <Suspense fallback={null}>
                  <WordCloud3D words={getWordCloudData()} />
                  <OrbitControls 
                    enableZoom={true}
                    enablePan={false}
                    minDistance={8}
                    maxDistance={20}
                    autoRotate
                    autoRotateSpeed={0.5}
                  />
                </Suspense>
              </Canvas>
            </div>
          </Card>
        ) : (
          <Card className="p-8 text-center shadow-card border-teal/20 bg-gradient-to-br from-cream to-white-smoke">
            <Heart className="w-16 h-16 text-coral mx-auto mb-4 opacity-50" />
            <p className="text-lg text-muted-foreground">
              No blessings yet. Be the first to share your wishes!
            </p>
            <Button
              onClick={() => navigate("/blessings")}
              className="mt-4 bg-gradient-to-r from-coral to-peach text-navy hover:opacity-90"
            >
              <Send className="mr-2 h-4 w-4" />
              Send a Blessing
            </Button>
          </Card>
        )}

      </div>
    </div>
  );
}
