-- Add unique constraint to allow one device per session (but same device can join multiple sessions)
ALTER TABLE public.players DROP CONSTRAINT IF EXISTS players_device_id_key;
ALTER TABLE public.players ADD CONSTRAINT players_device_session_unique UNIQUE (device_id, session_id);