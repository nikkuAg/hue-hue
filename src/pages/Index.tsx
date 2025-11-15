import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScratchCard } from "@/components/ScratchCard";
import { Confetti } from "@/components/Confetti";
import { toast } from "sonner";

type GameState = "join" | "waiting" | "playing" | "result";

interface Player {
  id: string;
  name: string;
}

const Index = () => {
  const [gameState, setGameState] = useState<GameState>("join");
  const [playerName, setPlayerName] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isWinner, setIsWinner] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    // Check if device already joined
    const deviceId = localStorage.getItem("anniversary-device-id");
    if (deviceId) {
      const savedPlayer = localStorage.getItem("anniversary-player");
      if (savedPlayer) {
        setCurrentPlayer(JSON.parse(savedPlayer));
        setGameState("waiting");
      }
    }

    // Simulate other players for demo (in real app, this would come from backend)
    const demoPlayers = [
      { id: "1", name: "Guest 1" },
      { id: "2", name: "Guest 2" },
      { id: "3", name: "Guest 3" },
    ];
    setPlayers(demoPlayers);
  }, []);

  const handleJoinGame = () => {
    if (!playerName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    const deviceId = crypto.randomUUID();
    const player = { id: deviceId, name: playerName.trim() };
    
    localStorage.setItem("anniversary-device-id", deviceId);
    localStorage.setItem("anniversary-player", JSON.stringify(player));
    
    setCurrentPlayer(player);
    setPlayers([...players, player]);
    setGameState("waiting");
    toast.success("Welcome to the celebration!");
  };

  const handleStartGame = () => {
    setGameState("playing");
    // Randomly determine if current player wins (1 in 4 chance for demo)
    setIsWinner(Math.random() < 0.25);
    toast.success("Game started! Scratch your card!");
  };

  const handleScratchComplete = () => {
    setTimeout(() => {
      setGameState("result");
      if (isWinner) {
        setShowConfetti(true);
        toast.success("🎉 Congratulations! You're a winner!");
      } else {
        toast("Thank you for playing!");
      }
    }, 500);
  };

  const handlePlayAgain = () => {
    localStorage.removeItem("anniversary-device-id");
    localStorage.removeItem("anniversary-player");
    setGameState("join");
    setPlayerName("");
    setCurrentPlayer(null);
    setIsWinner(false);
    setShowConfetti(false);
  };

  const handleHostToggle = () => {
    setIsHost(!isHost);
    toast.success(isHost ? "Host mode disabled" : "Host mode enabled");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-champagne to-rose-gold/20 p-4 md:p-8">
      {showConfetti && <Confetti />}
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gold via-accent to-rose-gold bg-clip-text text-transparent mb-2 md:mb-4">
            Anniversary Celebration
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Lucky Draw Scratch Cards
          </p>
        </header>

        {/* Join State */}
        {gameState === "join" && (
          <Card className="p-6 md:p-8 shadow-elegant border-gold/20 animate-fade-in">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-foreground">
                  Welcome!
                </h2>
                <p className="text-muted-foreground">
                  Enter your name to join the celebration
                </p>
              </div>
              
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="text-lg h-12 border-gold/30 focus:border-gold"
                  onKeyDown={(e) => e.key === "Enter" && handleJoinGame()}
                />
                <Button
                  onClick={handleJoinGame}
                  className="w-full h-12 text-lg bg-gradient-to-r from-gold to-accent hover:opacity-90 transition-opacity"
                  size="lg"
                >
                  Join Game
                </Button>
              </div>

              <div className="text-center pt-4 border-t border-border">
                <Button
                  onClick={handleHostToggle}
                  variant="outline"
                  className="border-gold/30"
                >
                  {isHost ? "Exit Host Mode" : "I'm the Host"}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Waiting State */}
        {gameState === "waiting" && (
          <Card className="p-6 md:p-8 shadow-elegant border-gold/20 animate-fade-in">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-semibold mb-2">
                  Welcome, {currentPlayer?.name}! 🎉
                </h2>
                <p className="text-muted-foreground">
                  Waiting for the host to start the game...
                </p>
              </div>

              <div className="bg-gradient-to-br from-champagne/50 to-rose-gold/20 rounded-xl p-4 md:p-6">
                <h3 className="font-semibold mb-3 text-foreground">
                  Players Joined: {players.length}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="bg-card rounded-lg p-3 text-center shadow-sm border border-border"
                    >
                      <span className="text-sm md:text-base">{player.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {isHost && (
                <Button
                  onClick={handleStartGame}
                  className="w-full h-12 text-lg bg-gradient-to-r from-gold to-accent hover:opacity-90"
                  size="lg"
                >
                  Start Game
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Playing State */}
        {gameState === "playing" && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-semibold mb-2">
                Scratch to Reveal! ✨
              </h2>
              <p className="text-muted-foreground">
                Use your finger or mouse to scratch the card
              </p>
            </div>

            <div className="max-w-md mx-auto aspect-[3/4] md:aspect-[4/3]">
              <ScratchCard
                onComplete={handleScratchComplete}
                content={
                  <div className="w-full h-full bg-gradient-to-br from-card to-champagne flex items-center justify-center p-8">
                    {isWinner ? (
                      <div className="text-center space-y-4">
                        <div className="text-6xl md:text-8xl animate-float">🎊</div>
                        <div className="space-y-2">
                          <h3 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gold to-accent bg-clip-text text-transparent">
                            WINNER!
                          </h3>
                          <p className="text-lg md:text-xl text-foreground font-semibold">
                            Happy Anniversary!
                          </p>
                          <p className="text-sm md:text-base text-muted-foreground">
                            Congratulations! 🎉
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="text-5xl md:text-7xl animate-float">💝</div>
                        <div className="space-y-2">
                          <h3 className="text-xl md:text-2xl font-semibold text-foreground">
                            Thank You!
                          </h3>
                          <p className="text-sm md:text-base text-muted-foreground">
                            Better luck next time!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                }
              />
            </div>
          </div>
        )}

        {/* Result State */}
        {gameState === "result" && (
          <Card className="p-6 md:p-8 shadow-elegant border-gold/20 animate-fade-in">
            <div className="text-center space-y-6">
              {isWinner ? (
                <>
                  <div className="text-7xl md:text-9xl animate-float">🏆</div>
                  <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gold to-accent bg-clip-text text-transparent">
                    Congratulations!
                  </h2>
                  <p className="text-lg md:text-xl text-foreground">
                    You've won a special prize! 🎁
                  </p>
                </>
              ) : (
                <>
                  <div className="text-6xl md:text-8xl animate-float">🌟</div>
                  <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                    Thanks for Playing!
                  </h2>
                  <p className="text-base md:text-lg text-muted-foreground">
                    We hope you enjoyed the celebration!
                  </p>
                </>
              )}

              {isHost && (
                <Button
                  onClick={handlePlayAgain}
                  variant="outline"
                  className="border-gold/30 hover:bg-gold/10"
                >
                  Reset Game
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Footer */}
        <footer className="text-center mt-8 md:mt-12 text-sm text-muted-foreground">
          <p>Made with ❤️ for a special celebration</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
