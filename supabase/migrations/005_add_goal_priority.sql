-- Add priority column to goals table
ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'none'
  CHECK (priority IN ('none', 'low', 'medium', 'high', 'urgent'));
