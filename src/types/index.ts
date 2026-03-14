export type GoalScope = 'day' | 'month' | 'year';
export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'failed';
export type GoalVisibility = 'public' | 'private';
export type ConnectionStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';
export type VoteType = 'upvote' | 'downvote';
export type NotificationType =
  | 'upvote'
  | 'downvote'
  | 'comment'
  | 'message'
  | 'goal_message'
  | 'connection_request'
  | 'connection_accepted'
  | 'goal_shared'
  | 'workspace_invite'
  | 'goal_assigned'
  | 'goal_status_changed'
  | 'mention'
  | 'collaborator_added'
  | 'goal_deleted'
  | 'goal_moved'
  | 'collaborator_has_goal';

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  author: Profile;
  title: string;
  description: string | null;
  scope: GoalScope;
  target_date: string;
  status: GoalStatus;
  visibility: GoalVisibility;
  priority: GoalPriority;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  goal_id: string;
  user_id: string;
  author: Profile;
  content: string;
  created_at: string;
}

export interface Vote {
  id: string;
  goal_id: string;
  user_id: string;
  type: VoteType;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  sender: Profile;
  recipient?: Profile;
  content: string;
  read_at: string | null;
  created_at: string;
}

export interface GoalMessage {
  id: string;
  goal_id: string;
  sender_id: string;
  sender: Profile;
  content: string;
  created_at: string;
}

export interface Connection {
  id: string;
  requester_id: string;
  addressee_id: string;
  requester: Profile;
  addressee: Profile;
  status: ConnectionStatus;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  actor: Profile;
  type: NotificationType;
  entity_type: 'goal' | 'comment' | 'message' | 'connection' | 'workspace';
  entity_id: string;
  read_at: string | null;
  starred: boolean;
  created_at: string;
}

export interface GoalFormValues {
  title: string;
  description?: string;
  scope: GoalScope;
  target_date: string;
  target_time?: string; // HH:mm — only for day scope
  visibility: GoalVisibility;
  priority?: GoalPriority;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  email: string;
  password: string;
  display_name: string;
  username: string;
}

// Phase 3 types
export type WorkspaceVisibility = 'private' | 'public';
export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';
export type GoalPriority = 'none' | 'low' | 'medium' | 'high' | 'urgent';
export type ActivityType =
  | 'created'
  | 'status_changed'
  | 'assigned'
  | 'unassigned'
  | 'priority_changed'
  | 'due_date_set'
  | 'title_edited'
  | 'comment_added'
  | 'attachment_added';

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  owner: Profile;
  visibility: WorkspaceVisibility;
  created_at: string;
  updated_at: string;
  member_count?: number;
  goal_count?: number;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  user: Profile;
  role: WorkspaceRole;
  joined_at: string;
}

export interface WorkspaceGoal {
  id: string;
  workspace_id: string;
  goal_id: string;
  goal: Goal;
  assignee_id: string | null;
  assignee: Profile | null;
  priority: GoalPriority;
  due_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface GoalActivity {
  id: string;
  goal_id: string;
  actor_id: string;
  actor: Profile;
  type: ActivityType;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Attachment {
  id: string;
  goal_id: string;
  uploaded_by: string;
  uploader: Profile;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export interface GoalTag {
  id: string;
  workspace_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface WorkspaceFormValues {
  name: string;
  description?: string;
  visibility: WorkspaceVisibility;
}
