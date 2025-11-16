-- Remove the check constraint on winner_type
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_winner_type_check;

-- Make winner_type nullable since we won't use it anymore
ALTER TABLE players ALTER COLUMN winner_type DROP NOT NULL;