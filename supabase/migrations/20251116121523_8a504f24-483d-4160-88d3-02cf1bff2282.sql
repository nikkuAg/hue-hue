-- Update the valid_status constraint to include 'ended' as a valid status
ALTER TABLE public.game_sessions
DROP CONSTRAINT valid_status;

ALTER TABLE public.game_sessions
ADD CONSTRAINT valid_status CHECK (status = ANY (ARRAY['waiting'::text, 'playing'::text, 'completed'::text, 'ended'::text]));