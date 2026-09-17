export type TaskStatus = 'pending' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TasksResponse {
  success: boolean;
  data: Task[];
  pagination: Pagination;
}

export interface TaskResponse {
  success: boolean;
  data: Task;
  message?: string;
}

export interface Stats {
  total: number;
  pending: number;
  completed: number;
  highPriorityPending: number;
}

export type FilterStatus = 'all' | TaskStatus;
export type FilterPriority = 'all' | TaskPriority;
export type SortBy = 'created_at' | 'title' | 'priority';
export type SortOrder = 'asc' | 'desc';
export type ViewMode = 'list' | 'board';
