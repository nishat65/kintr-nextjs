-- ============================================================
-- Kintr — Initial Schema Migration
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

create type goal_scope as enum ('day', 'month', 'year');
create type goal_status as enum ('not_started', 'in_progress', 'completed', 'failed');
create type goal_visibility as enum ('public', 'private');
create type connection_status as enum ('pending', 'accepted', 'rejected', 'blocked');
create type vote_type as enum ('upvote', 'downvote');
create type notification_type as enum (
  'upvote', 'downvote', 'comment', 'message',
  'goal_message', 'connection_request', 'connection_accepted', 'goal_shared'
);
create type entity_type as enum ('goal', 'comment', 'message', 'connection');

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================

create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text unique not null,
  display_name text not null,
  avatar_url   text,
  bio          text,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Auto-update updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

-- ============================================================
-- GOALS
-- ============================================================

create table goals (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  title       text not null,
  description text,
  scope       goal_scope not null,
  target_date date not null,
  status      goal_status not null default 'not_started',
  visibility  goal_visibility not null default 'public',
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

create trigger goals_updated_at before update on goals
  for each row execute function set_updated_at();

create index goals_user_id_idx on goals(user_id);
create index goals_scope_idx on goals(scope);
create index goals_visibility_idx on goals(visibility);

-- ============================================================
-- CONNECTIONS
-- ============================================================

create table connections (
  id           uuid primary key default uuid_generate_v4(),
  requester_id uuid not null references profiles(id) on delete cascade,
  addressee_id uuid not null references profiles(id) on delete cascade,
  status       connection_status not null default 'pending',
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null,
  unique(requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

create trigger connections_updated_at before update on connections
  for each row execute function set_updated_at();

create index connections_requester_idx on connections(requester_id);
create index connections_addressee_idx on connections(addressee_id);

-- ============================================================
-- COMMENTS
-- ============================================================

create table comments (
  id         uuid primary key default uuid_generate_v4(),
  goal_id    uuid not null references goals(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  content    text not null,
  created_at timestamptz default now() not null
);

create index comments_goal_id_idx on comments(goal_id);

-- ============================================================
-- VOTES (upvote / downvote — one per user per goal)
-- ============================================================

create table votes (
  id         uuid primary key default uuid_generate_v4(),
  goal_id    uuid not null references goals(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  type       vote_type not null,
  created_at timestamptz default now() not null,
  unique(goal_id, user_id)
);

create index votes_goal_id_idx on votes(goal_id);

-- ============================================================
-- MESSAGES (global DM — mutual connections only enforced by RLS)
-- ============================================================

create table messages (
  id           uuid primary key default uuid_generate_v4(),
  sender_id    uuid not null references profiles(id) on delete cascade,
  recipient_id uuid not null references profiles(id) on delete cascade,
  content      text not null,
  read_at      timestamptz,
  created_at   timestamptz default now() not null,
  check (sender_id <> recipient_id)
);

create index messages_sender_idx on messages(sender_id);
create index messages_recipient_idx on messages(recipient_id);
create index messages_conversation_idx on messages(
  least(sender_id::text, recipient_id::text),
  greatest(sender_id::text, recipient_id::text)
);

-- ============================================================
-- GOAL MESSAGES (goal-scoped chat)
-- ============================================================

create table goal_messages (
  id         uuid primary key default uuid_generate_v4(),
  goal_id    uuid not null references goals(id) on delete cascade,
  sender_id  uuid not null references profiles(id) on delete cascade,
  content    text not null,
  created_at timestamptz default now() not null
);

create index goal_messages_goal_id_idx on goal_messages(goal_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

create table notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  actor_id    uuid not null references profiles(id) on delete cascade,
  type        notification_type not null,
  entity_type entity_type not null,
  entity_id   uuid not null,
  read_at     timestamptz,
  created_at  timestamptz default now() not null,
  check (user_id <> actor_id)
);

create index notifications_user_id_idx on notifications(user_id);
create index notifications_read_at_idx on notifications(user_id, read_at);

-- ============================================================
-- HELPER: is_mutual_connection(a, b) — true if accepted connection exists
-- ============================================================

create or replace function is_mutual_connection(user_a uuid, user_b uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from connections
    where status = 'accepted'
      and (
        (requester_id = user_a and addressee_id = user_b) or
        (requester_id = user_b and addressee_id = user_a)
      )
  );
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles       enable row level security;
alter table goals          enable row level security;
alter table connections    enable row level security;
alter table comments       enable row level security;
alter table votes          enable row level security;
alter table messages       enable row level security;
alter table goal_messages  enable row level security;
alter table notifications  enable row level security;

-- PROFILES
create policy "Profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);

-- GOALS: public goals visible to all; private goals visible to owner + mutual connections
create policy "Public goals are viewable by everyone" on goals for select
  using (visibility = 'public' or user_id = auth.uid() or is_mutual_connection(auth.uid(), user_id));
create policy "Authenticated users can create goals" on goals for insert
  with check (auth.uid() = user_id);
create policy "Users can update their own goals" on goals for update
  using (auth.uid() = user_id);
create policy "Users can delete their own goals" on goals for delete
  using (auth.uid() = user_id);

-- CONNECTIONS
create policy "Users can view their own connections" on connections for select
  using (auth.uid() = requester_id or auth.uid() = addressee_id);
create policy "Authenticated users can send connection requests" on connections for insert
  with check (auth.uid() = requester_id);
create policy "Addressee can update connection status" on connections for update
  using (auth.uid() = addressee_id or auth.uid() = requester_id);
create policy "Users can delete their own connections" on connections for delete
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- COMMENTS: visible based on goal visibility
create policy "Comments on public goals are viewable by everyone" on comments for select
  using (
    exists (
      select 1 from goals g
      where g.id = comments.goal_id
        and (g.visibility = 'public' or g.user_id = auth.uid() or is_mutual_connection(auth.uid(), g.user_id))
    )
  );
create policy "Authenticated users can comment on public goals" on comments for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from goals g
      where g.id = comments.goal_id
        and (g.visibility = 'public' or g.user_id = auth.uid() or is_mutual_connection(auth.uid(), g.user_id))
    )
  );
create policy "Users can delete their own comments" on comments for delete
  using (auth.uid() = user_id);

-- VOTES
create policy "Votes on public goals are viewable" on votes for select
  using (
    exists (
      select 1 from goals g
      where g.id = votes.goal_id
        and (g.visibility = 'public' or g.user_id = auth.uid() or is_mutual_connection(auth.uid(), g.user_id))
    )
  );
create policy "Authenticated users can vote" on votes for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from goals g
      where g.id = votes.goal_id
        and (g.visibility = 'public' or g.user_id = auth.uid() or is_mutual_connection(auth.uid(), g.user_id))
    )
  );
create policy "Users can change their vote" on votes for update
  using (auth.uid() = user_id);
create policy "Users can remove their vote" on votes for delete
  using (auth.uid() = user_id);

-- MESSAGES: only sender and recipient can see
create policy "Users can view their own messages" on messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);
create policy "Mutual connections can send messages" on messages for insert
  with check (
    auth.uid() = sender_id and
    is_mutual_connection(auth.uid(), recipient_id)
  );
create policy "Recipient can mark as read" on messages for update
  using (auth.uid() = recipient_id);

-- GOAL MESSAGES
create policy "Goal messages viewable based on goal visibility" on goal_messages for select
  using (
    exists (
      select 1 from goals g
      where g.id = goal_messages.goal_id
        and (g.visibility = 'public' or g.user_id = auth.uid() or is_mutual_connection(auth.uid(), g.user_id))
    )
  );
create policy "Authenticated users can send goal messages" on goal_messages for insert
  with check (
    auth.uid() = sender_id and
    exists (
      select 1 from goals g
      where g.id = goal_messages.goal_id
        and (g.visibility = 'public' or g.user_id = auth.uid() or is_mutual_connection(auth.uid(), g.user_id))
    )
  );

-- NOTIFICATIONS: only recipient can see
create policy "Users can view their own notifications" on notifications for select
  using (auth.uid() = user_id);
create policy "System can insert notifications" on notifications for insert
  with check (auth.uid() <> user_id); -- actor inserts for recipient

-- ============================================================
-- REALTIME: enable for live tables
-- ============================================================

alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table goal_messages;
alter publication supabase_realtime add table notifications;

-- ============================================================
-- STORAGE: avatars bucket
-- ============================================================

insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
  on conflict do nothing;

create policy "Avatar images are publicly accessible" on storage.objects for select
  using (bucket_id = 'avatars');
create policy "Users can upload their own avatar" on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can update their own avatar" on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
