import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HostSetupProps {
  onSessionCreated: (sessionId: string, hostCode: string) => void;
}

export const HostSetup = ({ onSessionCreated }: HostSetupProps) => {
  const [hostCode, setHostCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const generateHostCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setHostCode(code);
  };

  const createSession = async () => {
    if (!hostCode.trim()) {
      toast.error("Please generate a host code");
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from("game_sessions")
        .insert({
          host_code: hostCode,
          status: "waiting",
        })
        .select()
        .single();

      if (error) throw error;

      localStorage.setItem("anniversary-host-code", hostCode);
      localStorage.setItem("anniversary-session-id", data.id);
      
      onSessionCreated(data.id, hostCode);
      toast.success("Game session created!");
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("This code is already in use. Please generate a new one.");
      } else {
        toast.error("Failed to create session");
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="p-6 md:p-8 shadow-elegant border-gold/20 animate-fade-in">
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-float">👑</div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-2 bg-gradient-to-r from-gold to-accent bg-clip-text text-transparent">
            Host Setup
          </h2>
          <p className="text-muted-foreground">
            Create a game session and share the code with your guests
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Host Code"
              value={hostCode}
              onChange={(e) => setHostCode(e.target.value.toUpperCase())}
              className="text-lg h-12 border-gold/30 focus:border-gold text-center font-bold tracking-wider"
              maxLength={6}
            />
            <Button
              onClick={generateHostCode}
              variant="outline"
              className="border-gold/30 hover:bg-gold/10 h-12 px-6"
            >
              Generate
            </Button>
          </div>

          <Button
            onClick={createSession}
            disabled={isCreating || !hostCode}
            className="w-full h-12 text-lg bg-gradient-to-r from-gold to-accent hover:opacity-90 transition-opacity"
            size="lg"
          >
            {isCreating ? "Creating..." : "Create Game Session"}
          </Button>
        </div>

        <div className="bg-gradient-to-br from-champagne/50 to-rose-gold/20 rounded-xl p-4">
          <h3 className="font-semibold mb-2 text-sm">💡 How it works:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Generate a unique host code</li>
            <li>• Share it with your guests</li>
            <li>• Only you can start the game</li>
            <li>• See all players join in real-time</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};
