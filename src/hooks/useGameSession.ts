import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Player {
  id: string;
  name: string;
  device_id: string;
  is_winner: boolean;
  joined_at: string;
}

export interface GameSession {
  id: string;
  host_code: string;
  status: "waiting" | "playing" | "completed";
  created_at: string;
  started_at: string | null;
}

export const useGameSession = (sessionId: string | null) => {
  const [session, setSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    // Fetch initial session data
    const fetchSession = async () => {
      const { data } = await supabase
        .from("game_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();
      
      if (data) {
        setSession({
          id: data.id,
          host_code: data.host_code,
          status: data.status as "waiting" | "playing" | "completed",
          created_at: data.created_at,
          started_at: data.started_at,
        });
      }
      setLoading(false);
    };

    // Fetch initial players
    const fetchPlayers = async () => {
      const { data } = await supabase
        .from("players")
        .select("*")
        .eq("session_id", sessionId)
        .order("joined_at", { ascending: true });
      
      if (data) setPlayers(data);
    };

    fetchSession();
    fetchPlayers();

    // Subscribe to session changes
    const sessionChannel = supabase
      .channel(`session-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE" && payload.new) {
            const updated = payload.new as any;
            setSession({
              id: updated.id,
              host_code: updated.host_code,
              status: updated.status as "waiting" | "playing" | "completed",
              created_at: updated.created_at,
              started_at: updated.started_at,
            });
          }
        }
      )
      .subscribe();

    // Subscribe to players changes
    const playersChannel = supabase
      .channel(`players-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setPlayers((prev) => [...prev, payload.new as Player]);
          } else if (payload.eventType === "UPDATE") {
            setPlayers((prev) =>
              prev.map((p) => (p.id === payload.new.id ? (payload.new as Player) : p))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionChannel);
      supabase.removeChannel(playersChannel);
    };
  }, [sessionId]);

  return { session, players, loading };
};
