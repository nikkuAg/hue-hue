import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, LogOut, Shield, Play, Square, Copy, Users, Crown, Gift, Trophy, Plus, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGameSession } from "@/hooks/useGameSession";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Blessing {
  id: string;
  message: string;
  created_at: string;
}

interface ScoreboardData {
  id: string;
  team1_name: string;
  team1_score: number;
  team2_name: string;
  team2_score: number;
}

export default function Admin() {
  const navigate = useNavigate();
  const [blessings, setBlessings] = useState<Blessing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [hostCode, setHostCode] = useState<string | null>(null);
  const [scoreboard, setScoreboard] = useState<ScoreboardData | null>(null);
  const [team1Name, setTeam1Name] = useState("");
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Name, setTeam2Name] = useState("");
  const [team2Score, setTeam2Score] = useState(0);
  
  const { session, players } = useGameSession(currentSessionId);

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please login to access admin panel");
        navigate("/auth");
        return;
      }

      // Check if user has admin role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roles) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/");
        return;
      }

      setIsAdmin(true);
      setCheckingAuth(false);
      loadBlessings();
      loadActiveGameSession();
      loadScoreboard();
    };

    checkAdminAccess();
  }, [navigate]);

  const loadActiveGameSession = async () => {
    // Check for active game session (not ended)
    const { data: sessions } = await supabase
      .from("game_sessions")
      .select("*")
      .in("status", ["waiting", "playing"])
      .order("created_at", { ascending: false })
      .limit(1);

    if (sessions && sessions.length > 0) {
      setCurrentSessionId(sessions[0].id);
      setHostCode(sessions[0].host_code);
    } else {
      setCurrentSessionId(null);
      setHostCode(null);
    }
  };

  const loadBlessings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blessings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load blessings");
      console.error(error);
    } else {
      setBlessings(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("blessings").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete blessing");
      console.error(error);
    } else {
      toast.success("Blessing deleted");
      setBlessings(blessings.filter((b) => b.id !== id));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateSession = async () => {
    const code = generateCode();

    const { data, error } = await supabase
      .from("game_sessions")
      .insert([{ host_code: code, status: "waiting" }])
      .select()
      .single();

    if (error) {
      toast.error("Failed to create game session");
      console.error(error);
      return;
    }

    setCurrentSessionId(data.id);
    setHostCode(code);
    toast.success("Game session created!");
  };

  const handleStartGame = async () => {
    if (!currentSessionId) return;

    const playerCount = players?.length || 0;
    if (playerCount === 0) {
      toast.error("No players have joined yet");
      return;
    }

    // Fisher-Yates shuffle for proper randomization
    const shuffled = [...(players || [])];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    const winner1 = shuffled[0];
    const winner2 = shuffled[1];
    const winner3 = shuffled[2];

    // Update winners - all winners are equal now
    try {
      if (winner1) {
        const { error: error1 } = await supabase
          .from("players")
          .update({ is_winner: true })
          .eq("id", winner1.id);
        
        if (error1) {
          console.error("Failed to set first winner:", error1);
          toast.error("Failed to assign first winner");
          return;
        }
      }
      
      if (winner2) {
        const { error: error2 } = await supabase
          .from("players")
          .update({ is_winner: true })
          .eq("id", winner2.id);
        
        if (error2) {
          console.error("Failed to set second winner:", error2);
          toast.error("Failed to assign second winner");
          return;
        }
      }
      
      if (winner3) {
        const { error: error3 } = await supabase
          .from("players")
          .update({ is_winner: true })
          .eq("id", winner3.id);
        
        if (error3) {
          console.error("Failed to set third winner:", error3);
          toast.error("Failed to assign third winner");
          return;
        }
      }
    } catch (err) {
      console.error("Error assigning winners:", err);
      toast.error("Failed to decide winners");
      return;
    }

    // Start the session only after winners are assigned
    const { error } = await supabase
      .from("game_sessions")
      .update({ status: "playing", started_at: new Date().toISOString() })
      .eq("id", currentSessionId);

    if (error) {
      toast.error("Failed to start game");
      console.error(error);
    } else {
      toast.success("Game started! Winners selected.");
    }
  };

  const handleEndGame = async () => {
    if (!currentSessionId) return;

    const { error } = await supabase
      .from("game_sessions")
      .update({ status: "ended" })
      .eq("id", currentSessionId);

    if (error) {
      toast.error("Failed to end game");
      console.error(error);
    } else {
      toast.success("Game ended");
      setCurrentSessionId(null);
      setHostCode(null);
    }
  };

  const loadScoreboard = async () => {
    const { data } = await supabase
      .from('scoreboard')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (data) {
      setScoreboard(data);
      setTeam1Name(data.team1_name);
      setTeam1Score(data.team1_score);
      setTeam2Name(data.team2_name);
      setTeam2Score(data.team2_score);
    }
  };

  const handleUpdateScoreboard = async () => {
    if (!scoreboard) return;

    const { error } = await supabase
      .from('scoreboard')
      .update({
        team1_name: team1Name,
        team1_score: team1Score,
        team2_name: team2Name,
        team2_score: team2Score,
      })
      .eq('id', scoreboard.id);

    if (error) {
      toast.error("Failed to update scoreboard");
      console.error(error);
    } else {
      toast.success("Scoreboard updated!");
      loadScoreboard();
    }
  };

  const copyGameLink = () => {
    if (!hostCode) return;
    const link = `${window.location.origin}/?code=${hostCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Game link copied to clipboard!");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream to-white-smoke">
        <p className="text-navy font-sans">Checking access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-white-smoke p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-10 h-10 text-coral" />
            <div>
              <h1 className="text-3xl md:text-4xl font-playfair font-semibold text-navy">
                Admin Panel
              </h1>
              <p className="text-muted-foreground font-sans">
                Manage blessings, games, and content
              </p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-coral text-coral hover:bg-coral hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Game Management */}
        <Card className="p-6 shadow-card border-teal/20">
          <h2 className="text-2xl font-playfair font-semibold text-navy mb-4">
            Game Management
          </h2>

          {!currentSessionId ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No active game session</p>
              <Button
                onClick={handleCreateSession}
                className="bg-gradient-to-r from-coral to-peach text-navy hover:opacity-90"
              >
                <Play className="w-4 h-4 mr-2" />
                Create New Game Session
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white-smoke rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Game Code</p>
                  <p className="text-2xl font-bold text-navy">{hostCode}</p>
                </div>
                <Button
                  onClick={copyGameLink}
                  variant="outline"
                  className="border-teal text-teal hover:bg-teal hover:text-white"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white-smoke rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-coral" />
                  <div>
                    <p className="text-sm text-muted-foreground">Players Joined</p>
                    <p className="text-xl font-bold text-navy">{players?.length || 0}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-lg font-semibold text-navy capitalize">
                    {session?.status || "waiting"}
                  </p>
                </div>
              </div>

              {players && players.length > 0 && (
                <div className="p-4 bg-white-smoke rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Registered Players</p>
                  <div className="space-y-1">
                    {players.map((player) => (
                      <p key={player.id} className="text-navy">
                        {player.name}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Winners Section */}
              {players && players.filter(p => p.is_winner).length > 0 && (
                <div className="p-4 bg-gradient-to-br from-gold/10 to-accent/10 rounded-lg border-2 border-gold/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="w-5 h-5 text-gold" />
                    <p className="text-sm font-semibold text-gold">Winners 🎉</p>
                  </div>
                  <div className="space-y-2">
                    {players.filter(p => p.is_winner).map((player) => (
                      <div key={player.id} className="flex items-center gap-2 p-2 bg-white rounded">
                        <Gift className="w-4 h-4 text-coral" />
                        <p className="text-navy font-semibold">{player.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}


              <div className="flex gap-3">
                {session?.status === "waiting" && (
                  <Button
                    onClick={handleStartGame}
                    className="flex-1 bg-gradient-to-r from-coral to-peach text-navy hover:opacity-90"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Game
                  </Button>
                )}
                {(session?.status === "waiting" || session?.status === "playing") && (
                  <Button
                    onClick={handleEndGame}
                    variant="outline"
                    className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    End Game
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Scoreboard Management */}
        <Card className="p-6 shadow-card border-teal/20">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-coral" />
            <h2 className="text-2xl font-playfair font-semibold text-navy">
              Scoreboard Management
            </h2>
          </div>

          {scoreboard ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Team 1 */}
                <div className="p-6 bg-white-smoke rounded-lg space-y-4">
                  <h3 className="text-lg font-semibold text-navy mb-4">Team 1</h3>
                  <div>
                    <Label htmlFor="team1-name">Team Name</Label>
                    <Input
                      id="team1-name"
                      value={team1Name}
                      onChange={(e) => setTeam1Name(e.target.value)}
                      className="mt-1"
                      placeholder="Enter team 1 name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="team1-score">Score</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Button
                        onClick={() => setTeam1Score(Math.max(0, team1Score - 1))}
                        variant="outline"
                        size="icon"
                        className="border-coral text-coral hover:bg-coral hover:text-white"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        id="team1-score"
                        type="number"
                        value={team1Score}
                        onChange={(e) => setTeam1Score(parseInt(e.target.value) || 0)}
                        className="text-center text-2xl font-bold"
                        min="0"
                      />
                      <Button
                        onClick={() => setTeam1Score(team1Score + 1)}
                        variant="outline"
                        size="icon"
                        className="border-teal text-teal hover:bg-teal hover:text-white"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Team 2 */}
                <div className="p-6 bg-white-smoke rounded-lg space-y-4">
                  <h3 className="text-lg font-semibold text-navy mb-4">Team 2</h3>
                  <div>
                    <Label htmlFor="team2-name">Team Name</Label>
                    <Input
                      id="team2-name"
                      value={team2Name}
                      onChange={(e) => setTeam2Name(e.target.value)}
                      className="mt-1"
                      placeholder="Enter team 2 name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="team2-score">Score</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Button
                        onClick={() => setTeam2Score(Math.max(0, team2Score - 1))}
                        variant="outline"
                        size="icon"
                        className="border-coral text-coral hover:bg-coral hover:text-white"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        id="team2-score"
                        type="number"
                        value={team2Score}
                        onChange={(e) => setTeam2Score(parseInt(e.target.value) || 0)}
                        className="text-center text-2xl font-bold"
                        min="0"
                      />
                      <Button
                        onClick={() => setTeam2Score(team2Score + 1)}
                        variant="outline"
                        size="icon"
                        className="border-teal text-teal hover:bg-teal hover:text-white"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleUpdateScoreboard}
                className="w-full bg-gradient-to-r from-coral to-peach text-navy hover:opacity-90"
              >
                Update Scoreboard
              </Button>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">Loading scoreboard...</p>
          )}
        </Card>

        {/* Blessings Management */}
        <Card className="p-6 shadow-card border-teal/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-playfair font-semibold text-navy">
              All Blessings ({blessings.length})
            </h2>
            <Button
              onClick={loadBlessings}
              variant="outline"
              className="border-teal text-teal hover:bg-teal hover:text-white"
            >
              Refresh
            </Button>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : blessings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No blessings yet
            </p>
          ) : (
            <div className="space-y-4">
              {blessings.map((blessing) => (
                <Card
                  key={blessing.id}
                  className="p-4 bg-white-smoke border-teal/10 hover:border-teal/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-navy font-sans mb-2">{blessing.message}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(blessing.created_at).toLocaleString()}
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Blessing?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete
                            the blessing.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(blessing.id)}
                            className="bg-red-500 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
