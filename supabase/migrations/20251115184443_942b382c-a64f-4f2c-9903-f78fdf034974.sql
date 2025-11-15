-- Add winner_type column to players table
ALTER TABLE public.players 
ADD COLUMN winner_type text DEFAULT 'none' CHECK (winner_type IN ('none', 'image', 'silver_jubilee'));