-- Phase 6: Enable Realtime on messages tables + notification RLS for system inserts

-- Enable Realtime publication on messages (if not already a member)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE messages;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE goal_messages;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Ensure messages RLS allows insert for authenticated senders
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can send messages" ON messages;
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can read their messages" ON messages;
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE POLICY "Users can read their messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DO $$ BEGIN
  DROP POLICY IF EXISTS "Recipients can mark messages read" ON messages;
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE POLICY "Recipients can mark messages read"
  ON messages FOR UPDATE
  USING (auth.uid() = recipient_id);

-- Ensure goal_messages RLS allows authenticated users to insert
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can send goal messages" ON goal_messages;
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE POLICY "Users can send goal messages"
  ON goal_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can read goal messages" ON goal_messages;
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE POLICY "Users can read goal messages"
  ON goal_messages FOR SELECT
  USING (true);

-- Allow authenticated users to insert notifications (for client-side notification triggers)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can create notifications" ON notifications;
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE POLICY "Authenticated users can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = actor_id);

-- Connections: allow insert for requesters
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can send connection requests" ON connections;
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE POLICY "Users can send connection requests"
  ON connections FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- Connections: allow update for addressees (respond) or requesters (cancel)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Connection parties can update" ON connections;
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE POLICY "Connection parties can update"
  ON connections FOR UPDATE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Connections: allow delete for either party
DO $$ BEGIN
  DROP POLICY IF EXISTS "Connection parties can delete" ON connections;
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE POLICY "Connection parties can delete"
  ON connections FOR DELETE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Connections: allow read for either party
DO $$ BEGIN
  DROP POLICY IF EXISTS "Connection parties can read" ON connections;
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE POLICY "Connection parties can read"
  ON connections FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
