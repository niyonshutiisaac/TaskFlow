import { Task, TaskPriority, TaskStatus } from './types';
import { pool } from './db';

// In-memory fallback for demo when DATABASE_URL not set
class MemoryStore {
  private tasks: Task[] = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      title: 'Design new landing page',
      description: 'Create wireframes and high-fidelity mockups for the Q2 campaign landing page. Include mobile responsive versions.',
      status: 'pending',
      priority: 'high',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      title: 'Review pull requests',
      description: 'Review and merge pending PRs from the frontend team. Focus on the authentication flow changes.',
      status: 'pending',
      priority: 'medium',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      title: 'Update API documentation',
      description: 'Document the new task management endpoints and add examples to Postman collection.',
      status: 'completed',
      priority: 'low',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      title: 'Fix navigation bug on mobile',
      description: 'Users reported that the hamburger menu does not close after selecting an item on iOS devices.',
      status: 'pending',
      priority: 'high',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
      id: '55555555-5555-5555-5555-555555555555',
      title: 'Prepare kLab presentation',
      description: 'Finalize slides for the Tech Upskill program demo day. Include architecture diagrams.',
      status: 'pending',
      priority: 'medium',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
  ];

  list(filters: { status?: TaskStatus; priority?: TaskPriority; search?: string; sortBy?: string; sortOrder?: string }) {
    let result = [...this.tasks];
    
    if (filters.status) {
      result = result.filter(t => t.status === filters.status);
    }
    if (filters.priority) {
      result = result.filter(t => t.priority === filters.priority);
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(s) || 
        (t.description && t.description.toLowerCase().includes(s))
      );
    }
    
    // Sort
    result.sort((a, b) => {
      if (filters.sortBy === 'title') {
        return filters.sortOrder === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      if (filters.sortBy === 'priority') {
        const order = { high: 1, medium: 2, low: 3 };
        const diff = order[a.priority] - order[b.priority];
        return filters.sortOrder === 'asc' ? diff : -diff;
      }
      // default created_at
      const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return filters.sortOrder === 'asc' ? diff : -diff;
    });

    return result;
  }

  getById(id: string) {
    return this.tasks.find(t => t.id === id) || null;
  }

  create(data: { title: string; description?: string | null; status: TaskStatus; priority: TaskPriority }) {
    const task: Task = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description || null,
      status: data.status,
      priority: data.priority,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.tasks.unshift(task);
    return task;
  }

  update(id: string, data: Partial<{ title: string; description: string | null; status: TaskStatus; priority: TaskPriority }>) {
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.tasks[idx] = {
      ...this.tasks[idx],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return this.tasks[idx];
  }

  delete(id: string) {
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx === -1) return false;
    this.tasks.splice(idx, 1);
    return true;
  }

  stats() {
    return {
      total: this.tasks.length,
      pending: this.tasks.filter(t => t.status === 'pending').length,
      completed: this.tasks.filter(t => t.status === 'completed').length,
      high_priority_pending: this.tasks.filter(t => t.priority === 'high' && t.status === 'pending').length,
    };
  }
}

export const memoryStore = new MemoryStore();

export function useMemoryStore() {
  return !process.env.DATABASE_URL;
}

// Wrapper functions that use DB or memory based on env
export const taskStore = {
  async list(params: { status?: TaskStatus; priority?: TaskPriority; search?: string; sortBy: string; sortOrder: string; limit: number; offset: number }) {
    if (useMemoryStore()) {
      const all = memoryStore.list(params);
      const total = all.length;
      const paginated = all.slice(params.offset, params.offset + params.limit);
      return { rows: paginated, total };
    }

    // DB logic - same as before but extracted
    let baseQuery = 'FROM tasks WHERE 1=1';
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (params.status) {
      baseQuery += ` AND status = $${paramIndex++}`;
      queryParams.push(params.status);
    }
    if (params.priority) {
      baseQuery += ` AND priority = $${paramIndex++}`;
      queryParams.push(params.priority);
    }
    if (params.search) {
      baseQuery += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      queryParams.push(`%${params.search}%`);
      paramIndex++;
    }

    const countResult = await pool.query(`SELECT COUNT(*) ${baseQuery}`, queryParams);
    const total = parseInt(countResult.rows[0].count);

    let orderByClause = '';
    if (params.sortBy === 'priority') {
      orderByClause = `ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END ${params.sortOrder}, created_at DESC`;
    } else {
      const allowedSort = ['created_at', 'title', 'status'];
      const safeSortBy = allowedSort.includes(params.sortBy) ? params.sortBy : 'created_at';
      const safeOrder = params.sortOrder === 'asc' ? 'ASC' : 'DESC';
      orderByClause = `ORDER BY ${safeSortBy} ${safeOrder}`;
    }

    const dataQuery = `SELECT * ${baseQuery} ${orderByClause} LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    const dataParams = [...queryParams, params.limit, params.offset];
    const result = await pool.query(dataQuery, dataParams);

    return { rows: result.rows, total };
  },

  async stats() {
    if (useMemoryStore()) {
      const s = memoryStore.stats();
      return {
        total: s.total,
        pending: s.pending,
        completed: s.completed,
        high_priority_pending: s.high_priority_pending,
      };
    }
    const result = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE priority = 'high' AND status = 'pending') as high_priority_pending
      FROM tasks
    `);
    return {
      total: parseInt(result.rows[0].total),
      pending: parseInt(result.rows[0].pending),
      completed: parseInt(result.rows[0].completed),
      high_priority_pending: parseInt(result.rows[0].high_priority_pending),
    };
  },

  async getById(id: string) {
    if (useMemoryStore()) {
      return memoryStore.getById(id);
    }
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async create(data: { title: string; description?: string | null; status: TaskStatus; priority: TaskPriority }) {
    if (useMemoryStore()) {
      return memoryStore.create(data);
    }
    const result = await pool.query(
      `INSERT INTO tasks (title, description, status, priority) VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.title, data.description || null, data.status, data.priority]
    );
    return result.rows[0];
  },

  async update(id: string, data: Partial<{ title: string; description: string | null; status: TaskStatus; priority: TaskPriority }>) {
    if (useMemoryStore()) {
      return memoryStore.update(id, data);
    }
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      fields.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }
    if (data.priority !== undefined) {
      fields.push(`priority = $${paramIndex++}`);
      values.push(data.priority);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  async delete(id: string) {
    if (useMemoryStore()) {
      return memoryStore.delete(id);
    }
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  },

  async updateStatus(id: string, status: TaskStatus) {
    if (useMemoryStore()) {
      return memoryStore.update(id, { status });
    }
    const result = await pool.query('UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    return result.rows[0] || null;
  }
};
