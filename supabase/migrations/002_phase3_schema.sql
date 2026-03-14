-- ============================================================
-- Kintr — Phase 3 Schema Migration
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ============================================================
-- NEW ENUMS
-- ============================================================

create type workspace_visibility as enum ('private', 'public');
create type workspace_role as enum ('owner', 'admin', 'member', 'viewer');
create type goal_priority as enum ('none', 'low', 'medium', 'high', 'urgent');
create type activity_type as enum (
  'created', 'status_changed', 'assigned', 'unassigned',
  'priority_changed', 'due_date_set', 'title_edited',
  'comment_added', 'attachment_added'
);

-- Add new notification types to existing enum
alter type notification_type add value if not exists 'workspace_invite';
alter type notification_type add value if not exists 'goal_assigned';
alter type notification_type add value if not exists 'goal_status_changed';
alter type notification_type add value if not exists 'mention';

-- Add 'workspace' to entity_type enum
alter type entity_type add value if not exists 'workspace';

-- ============================================================
-- WORKSPACES
-- ============================================================

create table workspaces (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  owner_id    uuid not null references profiles(id) on delete cascade,
  visibility  workspace_visibility not null default 'private',
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

create trigger workspaces_updated_at before update on workspaces
  for each row execute function set_updated_at();

create index workspaces_owner_idx on workspaces(owner_id);

-- ============================================================
-- WORKSPACE MEMBERS
-- ============================================================

create table workspace_members (
  id           uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id      uuid not null references profiles(id) on delete cascade,
  role         workspace_role not null default 'member',
  joined_at    timestamptz default now() not null,
  unique(workspace_id, user_id)
);

create index workspace_members_workspace_idx on workspace_members(workspace_id);
create index workspace_members_user_idx on workspace_members(user_id);

-- ============================================================
-- WORKSPACE GOALS (extends goals with collaboration fields)
-- ============================================================

create table workspace_goals (
  id           uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  goal_id      uuid not null references goals(id) on delete cascade,
  assignee_id  uuid references profiles(id) on delete set null,
  priority     goal_priority not null default 'none',
  due_date     date,
  position     float not null default 0,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null,
  unique(workspace_id, goal_id)
);

create trigger workspace_goals_updated_at before update on workspace_goals
  for each row execute function set_updated_at();

create index workspace_goals_workspace_idx on workspace_goals(workspace_id);
create index workspace_goals_goal_idx on workspace_goals(goal_id);
create index workspace_goals_assignee_idx on workspace_goals(assignee_id);

-- ============================================================
-- GOAL ACTIVITIES (immutable audit log)
-- ============================================================

create table goal_activities (
  id       uuid primary key default uuid_generate_v4(),
  goal_id  uuid not null references goals(id) on delete cascade,
  actor_id uuid not null references profiles(id) on delete cascade,
  type     activity_type not null,
  metadata jsonb not null default '{}',
  created_at timestamptz default now() not null
);

create index goal_activities_goal_idx on goal_activities(goal_id);
create index goal_activities_created_idx on goal_activities(goal_id, created_at desc);

-- ============================================================
-- ATTACHMENTS
-- ============================================================

create table attachments (
  id          uuid primary key default uuid_generate_v4(),
  goal_id     uuid not null references goals(id) on delete cascade,
  uploaded_by uuid not null references profiles(id) on delete cascade,
  file_name   text not null,
  file_url    text not null,
  file_size   bigint not null,
  mime_type   text not null,
  created_at  timestamptz default now() not null
);

create index attachments_goal_idx on attachments(goal_id);

-- ============================================================
-- GOAL TAGS (scoped to workspace)
-- ============================================================

create table goal_tags (
  id           uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name         text not null,
  color        text not null default '#6B6B80',
  created_at   timestamptz default now() not null,
  unique(workspace_id, name)
);

create table goal_tag_assignments (
  goal_id uuid not null references goals(id) on delete cascade,
  tag_id  uuid not null references goal_tags(id) on delete cascade,
  primary key (goal_id, tag_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table workspaces          enable row level security;
alter table workspace_members   enable row level security;
alter table workspace_goals     enable row level security;
alter table goal_activities     enable row level security;
alter table attachments         enable row level security;
alter table goal_tags           enable row level security;
alter table goal_tag_assignments enable row level security;

-- Helper: is user a workspace member?
create or replace function is_workspace_member(ws_id uuid, uid uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = ws_id and user_id = uid
  );
$$;

-- Helper: get user's workspace role
create or replace function workspace_role_of(ws_id uuid, uid uuid)
returns workspace_role language sql security definer stable as $$
  select role from workspace_members
  where workspace_id = ws_id and user_id = uid
  limit 1;
$$;

-- WORKSPACES
create policy "Public workspaces viewable by all" on workspaces for select
  using (visibility = 'public' or is_workspace_member(id, auth.uid()));
create policy "Authenticated users can create workspaces" on workspaces for insert
  with check (auth.uid() = owner_id);
create policy "Owner and admin can update workspace" on workspaces for update
  using (workspace_role_of(id, auth.uid()) in ('owner', 'admin'));
create policy "Owner can delete workspace" on workspaces for delete
  using (auth.uid() = owner_id);

-- WORKSPACE MEMBERS
create policy "Members can view workspace members" on workspace_members for select
  using (is_workspace_member(workspace_id, auth.uid()));
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
create policy "Owner and admin can update roles" on workspace_members for update
  using (workspace_role_of(workspace_id, auth.uid()) in ('owner', 'admin'));
create policy "Owner and admin can remove members" on workspace_members for delete
  using (workspace_role_of(workspace_id, auth.uid()) in ('owner', 'admin') or auth.uid() = user_id);

-- WORKSPACE GOALS
create policy "Members can view workspace goals" on workspace_goals for select
  using (is_workspace_member(workspace_id, auth.uid()));
create policy "Members (not viewer) can create workspace goals" on workspace_goals for insert
  with check (workspace_role_of(workspace_id, auth.uid()) in ('owner', 'admin', 'member'));
create policy "Members (not viewer) can update workspace goals" on workspace_goals for update
  using (workspace_role_of(workspace_id, auth.uid()) in ('owner', 'admin', 'member'));
create policy "Owner and admin can delete workspace goals" on workspace_goals for delete
  using (workspace_role_of(workspace_id, auth.uid()) in ('owner', 'admin'));

-- GOAL ACTIVITIES: all members of any workspace the goal belongs to can view
create policy "Members can view goal activities" on goal_activities for select
  using (
    exists (
      select 1 from workspace_goals wg
      join workspace_members wm on wm.workspace_id = wg.workspace_id
      where wg.goal_id = goal_activities.goal_id and wm.user_id = auth.uid()
    )
  );
create policy "Authenticated users can insert activities" on goal_activities for insert
  with check (auth.uid() = actor_id);

-- ATTACHMENTS
create policy "Members can view attachments" on attachments for select
  using (
    exists (
      select 1 from goals g
      where g.id = attachments.goal_id
        and (g.visibility = 'public' or g.user_id = auth.uid() or is_mutual_connection(auth.uid(), g.user_id))
    )
  );
create policy "Authenticated users can upload attachments" on attachments for insert
  with check (auth.uid() = uploaded_by);
create policy "Uploader can delete attachment" on attachments for delete
  using (auth.uid() = uploaded_by);

-- GOAL TAGS
create policy "Members can view tags" on goal_tags for select
  using (is_workspace_member(workspace_id, auth.uid()));
create policy "Members (not viewer) can create tags" on goal_tags for insert
  with check (workspace_role_of(workspace_id, auth.uid()) in ('owner', 'admin', 'member'));
create policy "Members (not viewer) can update tags" on goal_tags for update
  using (workspace_role_of(workspace_id, auth.uid()) in ('owner', 'admin', 'member'));
create policy "Owner and admin can delete tags" on goal_tags for delete
  using (workspace_role_of(workspace_id, auth.uid()) in ('owner', 'admin'));

-- GOAL TAG ASSIGNMENTS
create policy "Members can view tag assignments" on goal_tag_assignments for select
  using (
    exists (
      select 1 from goal_tags gt
      where gt.id = goal_tag_assignments.tag_id
        and is_workspace_member(gt.workspace_id, auth.uid())
    )
  );
create policy "Members (not viewer) can assign tags" on goal_tag_assignments for insert
  with check (
    exists (
      select 1 from goal_tags gt
      where gt.id = goal_tag_assignments.tag_id
        and workspace_role_of(gt.workspace_id, auth.uid()) in ('owner', 'admin', 'member')
    )
  );
create policy "Members (not viewer) can remove tag assignments" on goal_tag_assignments for delete
  using (
    exists (
      select 1 from goal_tags gt
      where gt.id = goal_tag_assignments.tag_id
        and workspace_role_of(gt.workspace_id, auth.uid()) in ('owner', 'admin', 'member')
    )
  );

-- ============================================================
-- REALTIME: enable for goal_activities
-- ============================================================

alter publication supabase_realtime add table goal_activities;

-- ============================================================
-- STORAGE: attachments bucket
-- ============================================================

insert into storage.buckets (id, name, public) values ('attachments', 'attachments', false)
  on conflict do nothing;

create policy "Members can view attachments in storage" on storage.objects for select
  using (bucket_id = 'attachments' and auth.role() = 'authenticated');
create policy "Authenticated users can upload attachments" on storage.objects for insert
  with check (bucket_id = 'attachments' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Uploaders can delete their attachments" on storage.objects for delete
  using (bucket_id = 'attachments' and auth.uid()::text = (storage.foldername(name))[1]);
