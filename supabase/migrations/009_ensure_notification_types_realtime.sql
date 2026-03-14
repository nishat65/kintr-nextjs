-- Migration 009: Ensure all notification ENUM values exist + starred column + realtime on workspace tables
-- Safe to run multiple times (all statements are idempotent).

-- 1. Add any missing notification type values to the ENUM
DO $$ BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'goal_moved';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'collaborator_added';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'goal_deleted';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'collaborator_has_goal';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'goal_borrowed';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Ensure starred column exists on notifications
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS starred BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. Ensure RLS policies for notifications DELETE and UPDATE exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can delete their notifications" ON notifications;
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE POLICY "Users can delete their notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. Enable Supabase Realtime on workspace_goals so collaborators get live updates
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE workspace_goals;
EXCEPTION WHEN others THEN NULL;
END $$;

-- 5. Ensure goals table is in realtime publication (status changes)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE goals;
EXCEPTION WHEN others THEN NULL;
END $$;
