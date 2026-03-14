-- Phase 6: Add starred flag to notifications + delete support

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS starred BOOLEAN NOT NULL DEFAULT FALSE;

-- Allow users to delete their own notifications
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can delete their notifications" ON notifications;
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE POLICY "Users can delete their notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Allow users to update their own notifications (read_at, starred)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);
