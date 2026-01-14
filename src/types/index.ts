export interface User {
  id: number;
  email: string;
  name: string;
  username: string;
  role: 'admin' | 'manager' | 'employee' | 'intern';
  position: string;
  team_id: number | null;
  team_name: string | null;
  mobile_number: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: number;
  name: string;
  description: string;
  parent_team_id: number | null;
  team_head_id: number;
  team_head: User;
  team_head_name: string;
  members: User[];
  sub_teams: Team[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  title: string;
  sub_title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled';
  assignee: User;
  assigner: User;
  team: Team;
  parent_task_id: number | null;
  parent_task: Task | null;
  sub_tasks: Task[];
  due_date: string | null;
  start_date: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  is_overdue: boolean;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  task_id: number;
  user_details: User;
  comment: string;
  file_urls: string[];
  image_urls: string[];
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  receiver: User;
  type: 'task_assigned' | 'task_updated' | 'task_completed' | 'comment_added' | 'team_added' | 'team_removed' | 'deadline_reminder' | 'mention' | 'general';
  title: string;
  message: string;
  related_task: Task | null;
  related_team: Team | null;
  metadata: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  mobile_number: string;
  role: string;
  position: string;
  team_id?: number | null;
}

export interface ApiResponse<T> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
  data?: T;
}

export interface FilterOptions {
  search?: string;
  team_id?: number;
  status?: string;
  priority?: string;
  assignee_id?: number;
  assigner_id?: number;
  parent_task_id?: number;
  root_only?: boolean;
  overdue_only?: boolean;
  is_read?: boolean;
  type?: string;
  days?: number;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface TaskStats {
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  in_progress_tasks: number;
  tasks_by_priority: Record<string, number>;
  tasks_by_status: Record<string, number>;
}