import { createClient } from '@/lib/supabase/client';

const profileSelect = 'id, username, display_name, avatar_url, bio, created_at, updated_at';

export const fetchConnections = async (userId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('connections')
    .select(`
      id, requester_id, addressee_id, status, created_at, updated_at,
      requester:profiles!connections_requester_id_fkey(${profileSelect}),
      addressee:profiles!connections_addressee_id_fkey(${profileSelect})
    `)
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export const sendConnectionRequest = async (requesterId: string, addresseeId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('connections')
    .insert({ requester_id: requesterId, addressee_id: addresseeId })
    .select()
    .single();
  if (error) throw error;

  // Notify the addressee of the new request
  await supabase.from('notifications').insert({
    user_id: addresseeId,
    actor_id: requesterId,
    type: 'connection_request',
    entity_type: 'connection',
    entity_id: data.id,
  });

  return data;
};

export const respondToConnection = async (
  connectionId: string,
  status: 'accepted' | 'rejected'
) => {
  const supabase = createClient();

  // Fetch the connection first so we can notify the requester if accepted
  const { data: conn } = await supabase
    .from('connections')
    .select('id, requester_id, addressee_id')
    .eq('id', connectionId)
    .single();

  const { error } = await supabase
    .from('connections')
    .update({ status })
    .eq('id', connectionId);
  if (error) throw error;

  // Notify the requester that their request was accepted
  if (status === 'accepted' && conn) {
    await supabase.from('notifications').insert({
      user_id: conn.requester_id,
      actor_id: conn.addressee_id,
      type: 'connection_accepted',
      entity_type: 'connection',
      entity_id: connectionId,
    });
  }
};

export const removeConnection = async (connectionId: string) => {
  const supabase = createClient();
  const { error } = await supabase.from('connections').delete().eq('id', connectionId);
  if (error) throw error;
};

// Creates a directly-accepted connection — used for auto-connect on workspace invite
export const createAcceptedConnection = async (userA: string, userB: string) => {
  const supabase = createClient();
  const existing = await checkConnectionStatus(userA, userB);
  if (existing) {
    // If pending, accept it
    if (existing.status === 'pending') {
      await supabase.from('connections').update({ status: 'accepted' }).eq('id', existing.id);
    }
    return;
  }
  const { error } = await supabase
    .from('connections')
    .insert({ requester_id: userA, addressee_id: userB, status: 'accepted' });
  if (error) throw error;
};

export const checkConnectionStatus = async (userA: string, userB: string) => {
  const supabase = createClient();
  const { data } = await supabase
    .from('connections')
    .select('id, status, requester_id, addressee_id')
    .or(
      `and(requester_id.eq.${userA},addressee_id.eq.${userB}),and(requester_id.eq.${userB},addressee_id.eq.${userA})`
    )
    .maybeSingle();
  return data ?? null;
};
