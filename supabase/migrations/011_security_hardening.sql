-- ============================================================
-- Migration 011: Security Hardening
-- Fixes: goal_messages RLS, attachments storage RLS,
--        notification insert guard
-- ============================================================

-- 1. Fix goal_messages SELECT — restrict to workspace members or goal owner/connections
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can read goal messages" ON goal_messages;
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE POLICY "Users can read goal messages"
  ON goal_messages FOR SELECT
  USING (
    -- User is the goal owner
    EXISTS (
      SELECT 1 FROM goals g WHERE g.id = goal_messages.goal_id AND g.user_id = auth.uid()
    )
    OR
    -- User is a workspace member for this goal
    EXISTS (
      SELECT 1 FROM workspace_goals wg
      JOIN workspace_members wm ON wm.workspace_id = wg.workspace_id
      WHERE wg.goal_id = goal_messages.goal_id AND wm.user_id = auth.uid()
    )
    OR
    -- Goal is public (anyone logged in can see chat)
    EXISTS (
      SELECT 1 FROM goals g WHERE g.id = goal_messages.goal_id AND g.visibility = 'public'
    )
    OR
    -- Goal is private but user is a mutual connection of the owner
    EXISTS (
      SELECT 1 FROM goals g
      WHERE g.id = goal_messages.goal_id
        AND g.visibility = 'private'
        AND is_mutual_connection(auth.uid(), g.user_id)
    )
  );

-- 2. Fix attachments storage — restrict to workspace members or goal visibility
DO $$ BEGIN
  DROP POLICY IF EXISTS "Members can view attachments in storage" ON storage.objects;
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE POLICY "Members can view attachments in storage" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'attachments'
    AND auth.role() = 'authenticated'
    AND (
      -- User uploaded it themselves
      auth.uid()::text = (storage.foldername(name))[1]
      OR
      -- User is a workspace member for the goal this attachment belongs to
      EXISTS (
        SELECT 1 FROM attachments a
        JOIN workspace_goals wg ON wg.goal_id = a.goal_id
        JOIN workspace_members wm ON wm.workspace_id = wg.workspace_id
        WHERE a.file_url LIKE '%' || name || '%'
          AND wm.user_id = auth.uid()
      )
    )
  );

-- 3. Verify notification insert policy already has actor_id check
-- (Already fixed in 007 with: WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = actor_id))
-- No change needed — the policy is already correct.
