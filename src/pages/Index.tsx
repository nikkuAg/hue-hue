import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScratchCard } from "@/components/ScratchCard";
import { Confetti } from "@/components/Confetti";
import { HostSetup } from "@/components/HostSetup";
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
  const urlParams = new URLSearchParams(window.location.search);
  const urlSessionCode = urlParams.get("code") || ""; // Code from shared link
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [isWinner, setIsWinner] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [hostCode, setHostCode] = useState<string | null>(null);
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

    // Check if user is returning host
    const savedHostCode = localStorage.getItem("anniversary-host-code");
    const savedSessionId = localStorage.getItem("anniversary-session-id");
    if (savedHostCode && savedSessionId) {
      setHostCode(savedHostCode);
      setSessionId(savedSessionId);
      setIsHost(true);
      setGameState("waiting");
    } else {
      // Check if player already joined
      const savedPlayerId = localStorage.getItem("anniversary-player-id");
      const savedSession = localStorage.getItem("anniversary-player-session");
      if (savedPlayerId && savedSession) {
        setCurrentPlayerId(savedPlayerId);
        setSessionId(savedSession);
        setGameState("waiting");
      }
    }
  }, []);

  // Watch for session status changes and fetch winner_type
  useEffect(() => {
    if (!session) return;
    if (session.status === "playing" && gameState === "waiting") {
      // Fetch winner status before showing scratch card
      if (currentPlayerId) {
        supabase.from("players").select("winner_type").eq("id", currentPlayerId).single().then(({
          data
        }) => {
          if (data) {
            setWinnerType(data.winner_type || "none");
          }
          setGameState("playing");
        });
      } else {
        setGameState("playing");
      }
    }
  }, [session, gameState, currentPlayerId]);
  const handleHostSession = (newSessionId: string, newHostCode: string) => {
    setSessionId(newSessionId);
    setHostCode(newHostCode);
    setIsHost(true);
    setGameState("waiting");
  };
  const handleJoinGame = async () => {
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
    try {
      // Find session by code
      const {
        data: sessionData,
        error: sessionError
      } = await supabase.from("game_sessions").select("*").eq("host_code", codeToUse.toUpperCase()).single();
      if (sessionError || !sessionData) {
        toast.error("Invalid game code");
        return;
      }
      if (sessionData.status !== "waiting") {
        toast.error("This game has already started");
        return;
      }
      const deviceId = crypto.randomUUID();

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
        return;
      }
      localStorage.setItem("anniversary-player-id", playerData.id);
      localStorage.setItem("anniversary-player-session", sessionData.id);
      setCurrentPlayerId(playerData.id);
      setSessionId(sessionData.id);
      setGameState("waiting");
      toast.success("Welcome to the celebration!");
    } catch (error) {
      console.error("Join error:", error);
      toast.error("Failed to join game");
    }
  };
  const handleStartGame = async () => {
    if (!sessionId || !hostCode) return;
    try {
      // Verify host code
      const {
        data: sessionData
      } = await supabase.from("game_sessions").select("host_code").eq("id", sessionId).single();
      if (sessionData?.host_code !== hostCode) {
        toast.error("Invalid host code");
        return;
      }

      // Select exactly 3 winners: 2 with images, 1 with silver jubilee
      const shuffled = [...players].sort(() => 0.5 - Math.random());
      const winners = shuffled.slice(0, 3);

      // Update all players
      await Promise.all(players.map((player, index) => {
        const winnerIndex = winners.findIndex(w => w.id === player.id);
        let winner_type = "none";
        if (winnerIndex === 0 || winnerIndex === 1) {
          winner_type = "image";
        } else if (winnerIndex === 2) {
          winner_type = "silver_jubilee";
        }
        return supabase.from("players").update({
          is_winner: winnerIndex !== -1,
          winner_type
        }).eq("id", player.id);
      }));

      // Update session status
      await supabase.from("game_sessions").update({
        status: "playing",
        started_at: new Date().toISOString()
      }).eq("id", sessionId);
      toast.success("Game started! 🎉");
    } catch (error) {
      console.error("Start game error:", error);
      toast.error("Failed to start game");
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
    if (isHost && sessionId) {
      await supabase.from("game_sessions").delete().eq("id", sessionId);
    }
    localStorage.clear();
    setGameState("setup");
    setPlayerName("");
    setSessionCodeInput("");
    setSessionId(null);
    setCurrentPlayerId(null);
    setIsWinner(false);
    setShowConfetti(false);
    setIsHost(false);
    setHostCode(null);
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
            <Button
              onClick={() => navigate("/auth")}
              variant="outline"
              className="border-navy text-navy hover:bg-navy hover:text-white transition-colors"
            >
              Admin Login
            </Button>
          </div>
        </header>

        {/* Setup State */}
        {gameState === "setup" && <div className="space-y-4 animate-fade-in">
            {!urlSessionCode && <>
                <HostSetup onSessionCreated={handleHostSession} />
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">or</p>
                </div>
              </>}

            <Card className="p-6 md:p-8 shadow-card border-teal/20 bg-gradient-to-br from-cream to-white-smoke">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl mb-4 animate-float">🌸</div>
                  <h2 className="text-2xl md:text-3xl font-playfair font-semibold mb-2 text-navy">
                    Lucky Draw Scratch Card
                  </h2>
                  <p className="text-muted-foreground font-sans">
                    Enter your name to try your luck!
                  </p>
                </div>
                
                <div className="space-y-4">
                  <Input type="text" placeholder="Your name" value={playerName} onChange={e => setPlayerName(e.target.value)} className="text-lg h-12 border-teal/30 focus:border-teal bg-white-smoke font-sans" />
                  
                  {/* Only show game code input if NOT coming from a shared link */}
                  {!urlSessionCode && <Input type="text" placeholder="Game Code (e.g., ABC123)" value={sessionCodeInput} onChange={e => setSessionCodeInput(e.target.value.toUpperCase())} className="text-lg h-12 border-teal/30 focus:border-teal text-center font-bold tracking-wider bg-white-smoke" maxLength={6} />}
                  <Button onClick={handleJoinGame} className="w-full h-12 text-lg font-sans bg-gradient-to-r from-coral to-peach text-navy hover:opacity-90 transition-opacity shadow-coral" size="lg">
                    Join Game
                  </Button>
                </div>
              </div>
            </Card>
          </div>}

        {/* Waiting State */}
        {gameState === "waiting" && !loading && <Card className="p-6 md:p-8 shadow-elegant border-gold/20 animate-fade-in">
            <div className="space-y-6">
              <div className="text-center">
                {isHost ? <>
                    <Crown className="w-16 h-16 text-gold mx-auto mb-4 animate-pulse" />
                    <h2 className="text-2xl md:text-3xl font-semibold mb-2 bg-gradient-to-r from-gold to-accent bg-clip-text text-transparent">
                      Host Dashboard
                    </h2>
                    <div className="bg-gradient-to-r from-gold/20 to-accent/20 rounded-lg p-4 mb-4">
                      <p className="text-sm text-muted-foreground mb-1">Game Code</p>
                      <p className="text-3xl font-bold tracking-wider">{hostCode}</p>
                    </div>
                  </> : <>
                    <Gift className="w-16 h-16 text-accent mx-auto mb-4 animate-float" />
                    <h2 className="text-2xl md:text-3xl font-semibold mb-2">
                      Welcome! 🎊
                    </h2>
                    <p className="text-muted-foreground">
                      Waiting for the host to start the game...
                    </p>
                  </>}
              </div>

              <div className="bg-gradient-to-br from-champagne/50 to-rose-gold/20 rounded-xl p-4 md:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-foreground" />
                  <h3 className="font-semibold text-foreground">
                    Players Joined: {players.length}
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                  {players.map(player => <div key={player.id} className="bg-card rounded-lg p-3 text-center shadow-sm border border-border hover:border-gold/50 transition-colors">
                      <span className="text-sm md:text-base">{player.name}</span>
                    </div>)}
                </div>
              </div>

              {isHost && <>
                  <div className="bg-gradient-to-br from-gold/10 to-accent/10 rounded-xl p-4">
                    <p className="text-sm text-center font-medium text-foreground mb-2">
                      Share this link with players:
                    </p>
                    <div className="flex gap-2">
                      <Input readOnly value={`${window.location.origin}?code=${hostCode}`} className="text-sm font-mono" />
                      <Button onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}?code=${hostCode}`);
                  toast.success("Link copied!");
                }} variant="outline" className="border-gold/30">
                        Copy
                      </Button>
                    </div>
                  </div>
                  <Button onClick={handleStartGame} disabled={players.length < 1} className="w-full h-12 text-lg bg-gradient-to-r from-gold to-accent hover:opacity-90 disabled:opacity-50" size="lg">
                    Start Game ({players.length} {players.length === 1 ? 'Player' : 'Players'})
                  </Button>
                </>}
            </div>
          </Card>}

        {/* Playing State */}
        {gameState === "playing" && !isHost && <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-semibold mb-2">
                Scratch to Reveal! ✨
              </h2>
              <p className="text-muted-foreground">
                Use your finger or mouse to scratch the card
              </p>
            </div>

            <div className="max-w-md mx-auto aspect-[3/4] md:aspect-[4/3]">
              <ScratchCard onComplete={handleScratchComplete} content={<div className="w-full h-full bg-gradient-to-br from-card via-champagne to-rose-gold/30 flex items-center justify-center p-8 border-4 border-gold/30 rounded-2xl">
                    {winnerType === "image" ? <div className="text-center space-y-4">
                        {localStorage.getItem("anniversary-parents-image") ? <div className="space-y-4">
                            <div className="w-full max-w-sm mx-auto rounded-lg overflow-hidden border-4 border-gold shadow-gold">
                              <img src={localStorage.getItem("anniversary-parents-image")!} alt="Special Gift" className="w-full h-full object-cover" />
                            </div>
                            <div className="space-y-2">
                              <h3 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gold to-accent bg-clip-text text-transparent">
                                WINNER!
                              </h3>
                              <p className="text-lg md:text-xl text-foreground font-semibold">
                                You've won a special gift!
                              </p>
                            </div>
                          </div> : <>
                            <div className="text-6xl md:text-8xl animate-float">🎁</div>
                            <div className="space-y-2">
                              <h3 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gold to-accent bg-clip-text text-transparent">
                                WINNER!
                              </h3>
                              <p className="text-lg md:text-xl text-foreground font-semibold">
                                You've won a special gift!
                              </p>
                            </div>
                          </>}
                      </div> : winnerType === "silver_jubilee" ? <div className="text-center space-y-4">
                        <div className="text-6xl md:text-8xl animate-float">🏆</div>
                        <div className="space-y-2">
                          <h3 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-gold via-accent to-rose-gold bg-clip-text text-transparent">
                            Silver Jubilee
                          </h3>
                          <p className="text-lg md:text-xl text-foreground font-semibold">
                            Congratulations! 🎉
                          </p>
                        </div>
                      </div> : <div className="text-center space-y-4">
                        <div className="text-5xl md:text-7xl animate-float">💝</div>
                        <div className="space-y-2">
                          <h3 className="text-xl md:text-2xl font-semibold text-foreground">
                            Thank You for Playing!
                          </h3>
                          <p className="text-sm md:text-base text-muted-foreground">
                            We appreciate your participation
                          </p>
                        </div>
                      </div>}
                  </div>} />
            </div>
          </div>}

        {/* Host Dashboard During Playing */}
        {gameState === "playing" && isHost && <Card className="p-6 md:p-8 shadow-elegant border-gold/20 animate-fade-in">
            <div className="space-y-6">
              <div className="text-center">
                <Crown className="w-16 h-16 text-gold mx-auto mb-4 animate-pulse" />
                <h2 className="text-2xl md:text-3xl font-semibold mb-2 bg-gradient-to-r from-gold to-accent bg-clip-text text-transparent">
                  Game in Progress
                </h2>
                <p className="text-muted-foreground">Players are scratching their cards...</p>
              </div>

              <div className="bg-gradient-to-br from-champagne/50 to-rose-gold/20 rounded-xl p-4 md:p-6">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-gold" />
                  Winners
                </h3>
                <div className="space-y-2">
                  {players.filter(p => p.is_winner).map(player => <div key={player.id} className="bg-card rounded-lg p-3 border border-gold/30 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{player.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {(player as any).winner_type === "silver_jubilee" ? "🏆 Silver Jubilee" : "🎁 Gift Winner"}
                          </span>
                        </div>
                      </div>)}
                </div>
              </div>

              <div className="bg-gradient-to-br from-champagne/50 to-rose-gold/20 rounded-xl p-4 md:p-6">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-foreground" />
                  All Players: {players.length}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {players.map(player => <div key={player.id} className={`bg-card rounded-lg p-3 text-center shadow-sm border ${player.is_winner ? "border-gold/50" : "border-border"}`}>
                      <span className="text-sm">{player.name}</span>
                    </div>)}
                </div>
              </div>
            </div>
          </Card>}

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

              {isHost && <Button onClick={handleReset} variant="outline" className="border-gold/30 hover:bg-gold/10">
                  Reset Game
                </Button>}
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