-- ============================================================
-- Kintr — Patch: Fix workspace_members INSERT RLS policy
-- Run this in: Supabase Dashboard → SQL Editor → New query
--
-- Problem: when a user creates a workspace, they try to insert
-- themselves into workspace_members as 'owner'. But the INSERT
-- policy calls workspace_role_of() which queries workspace_members
-- itself — and since they're not in there yet, it returns null,
-- causing a 403. This is the classic bootstrapping chicken-and-egg.
-- ============================================================

drop policy if exists "Owner and admin can add members" on workspace_members;

create policy "Owner and admin can add members" on workspace_members for insert
  with check (
    -- Existing owners/admins can invite others
    workspace_role_of(workspace_id, auth.uid()) in ('owner', 'admin')
    OR
    -- Workspace creator can insert themselves as first member (bootstrapping)
    (
      auth.uid() = user_id
      AND role = 'owner'
      AND exists (select 1 from workspaces where id = workspace_id and owner_id = auth.uid())
    )
  );
