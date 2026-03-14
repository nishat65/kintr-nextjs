-- Add target_time to goals for day-scope goals with specific times
ALTER TABLE goals ADD COLUMN IF NOT EXISTS target_time TIME;

-- Comment for clarity
COMMENT ON COLUMN goals.target_time IS 'Optional time for day-scope goals (HH:MM). NULL means all-day.';
