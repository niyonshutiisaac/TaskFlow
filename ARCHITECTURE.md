# Architecture & Code Explanation

This document helps you explain the solution in interview.

## 1. High-Level Architecture

```
┌─────────────────┐      REST API      ┌──────────────────┐      SQL      ┌──────────────┐
│  React Frontend │  ───────────────►  │ Express Backend  │  ───────────►  │ Neon Postgres│
│  (Vite + TS)    │  ◄───────────────  │  (TS + Zod)      │  ◄───────────  │  (Serverless)│
└─────────────────┘   JSON + CORS      └──────────────────┘   pg Pool      └──────────────┘
```

- Frontend: SPA, no SSR needed, Vite for fast HMR
- Backend: Stateless, horizontal scalable, 3 endpoints groups: tasks, stats, health
- DB: Single table `tasks`, with indexes, trigger for updated_at

## 2. Database Schema

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL CHECK (char_length(title) >=1 AND <=255),
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','completed')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for filter queries
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

-- Auto-update updated_at
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Why UUID?** No sequential ID leakage, safe for distributed.

**Why TIMESTAMPTZ?** Neon stores UTC, frontend formats local.

## 3. Backend Layers

- `index.ts`: App bootstrap, CORS, logging, graceful shutdown, DB init
- `db.ts`: pg Pool config, SSL handling for Neon, initDatabase(), healthCheck()
- `store.ts`: Abstraction over storage — uses memory if no DATABASE_URL, else Postgres. Makes local dev easy without Neon.
- `routes/tasks.ts`: All 5 required endpoints + stats + status patch. Zod validation, pagination, search via ILIKE, sorting with CASE for priority.
- `middleware/errorHandler.ts`: Centralized, handles Postgres error codes (23505, 22P02)
- `types.ts`: Shared TS types

**Request Flow**:
```
Request → CORS → JSON parser → Logging → Router → Zod validation → Store (DB/Memory) → JSON response → Error handler
```

**Validation Example**:
```ts
const createTaskSchema = z.object({
  title: z.string().min(1).max(255).trim(),
  description: z.string().max(2000).optional(),
  status: z.enum(['pending','completed']).default('pending'),
  priority: z.enum(['low','medium','high']).default('medium'),
});
```

## 4. Frontend Layers

- `App.tsx`: Main state, fetchTasks with useCallback, debounced search (300ms), optimistic toggle, keyboard shortcut (N), toasts, viewMode (list/board)
- `api/client.ts`: Fetch wrapper, ApiError class, tasksApi object — mirrors backend endpoints
- `components/`:
  - `TaskCard`: Checkbox, priority dot, status pill, date, ••• menu with edit/delete, line-clamp, hover states
  - `TaskForm`: Modal, controlled inputs, validation, character count, backdrop blur
  - `FilterBar`: Search input with icon, pill filters for status/priority, sort select
  - `StatsOverview`: 4 cards, progress bar, icons, loading skeleton
  - `EmptyState`: 3 variants (empty, no-results, error) with CTA
  - `Toast`: Success/error, auto-dismiss 4s, slide-up animation
- `types/index.ts`: Frontend types mirroring backend
- `index.css`: Tailwind + custom checkbox, scrollbar, focus-ring, animations

**State Management**: useState + useEffect, no Redux — overkill for this size. If scaling, would use Zustand or TanStack Query.

**Performance**:
- Debounced search avoids API spam
- Optimistic updates for toggle
- CSS-only animations (no JS)
- Tailwind purging → small CSS bundle (21kB)

## 5. UI/UX Decisions (Professional, Non-AI)

**Problem with AI-generated UI**: Purple gradients, huge rounded-3xl, excessive shadows, generic Inter 16px everywhere, centered cards with emoji.

**Our Approach**:
- Palette: Warm paper #FAFAF8 background, ink #111111 for primary, stone #E8E6E1 borders — inspired by Linear, Notion, Vercel
- Typography: 11-14px for UI, tight tracking (-0.01em), 500-600 weights, mono for kbd
- Density: 12px radius, 1.5px borders, soft shadow (0 1px 3px rgba), not large
- Components: Small pills (10px radius, 11px uppercase), checkbox 20px with 6px radius, not default browser
- Layout: Sidebar 280px sticky, main max 1200px, not full-width centered blob
- Details: ••• menu only on hover, progress bar, kbd hint, board view groups

**Result**: Looks like a real startup internal tool, not a demo.

## 6. How to Explain Each File in 30 Seconds

- **backend/src/index.ts**: "Express bootstrap, CORS for frontend, health check, graceful shutdown, starts server after DB init"
- **db.ts**: "pg Pool with SSL for Neon, init creates table, indexes, trigger, seeds if empty"
- **store.ts**: "Abstraction so app works without DB — memory store for demo, Postgres for prod, same interface"
- **routes/tasks.ts**: "REST endpoints, Zod validation, query builder for filters/search, pagination, stats via FILTER clause"
- **App.tsx**: "Main app, fetches tasks with filters, debounced search, optimistic toggle, keyboard shortcut N, toast notifications"
- **TaskCard.tsx**: "Displays task, checkbox toggles status, priority dot, status pill, ••• menu, hover interactions"
- **TaskForm.tsx**: "Modal form, controlled inputs, validation, create vs edit mode, backdrop blur"

## 7. What Would You Add Next?

- Auth: JWT + Neon, user_id foreign key
- Real-time: WebSockets for collaborative
- DnD: dnd-kit for board drag-drop
- Tests: Vitest for frontend, Supertest for API, Playwright E2E
- Caching: TanStack Query + Redis
- CI/CD: GitHub Actions → Vercel/Render auto-deploy
