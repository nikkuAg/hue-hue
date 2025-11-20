import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Zap } from "lucide-react";
import { FloatingPetals } from "@/components/FloatingPetals";
import { Confetti } from "@/components/Confetti";
import { playScoreSound, playCelebrationSound, playWinnerSound } from "@/utils/soundEffects";

interface ScoreboardData {
  id: string;
  team1_name: string;
  team1_score: number;
  team2_name: string;
  team2_score: number;
}

const Scoreboard = () => {
  const [scoreboard, setScoreboard] = useState<ScoreboardData | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [team1ScoreChanged, setTeam1ScoreChanged] = useState(false);
  const [team2ScoreChanged, setTeam2ScoreChanged] = useState(false);

  useEffect(() => {
    loadScoreboard();
    
    const channel = supabase
      .channel('scoreboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scoreboard'
        },
        (payload) => {
          const newData = payload.new as ScoreboardData;
          
          setScoreboard((prevScoreboard) => {
            // Check for score changes
            if (prevScoreboard) {
              if (newData.team1_score !== prevScoreboard.team1_score) {
                setTeam1ScoreChanged(true);
                playScoreSound();
                setTimeout(() => setTeam1ScoreChanged(false), 1000);
              }
              if (newData.team2_score !== prevScoreboard.team2_score) {
                setTeam2ScoreChanged(true);
                playScoreSound();
                setTimeout(() => setTeam2ScoreChanged(false), 1000);
              }
              
              // Show confetti if either score increased
              if (newData.team1_score > prevScoreboard.team1_score || newData.team2_score > prevScoreboard.team2_score) {
                setShowConfetti(true);
                playCelebrationSound();
                setTimeout(() => setShowConfetti(false), 3000);
              }
              
              // Play winner sound if someone just took the lead
              const wasTeam1Winning = prevScoreboard.team1_score > prevScoreboard.team2_score;
              const wasTeam2Winning = prevScoreboard.team2_score > prevScoreboard.team1_score;
              const isTeam1WinningNow = newData.team1_score > newData.team2_score;
              const isTeam2WinningNow = newData.team2_score > newData.team1_score;
              
              if ((!wasTeam1Winning && isTeam1WinningNow) || (!wasTeam2Winning && isTeam2WinningNow)) {
                setTimeout(() => playWinnerSound(), 200);
              }
            }
            
            return newData;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // Empty dependency array - only run once on mount

  const loadScoreboard = async () => {
    const { data } = await supabase
      .from('scoreboard')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (data) {
      setScoreboard(data);
    }
  };

  if (!scoreboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream via-mint/20 to-teal/30">
        <div className="animate-pulse text-2xl text-navy font-bold">Loading Scoreboard...</div>
      </div>
    );
  }

  const isTeam1Winning = scoreboard.team1_score > scoreboard.team2_score;
  const isTeam2Winning = scoreboard.team2_score > scoreboard.team1_score;
  const isTied = scoreboard.team1_score === scoreboard.team2_score;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-cream via-mint/20 to-teal/30">
      <FloatingPetals />
      {showConfetti && <Confetti />}
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        {/* Title */}
        <div className="mb-12 text-center animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy className="w-12 h-12 text-coral animate-bounce" />
            <h1 className="text-6xl md:text-7xl font-bold text-navy">
              Live Scoreboard
            </h1>
            <Trophy className="w-12 h-12 text-coral animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Zap className="w-6 h-6 text-teal animate-pulse" />
            <p className="text-lg text-sage font-medium">Updates in Real-Time</p>
            <Zap className="w-6 h-6 text-teal animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>

        {/* Scoreboard */}
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Team 1 */}
            <div className={`transform transition-all duration-500 ${team1ScoreChanged ? 'scale-110' : 'scale-100'} ${isTeam1Winning && !isTied ? 'animate-pulse' : ''}`}>
              <div className={`bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-elegant border-4 transition-all duration-500 ${
                isTeam1Winning && !isTied ? 'border-coral' : 'border-mint-dark/30'
              }`}>
                {isTeam1Winning && !isTied && (
                  <div className="flex justify-center mb-4">
                    <Trophy className="w-10 h-10 text-coral animate-bounce" />
                  </div>
                )}
                <h2 className="text-3xl md:text-4xl font-bold text-navy text-center mb-6 break-words">
                  {scoreboard.team1_name}
                </h2>
                <div className={`text-8xl md:text-9xl font-black text-center transition-all duration-500 ${
                  isTeam1Winning && !isTied ? 'text-coral' : 'text-sage'
                }`}>
                  {scoreboard.team1_score}
                </div>
              </div>
            </div>

            {/* VS Divider */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-coral to-teal opacity-20 blur-2xl animate-pulse"></div>
                <div className="relative text-6xl md:text-7xl font-black text-navy animate-scale-in">
                  VS
                </div>
              </div>
            </div>

            {/* Team 2 */}
            <div className={`transform transition-all duration-500 ${team2ScoreChanged ? 'scale-110' : 'scale-100'} ${isTeam2Winning && !isTied ? 'animate-pulse' : ''}`}>
              <div className={`bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-elegant border-4 transition-all duration-500 ${
                isTeam2Winning && !isTied ? 'border-coral' : 'border-mint-dark/30'
              }`}>
                {isTeam2Winning && !isTied && (
                  <div className="flex justify-center mb-4">
                    <Trophy className="w-10 h-10 text-coral animate-bounce" />
                  </div>
                )}
                <h2 className="text-3xl md:text-4xl font-bold text-navy text-center mb-6 break-words">
                  {scoreboard.team2_name}
                </h2>
                <div className={`text-8xl md:text-9xl font-black text-center transition-all duration-500 ${
                  isTeam2Winning && !isTied ? 'text-coral' : 'text-sage'
                }`}>
                  {scoreboard.team2_score}
                </div>
              </div>
            </div>
          </div>

          {/* Status Message */}
          {isTied && (
            <div className="mt-12 text-center animate-fade-in">
              <p className="text-3xl md:text-4xl font-bold text-teal">
                It's a Tie! 🤝
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;