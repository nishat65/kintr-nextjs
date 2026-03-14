-- ─── Phase 4: Fix workspace RLS + new notification types ─────────────────────

-- Fix: allow workspace owner to INSERT (private or public)
-- Drop the existing restrictive INSERT policy if it exists and recreate
DROP POLICY IF EXISTS "Users can create workspaces" ON workspaces;
CREATE POLICY "Users can create workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Ensure SELECT policy covers owners and members
DROP POLICY IF EXISTS "Users can view workspaces they belong to" ON workspaces;
CREATE POLICY "Users can view workspaces they belong to"
  ON workspaces FOR SELECT
  USING (
    visibility = 'public'
    OR owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
        AND workspace_members.user_id = auth.uid()
    )
  );

-- Allow owners and admins to update workspace settings
DROP POLICY IF EXISTS "Owners and admins can update workspaces" ON workspaces;
CREATE POLICY "Owners and admins can update workspaces"
  ON workspaces FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
        AND workspace_members.user_id = auth.uid()
        AND workspace_members.role IN ('owner', 'admin')
    )
  );

-- Allow owners to delete workspaces
DROP POLICY IF EXISTS "Owners can delete workspaces" ON workspaces;
CREATE POLICY "Owners can delete workspaces"
  ON workspaces FOR DELETE
  USING (owner_id = auth.uid());

-- ─── New notification types ───────────────────────────────────────────────────
-- If the notifications.type column uses a PostgreSQL ENUM, run these:
DO $$
BEGIN
  BEGIN
    ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'collaborator_added';
  EXCEPTION WHEN others THEN NULL;
  END;
  BEGIN
    ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'goal_deleted';
  EXCEPTION WHEN others THEN NULL;
  END;
  BEGIN
    ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'goal_moved';
  EXCEPTION WHEN others THEN NULL;
  END;
  BEGIN
    ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'collaborator_has_goal';
  EXCEPTION WHEN others THEN NULL;
  END;
END $$;

-- If using a CHECK constraint instead of ENUM, uncomment and run this instead:
-- ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
-- ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
--   CHECK (type IN (
--     'upvote','downvote','comment','message','goal_message',
--     'connection_request','connection_accepted','goal_shared',
--     'workspace_invite','goal_assigned','goal_status_changed','mention',
--     'collaborator_added','goal_deleted','goal_moved','collaborator_has_goal'
--   ));

-- ─── Notifications RLS: allow actors to insert notifications for others ───────
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = actor_id);

-- ─── Profiles: all authenticated users can read all profiles (for discovery) ──
DROP POLICY IF EXISTS "Profiles are publicly readable" ON profiles;
CREATE POLICY "Profiles are publicly readable"
  ON profiles FOR SELECT
  USING (true);
