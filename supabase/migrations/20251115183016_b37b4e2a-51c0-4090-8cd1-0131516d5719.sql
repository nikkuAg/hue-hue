-- Create game sessions table
CREATE TABLE public.game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  CONSTRAINT valid_status CHECK (status IN ('waiting', 'playing', 'completed'))
);

-- Create players table
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  device_id TEXT NOT NULL,
  is_winner BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, device_id)
);

-- Create index for faster queries
CREATE INDEX idx_players_session ON public.players(session_id);
CREATE INDEX idx_sessions_host_code ON public.game_sessions(host_code);

-- Enable Row Level Security
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow all users to read
CREATE POLICY "Anyone can view game sessions"
  ON public.game_sessions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create game sessions"
  ON public.game_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update game sessions"
  ON public.game_sessions FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can view players"
  ON public.players FOR SELECT
  USING (true);

CREATE POLICY "Anyone can join as player"
  ON public.players FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update players"
  ON public.players FOR UPDATE
  USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;