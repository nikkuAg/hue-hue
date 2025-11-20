-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create scoreboard table
CREATE TABLE public.scoreboard (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team1_name text NOT NULL DEFAULT 'Team 1',
  team1_score integer NOT NULL DEFAULT 0,
  team2_name text NOT NULL DEFAULT 'Team 2',
  team2_score integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scoreboard ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view the scoreboard
CREATE POLICY "Anyone can view scoreboard"
ON public.scoreboard
FOR SELECT
USING (true);

-- Only admins can update the scoreboard
CREATE POLICY "Admins can update scoreboard"
ON public.scoreboard
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert scoreboard
CREATE POLICY "Admins can insert scoreboard"
ON public.scoreboard
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger to update timestamp
CREATE TRIGGER update_scoreboard_updated_at
BEFORE UPDATE ON public.scoreboard
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial scoreboard entry
INSERT INTO public.scoreboard (team1_name, team1_score, team2_name, team2_score)
VALUES ('Team 1', 0, 'Team 2', 0);

-- Enable realtime for scoreboard table
ALTER PUBLICATION supabase_realtime ADD TABLE public.scoreboard;