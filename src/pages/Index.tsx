import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScratchCard } from "@/components/ScratchCard";
import { Confetti } from "@/components/Confetti";
import { CouplePhotoBackground } from "@/components/CouplePhotoBackground";
import { FloatingPetals } from "@/components/FloatingPetals";
import { BotanicalDecoration } from "@/components/BotanicalDecoration";
import { useGameSession } from "@/hooks/useGameSession";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Users, Crown, Gift, Upload, Heart } from "lucide-react";
import { Label } from "@/components/ui/label";
type GameState = "setup" | "join" | "waiting" | "playing" | "result";

const Index = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>("setup");
  const [playerName, setPlayerName] = useState("");
  const [sessionCodeInput, setSessionCodeInput] = useState(""); // For manual code entry
  const [isJoining, setIsJoining] = useState(false); // Loading state for join button
  const urlParams = new URLSearchParams(window.location.search);
  const urlSessionCode = urlParams.get("code") || ""; // Code from shared link
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [isWinner, setIsWinner] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [winnerType, setWinnerType] = useState<string>("none");
  const {
    session,
    players,
    loading
  } = useGameSession(sessionId);
  useEffect(() => {
    // Populate sessionCodeInput from URL if available
    if (urlSessionCode) {
      setSessionCodeInput(urlSessionCode.toUpperCase());
    }

    // Check if player already joined
    const savedPlayerId = localStorage.getItem("anniversary-player-id");
    const savedSession = localStorage.getItem("anniversary-player-session");
    if (savedPlayerId && savedSession) {
      setCurrentPlayerId(savedPlayerId);
      setSessionId(savedSession);
      setGameState("waiting");
    }
  }, []);

  // Watch for session status changes and fetch winner_type
  useEffect(() => {
    if (!session) return;
    
    // Handle game ended
    if (session.status === "ended") {
      toast.info("This game has ended");
      localStorage.removeItem("anniversary-player-id");
      localStorage.removeItem("anniversary-player-session");
      setGameState("setup");
      setSessionId(null);
      setCurrentPlayerId(null);
      return;
    }
    
    // Handle game started
    if (session.status === "playing" && gameState === "waiting") {
      // Fetch winner status before showing scratch card
      if (currentPlayerId) {
        supabase.from("players").select("is_winner, winner_type").eq("id", currentPlayerId).single().then(({
          data
        }) => {
          if (data) {
            setIsWinner(data.is_winner || false);
            setWinnerType(data.winner_type || "none");
          }
          setGameState("playing");
        });
      } else {
        setGameState("playing");
      }
    }
  }, [session, gameState, currentPlayerId]);
  const handleJoinGame = async () => {
    if (isJoining) return; // Prevent multiple clicks
    
    if (!playerName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    // Use URL code if available, otherwise use manual input
    const codeToUse = urlSessionCode || sessionCodeInput;
    if (!codeToUse.trim()) {
      toast.error("Please enter the game code");
      return;
    }
    
    setIsJoining(true);
    try {
      // Find session by code
      const {
        data: sessionData,
        error: sessionError
      } = await supabase.from("game_sessions").select("*").eq("host_code", codeToUse.toUpperCase()).single();
      if (sessionError || !sessionData) {
        toast.error("Invalid game code");
        setIsJoining(false);
        return;
      }
      if (sessionData.status !== "waiting") {
        toast.error("This game has already started");
        setIsJoining(false);
        return;
      }
      // Get or create persistent device ID
      let deviceId = localStorage.getItem("anniversary-device-id");
      if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem("anniversary-device-id", deviceId);
      }

      // Check if this device already joined this session
      const { data: existingPlayer, error: checkError } = await supabase
        .from("players")
        .select("*")
        .eq("session_id", sessionData.id)
        .eq("device_id", deviceId)
        .maybeSingle();

      if (existingPlayer) {
        // Player already joined this session, restore their data
        setCurrentPlayerId(existingPlayer.id);
        setSessionId(sessionData.id);
        setGameState("waiting");
        localStorage.setItem("anniversary-player-id", existingPlayer.id);
        localStorage.setItem("anniversary-player-session", sessionData.id);
        toast.success("Welcome back! You've already joined this game.");
        setIsJoining(false);
        return;
      }

      // Add player to session
      const {
        data: playerData,
        error: playerError
      } = await supabase.from("players").insert({
        session_id: sessionData.id,
        name: playerName.trim(),
        device_id: deviceId
      }).select().single();
      if (playerError) {
        if (playerError.code === "23505") {
          toast.error("This device has already joined this game");
        } else {
          toast.error("Failed to join game");
        }
        setIsJoining(false);
        return;
      }
      localStorage.setItem("anniversary-player-id", playerData.id);
      localStorage.setItem("anniversary-player-session", sessionData.id);
      setCurrentPlayerId(playerData.id);
      setSessionId(sessionData.id);
      setGameState("waiting");
      toast.success("Welcome to the celebration!");
      setIsJoining(false);
    } catch (error) {
      console.error("Join error:", error);
      toast.error("Failed to join game");
      setIsJoining(false);
    }
  };
  const playSound = (isWinner: boolean) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    if (isWinner) {
      // Winner sound: ascending happy tones
      const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      let time = audioContext.currentTime;
      frequencies.forEach((freq, index) => {
        oscillator.frequency.setValueAtTime(freq, time);
        gainNode.gain.setValueAtTime(0.3, time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        time += 0.15;
      });
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.7);
    } else {
      // Loser sound: gentle descending tone
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
      oscillator.frequency.exponentialRampToValueAtTime(220, audioContext.currentTime + 0.5); // A3
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };
  const handleScratchComplete = () => {
    setTimeout(async () => {
      if (currentPlayerId) {
        // Check if player is winner
        const {
          data
        } = await supabase.from("players").select("is_winner, winner_type").eq("id", currentPlayerId).single();
        const won = data?.is_winner || false;
        setIsWinner(won);
        setWinnerType(data?.winner_type || "none");

        // Play sound effect
        playSound(won);
        setGameState("result");
        if (won) {
          setShowConfetti(true);
          toast.success("🎉 Congratulations! You're a winner!");
        } else {
          toast("Thank you for playing!");
        }
      }
    }, 500);
  };
  const handleReset = async () => {
    localStorage.clear();
    setGameState("setup");
    setPlayerName("");
    setSessionCodeInput("");
    setSessionId(null);
    setCurrentPlayerId(null);
    setIsWinner(false);
    setShowConfetti(false);
  };
  const handleLeaveGame = () => {
    if (currentPlayerId) {
      supabase.from("players").delete().eq("id", currentPlayerId);
    }
    localStorage.clear();
    setGameState("setup");
    setPlayerName("");
    setSessionCodeInput("");
    setSessionId(null);
    setCurrentPlayerId(null);
    setIsWinner(false);
    setShowConfetti(false);
  };
  return <div className="min-h-screen bg-gradient-to-br from-background via-mint-light to-coral/10 p-4 md:p-8 relative overflow-hidden">
      <CouplePhotoBackground />
      <FloatingPetals />
      <BotanicalDecoration />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none z-5">
        <div className="absolute top-20 left-10 text-4xl opacity-20 animate-float">🌸</div>
        <div className="absolute top-40 right-20 text-5xl opacity-20 animate-float" style={{
        animationDelay: '1s'
      }}>✨</div>
        <div className="absolute bottom-40 left-1/4 text-6xl opacity-20 animate-float" style={{
        animationDelay: '2s'
      }}>🌿</div>
        <div className="absolute bottom-20 right-1/3 text-4xl opacity-20 animate-float" style={{
        animationDelay: '1.5s'
      }}>💐</div>
      </div>

      {showConfetti && <Confetti />}
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12">
          <div className="flex justify-center mb-6">
            <div className="text-6xl md:text-7xl font-script text-coral-dark animate-float">
              Pawan & Prachi
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-playfair font-semibold text-navy mb-3">
            Celebrating 25 Years of Togetherness
          </h1>
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => navigate("/blessings")}
              variant="outline"
              className="border-coral text-coral hover:bg-coral hover:text-white transition-colors"
            >
              <Heart className="mr-2 h-4 w-4" />
              Share Blessings
            </Button>
            <Button
              onClick={() => navigate("/blessings/cloud")}
              variant="outline"
              className="border-teal text-teal hover:bg-teal hover:text-white transition-colors"
            >
              View Word Cloud
            </Button>
          </div>
        </header>

         {/* Setup State - Player Join Only */}
        {gameState === "setup" && <div className="space-y-4 animate-fade-in">
            <Card className="p-6 md:p-8 shadow-card border-teal/20 bg-gradient-to-br from-cream to-white-smoke">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl mb-4 animate-float">🌸</div>
                  <h2 className="text-2xl md:text-3xl font-playfair font-semibold mb-2 text-navy">
                    Join Lucky Draw
                  </h2>
                  <p className="text-muted-foreground font-sans">
                    Enter the game code to participate in the scratch card lucky draw
                  </p>
                </div>
                
                <div className="space-y-4">
                  <Input type="text" placeholder="Your name" value={playerName} onChange={e => setPlayerName(e.target.value)} className="text-lg h-12 border-teal/30 focus:border-teal bg-white-smoke font-sans" />
                  
                  {/* Only show game code input if NOT coming from a shared link */}
                  {!urlSessionCode && <Input type="text" placeholder="Game Code (e.g., ABC123)" value={sessionCodeInput} onChange={e => setSessionCodeInput(e.target.value.toUpperCase())} className="text-lg h-12 border-teal/30 focus:border-teal text-center font-bold tracking-wider bg-white-smoke" maxLength={6} />}
                  <Button 
                    onClick={handleJoinGame} 
                    disabled={isJoining}
                    className="w-full h-12 text-lg font-sans bg-gradient-to-r from-coral to-peach text-navy hover:opacity-90 transition-opacity shadow-coral disabled:opacity-50 disabled:cursor-not-allowed" 
                    size="lg"
                  >
                    {isJoining ? "Joining..." : "Join Game"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>}

        {/* Waiting State */}
        {gameState === "waiting" && !loading && <Card className="p-6 md:p-8 shadow-card border-teal/20 bg-gradient-to-br from-cream to-white-smoke animate-fade-in">
            <div className="space-y-6">
              <div className="text-center">
                <Gift className="w-16 h-16 text-coral mx-auto mb-4 animate-float" />
                <h2 className="text-2xl md:text-3xl font-playfair font-semibold mb-2 text-navy">
                  Welcome! 🎊
                </h2>
                <p className="text-muted-foreground font-sans">
                  Waiting for the host to start the game...
                </p>
              </div>

              <div className="bg-white-smoke rounded-lg p-6 md:p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-coral/20 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-coral" />
                  </div>
                  <div>
                    <div className="text-4xl md:text-5xl font-bold text-navy mb-2">
                      {players.length}
                    </div>
                    <p className="text-lg text-muted-foreground font-sans">
                      {players.length === 1 ? 'Player Joined' : 'Players Joined'}
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={handleLeaveGame} variant="outline" className="w-full border-coral text-coral hover:bg-coral hover:text-white font-sans">
                Leave Game
              </Button>
            </div>
          </Card>}

        {/* Playing State */}
        {gameState === "playing" && <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-playfair font-semibold mb-2 text-navy">
                Scratch to Reveal! ✨
              </h2>
              <p className="text-muted-foreground font-sans">
                Use your finger or mouse to scratch the card
              </p>
            </div>

            <div className="flex justify-center px-4">
              <div className="w-full max-w-md h-[400px] md:h-[500px]">
                <ScratchCard onComplete={handleScratchComplete} content={isWinner ? (
                  winnerType === "first" ? (
                    <div className="text-center space-y-4 bg-gradient-to-br from-gold/20 to-accent/20 p-8 rounded-lg">
                      <div className="text-6xl md:text-8xl animate-float">👑</div>
                      <div className="space-y-2">
                        <h3 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-gold to-accent bg-clip-text text-transparent">
                          1st PRIZE!
                        </h3>
                        <p className="text-lg md:text-xl text-navy font-semibold">
                          Congratulations Champion! 🎉
                        </p>
                      </div>
                    </div>
                  ) : winnerType === "second" ? (
                    <div className="text-center space-y-4 bg-gradient-to-br from-champagne/40 to-rose-gold/20 p-8 rounded-lg">
                      <div className="text-6xl md:text-8xl animate-float">🥈</div>
                      <div className="space-y-2">
                        <h3 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gold to-rose-gold bg-clip-text text-transparent">
                          2nd PRIZE!
                        </h3>
                        <p className="text-lg md:text-xl text-navy font-semibold">
                          Amazing! You're a winner! 🎉
                        </p>
                      </div>
                    </div>
                  ) : winnerType === "third" ? (
                    <div className="text-center space-y-4 bg-gradient-to-br from-amber/20 to-orange/10 p-8 rounded-lg">
                      <div className="text-6xl md:text-8xl animate-float">🥉</div>
                      <div className="space-y-2">
                        <h3 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                          3rd PRIZE!
                        </h3>
                        <p className="text-lg md:text-xl text-navy font-semibold">
                          You've won a special gift!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="text-6xl md:text-8xl animate-float">🎁</div>
                      <div className="space-y-2">
                        <h3 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gold to-accent bg-clip-text text-transparent">
                          WINNER!
                        </h3>
                        <p className="text-lg md:text-xl text-navy font-semibold">
                          You've won a special gift!
                        </p>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="text-center space-y-4">
                    <div className="text-5xl md:text-7xl animate-float">💝</div>
                    <div className="space-y-2">
                      <h3 className="text-xl md:text-2xl font-semibold text-navy">
                        Thank You for Playing!
                      </h3>
                      <p className="text-sm md:text-base text-muted-foreground">
                        We appreciate your participation
                      </p>
                    </div>
                  </div>
                )} scratchPercentage={50} showPattern={true} />
              </div>
            </div>
          </div>}

        {/* Result State */}
        {gameState === "result" && <Card className="p-6 md:p-8 shadow-elegant border-gold/20 animate-fade-in">
            <div className="text-center space-y-6">
              {winnerType === "image" ? <>
                  <div className="text-7xl md:text-9xl animate-float">🎁</div>
                  <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gold to-accent bg-clip-text text-transparent">
                    Congratulations!
                  </h2>
                  <p className="text-lg md:text-xl text-foreground">
                    You've won a special gift! 🎉
                  </p>
                </> : winnerType === "silver_jubilee" ? <>
                  <div className="text-7xl md:text-9xl animate-float">🏆</div>
                  <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-gold via-accent to-rose-gold bg-clip-text text-transparent">
                    Silver Jubilee Winner!
                  </h2>
                  <p className="text-lg md:text-xl text-foreground">
                    A very special prize awaits you! 🎊
                  </p>
                </> : <>
                  <div className="text-6xl md:text-8xl animate-float">🌟</div>
                  <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                    Thanks for Playing!
                  </h2>
                  <p className="text-base md:text-lg text-muted-foreground">
                    We hope you enjoyed the celebration!
                  </p>
                </>}

            </div>
          </Card>}

        {/* Footer */}
        <footer className="text-center mt-8 md:mt-12 text-sm text-muted-foreground">
          <p>Made with ❤️ for a special celebration</p>
        </footer>
      </div>
    </div>;
};
export default Index;