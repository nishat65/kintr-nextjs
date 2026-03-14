-- Migration 010: Fix RLS policies
-- 1. Allow workspace members to update goal status (collaborators couldn't move kanban cards)
-- 2. Ensure notification UPDATE/DELETE policies exist (star, delete, mark-read were silently blocked)

-- ─── 1. Goals: workspace members can update status ────────────────────────────
-- Previously only the goal owner could UPDATE goals. Non-owners in a shared workspace
-- need to be able to update status when moving cards on the Kanban board.

DROP POLICY IF EXISTS "Users can update their own goals" ON goals;

CREATE POLICY "Users can update their own goals"
  ON goals FOR UPDATE
  USING (
    -- Original owner can always update
    auth.uid() = user_id
    OR
    -- Any workspace member who has this goal in a shared workspace can also update
    EXISTS (
      SELECT 1
      FROM workspace_goals wg
      JOIN workspace_members wm ON wm.workspace_id = wg.workspace_id
      WHERE wg.goal_id = goals.id
        AND wm.user_id = auth.uid()
    )
  );

-- ─── 2. Notifications: UPDATE (mark read, star) ───────────────────────────────
DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;

CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── 3. Notifications: DELETE ────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can delete their notifications" ON notifications;

CREATE POLICY "Users can delete their notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);
