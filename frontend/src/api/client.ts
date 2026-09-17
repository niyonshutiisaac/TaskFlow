import { Task, CreateTaskPayload, UpdateTaskPayload, TasksResponse, TaskResponse, Stats } from '../types';

const API_BASE = import.meta.env.API_URL || (
  import.meta.env.PROD
    ? 'https://taskflow-backend-2a2w.onrender.com/api'
    : '/api'
);

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiError(errorData.message || `HTTP ${response.status}`, response.status);
  }

  return response.json();
}

export const tasksApi = {
  getAll: (params?: {
    status?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<TasksResponse> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== 'all') {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return request(`/tasks${query ? `?${query}` : ''}`);
  },

  getById: (id: string): Promise<TaskResponse> => {
    return request(`/tasks/${id}`);
  },

  getStats: (): Promise<{ success: boolean; data: Stats }> => {
    return request('/tasks/stats');
  },

  create: (payload: CreateTaskPayload): Promise<TaskResponse> => {
    return request('/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update: (id: string, payload: UpdateTaskPayload): Promise<TaskResponse> => {
    return request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  updateStatus: (id: string, status: 'pending' | 'completed'): Promise<TaskResponse> => {
    return request(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  delete: (id: string): Promise<{ success: boolean; message: string }> => {
    return request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};

export { ApiError };
