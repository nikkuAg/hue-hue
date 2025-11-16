-- Add unique constraint to prevent same device from joining same session multiple times
-- This allows a device to join multiple different sessions, but only once per session
ALTER TABLE public.players
ADD CONSTRAINT unique_device_per_session UNIQUE (device_id, session_id);