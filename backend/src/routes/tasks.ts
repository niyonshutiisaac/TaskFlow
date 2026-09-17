import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { taskStore } from '../store';

const router = Router();

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').trim(),
  description: z.string().max(2000, 'Description too long').optional().or(z.literal('')),
  status: z.enum(['pending', 'completed']).optional().default('pending'),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).trim().optional(),
  description: z.string().max(2000).optional().or(z.literal('')),
  status: z.enum(['pending', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

const querySchema = z.object({
  status: z.enum(['pending', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sortBy: z.enum(['created_at', 'title', 'priority', 'status']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// GET /tasks - List all tasks with filtering, search, pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { status, priority, search, page, limit, sortBy, sortOrder } = parsed.data;
    const offset = (page - 1) * limit;

    const { rows, total } = await taskStore.list({
      status,
      priority,
      search,
      sortBy,
      sortOrder,
      limit,
      offset,
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /tasks error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
  }
});

// GET /tasks/stats - Get task statistics (must be before /:id)
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await taskStore.stats();
    res.json({
      success: true,
      data: {
        total: stats.total,
        pending: stats.pending,
        completed: stats.completed,
        highPriorityPending: stats.high_priority_pending,
      },
    });
  } catch (error) {
    console.error('GET /tasks/stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// GET /tasks/:id - Get single task
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const task = await taskStore.getById(id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    console.error('GET /tasks/:id error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch task' });
  }
});

// POST /tasks - Create new task
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { title, description, status, priority } = parsed.data;
    const task = await taskStore.create({
      title,
      description: description || null,
      status: status as any,
      priority: priority as any,
    });

    res.status(201).json({
      success: true,
      data: task,
      message: 'Task created successfully',
    });
  } catch (error) {
    console.error('POST /tasks error:', error);
    res.status(500).json({ success: false, message: 'Failed to create task' });
  }
});

// PUT /tasks/:id - Update task
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = updateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const updates = parsed.data;
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const normalized: any = {};
    if (updates.title !== undefined) normalized.title = updates.title;
    if (updates.description !== undefined) normalized.description = updates.description || null;
    if (updates.status !== undefined) normalized.status = updates.status;
    if (updates.priority !== undefined) normalized.priority = updates.priority;

    const task = await taskStore.update(id, normalized);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({
      success: true,
      data: task,
      message: 'Task updated successfully',
    });
  } catch (error) {
    console.error('PUT /tasks/:id error:', error);
    res.status(500).json({ success: false, message: 'Failed to update task' });
  }
});

// PATCH /tasks/:id/status - Quick status toggle
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const task = await taskStore.updateStatus(id, status);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    console.error('PATCH status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

// DELETE /tasks/:id - Delete task
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await taskStore.delete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('DELETE /tasks/:id error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete task' });
  }
});

export default router;
