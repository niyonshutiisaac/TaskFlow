# Taskflow — Professional Task Management System



![Taskflow Preview](https://img.shields.io/badge/Stack-React%20%7C%20Express%20%7C%20Neon%20PG-111111?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ✨ Features

### Core (Required)
- ✅ **View all tasks** — list and board views
- ✅ **Create task** — with validation
- ✅ **Edit task** — inline modal editing
- ✅ **Delete task** — with confirmation
- ✅ **Mark as Pending/Completed** — one-click toggle
- ✅ **Filter by status** — All / Pending / Completed
- ✅ **Task fields**: id, title, description, status, priority, createdAt, updatedAt

### Bonus (Optional - Implemented)
- 🔍 **Search** — debounced search across title & description
- 📊 **Priority filter** — Low / Medium / High
- ↕️ **Sorting** — by date, title, priority
- 📈 **Statistics** — total, pending, completed, high-priority overview
- ✅ **Form validation** — client & server (Zod)
- 📱 **Responsive** — mobile-first, professional aesthetic
- ⌨️ **Keyboard shortcut** — Press `N` to create task
- 🎨 **Polished UI** — Notion/Linear inspired, non-AI look
- 🔄 **Optimistic updates** — instant feedback
- 📄 **Pagination** — server-side with total count

---

## 🛠️ Technologies

| Layer | Tech | Why |
|-------|------|-----|
| **Frontend** | React 18 + TypeScript + Vite | Fast, modern, type-safe |
| **Styling** | Tailwind CSS + Lucide Icons | Professional, maintainable |
| **Backend** | Node.js + Express + TypeScript | Lightweight, familiar |
| **Database** | PostgreSQL (Neon) | Serverless, scalable, required |
| **Validation** | Zod | Runtime + compile-time safety |
| **Deployment** | Vercel / Render / Railway | Easy full-stack hosting |

### Why Neon?
- Serverless PostgreSQL with autoscaling
- Built-in connection pooling (important for serverless)
- Free tier generous for projects
- SSL enforced — secure by default
- Branching for preview deployments

---

## 📁 Project Structure

```
taskflow/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express app entry
│   │   ├── db.ts                 # Neon PG pool + init
│   │   ├── types.ts              # Shared types
│   │   ├── middleware/
│   │   │   └── errorHandler.ts   # Centralized error handling
│   │   └── routes/
│   │       └── tasks.ts          # REST API endpoints
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx               # Main app + state
│   │   ├── main.tsx
│   │   ├── index.css             # Tailwind + custom styles
│   │   ├── types/                # Frontend types
│   │   ├── api/client.ts         # API client
│   │   └── components/
│   │       ├── TaskCard.tsx      # Task item
│   │       ├── TaskForm.tsx      # Create/edit modal
│   │       ├── FilterBar.tsx     # Search & filters
│   │       ├── StatsOverview.tsx # Stats cards
│   │       ├── EmptyState.tsx    # Empty / no results
│   │       └── Toast.tsx         # Notifications
│   ├── vite.config.ts
│   └── tailwind.config.js
│
└── README.md
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ 
- npm or yarn
- Neon account (free) — https://console.neon.tech

### 2. Setup Neon PostgreSQL

1. Go to https://console.neon.tech → **Create Project**
2. Name: `taskflow`, Region: closest to you
3. Copy connection string:  
   `postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require`
4. Keep it — you'll need it for `.env`

> **Why Neon requires `sslmode=require`?** Neon enforces SSL. Our backend config already handles this with `rejectUnauthorized: false` for serverless compatibility.

### 3. Backend Setup

```bash
cd backend
npm install

# Create .env
cp .env.example .env
# Edit .env and paste your DATABASE_URL

# Run dev server
npm run dev
# → http://localhost:5000
# → Health: http://localhost:5000/api/health
```

The server will:
- Auto-create `tasks` table if not exists
- Create indexes for performance
- Seed 5 sample tasks on first run

### 4. Frontend Setup

```bash
cd ../frontend
npm install

# Optional: create .env
cp .env.example .env
# VITE_API_URL=/api uses Vite proxy (recommended for dev)

npm run dev
# → http://localhost:5173
```

Vite proxy forwards `/api/*` → `http://localhost:5000/api/*` so no CORS issues in dev.

### 5. Verify

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API: http://localhost:5000/api/tasks
- Health: http://localhost:5000/api/health

---

## 🔌 API Documentation

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Purpose | Body / Query |
|--------|----------|---------|--------------|
| GET | `/tasks` | List tasks | `?status=pending&priority=high&search=bug&page=1&limit=20&sortBy=created_at&sortOrder=desc` |
| GET | `/tasks/stats` | Stats overview | - |
| GET | `/tasks/:id` | Get one task | - |
| POST | `/tasks` | Create task | `{ title, description?, status?, priority? }` |
| PUT | `/tasks/:id` | Update task | `{ title?, description?, status?, priority? }` |
| PATCH | `/tasks/:id/status` | Toggle status | `{ status: 'pending' \| 'completed' }` |
| DELETE | `/tasks/:id` | Delete task | - |
| GET | `/health` | Health check | - |

### Example Requests

```bash
# Create
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Design landing","description":"Wireframes","priority":"high"}'

# List with filters
curl "http://localhost:5000/api/tasks?status=pending&priority=high&search=design"

# Update
curl -X PUT http://localhost:5000/api/tasks/<id> \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'

# Delete
curl -X DELETE http://localhost:5000/api/tasks/<id>
```

### Response Format

```json
{
  "success": true,
  "data": [{ "id": "...", "title": "...", "status": "pending", "priority": "high", "created_at": "..." }],
  "pagination": { "total": 25, "page": 1, "limit": 20, "totalPages": 2 }
}
```

---

## 🧠 Technical Decisions

### 1. **Why UUID for id?**
- Safer than auto-increment for distributed systems
- Neon supports `gen_random_uuid()` natively
- No enumeration attack

### 2. **Why Zod validation?**
- Shared schema between frontend/backend mental model
- Better error messages than manual checks
- Type inference → TypeScript types from schema

### 3. **Why Optimistic Updates?**
- Toggle status feels instant
- Rollback on failure — better UX than spinner
- Common pattern in Linear, Notion

### 4. **Why Not ORM?**
- For this scale, raw `pg` is simpler and more explainable
- Full control over queries, indexes
- Easy to show SQL knowledge in interview
- If scaling: consider Drizzle or Prisma

### 5. **Database Indexes**
```sql
idx_tasks_status, idx_tasks_priority, idx_tasks_created_at DESC
```
- Filters are the main query pattern
- Sorting by date is default

### 6. **UI Design Philosophy**
- **Not AI-generated look**: Avoided purple gradients, excessive rounded-3xl, generic Inter + huge shadows
- **Inspired by**: Linear (density), Notion (typography), Vercel (borders)
- **Colors**: Warm off-white #FAFAF8, ink black #111111, stone borders #E8E6E1
- **Typography**: 11-14px small UI, tight tracking, 500-600 weights
- **Spacing**: 12px radius, soft shadows, 1.5px borders

---

## 🧪 Testing the App (Manual)

1. **Create** → Click "New task" or press `N`, fill title, try empty title → validation
2. **Edit** → Click ••• → Edit, change priority
3. **Toggle** → Click checkbox → should move between Pending/Completed (board view)
4. **Filter** → Click Pending / Completed pills
5. **Search** → Type "design" → debounced
6. **Delete** → ••• → Delete → confirm
7. **Responsive** → Resize to mobile → layout adapts

---

## 🚢 Deployment

### Backend (Render / Railway / Fly.io)

1. Push to GitHub
2. Create new Web Service → connect repo → Root: `backend`
3. Build: `npm install && npm run build`
4. Start: `npm start`
5. Env vars: `DATABASE_URL`, `FRONTEND_URL`, `PORT=5000`

### Frontend (Vercel)

1. Import project → Root: `frontend`
2. Build: `npm run build`
3. Env: `VITE_API_URL=https://your-backend.onrender.com/api`

### Database (Neon)

- Already hosted — just use connection string
- Enable **Pooled connection** for serverless backends

### Live Demo Checklist

- [ ] Backend deployed and `/api/health` returns `connected`
- [ ] Frontend deployed and can fetch tasks
- [ ] CORS set to frontend URL
- [ ] Add live links here:

```
Frontend: https://taskflow-xyz.vercel.app
Backend:  https://taskflow-api.onrender.com
```

---

## 🔒 Environment Variables

**Backend `.env`**
```
PORT=5000
DATABASE_URL=postgresql://...@ep-xxx.neon.tech/neondb?sslmode=require
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend `.env`**
```
VITE_API_URL=/api
# Production: VITE_API_URL=https://api.yourdomain.com/api
```

---

## 🤝 How to Explain This in Interview

**Architecture**: "I used a classic 3-tier: React frontend with Vite for speed, Express backend with TypeScript for type safety, and Neon PostgreSQL for serverless Postgres. Frontend talks to backend via REST, backend uses pg Pool with SSL for Neon."

**Database**: "Tasks table with UUID PK, check constraints for status/priority, indexes on filter columns, and a trigger for updated_at. Init function creates table and seeds if empty."

**API Design**: "RESTful, with filtering via query params, pagination, and Zod validation. I added stats endpoint as bonus — useful for dashboard. Error handler centralizes DB errors."

**Frontend State**: "useState + useEffect, no Redux needed for this scale. Debounced search to avoid spamming API. Optimistic update for toggle status."

**UI**: "I wanted professional, not AI-generated. So I used neutral warm palette, tight typography, subtle borders instead of big shadows, and Linear-like density."

---

## 📝 Future Improvements

- [ ] User authentication (JWT + Neon)
- [ ] Drag & drop board (dnd-kit)
- [ ] Due dates & reminders
- [ ] Collaborative editing (WebSockets)
- [ ] Tests (Vitest + Supertest)
- [ ] Offline support (IndexedDB)

---

## 👤 Author

Built for **kLab Tech Upskill Program 2026**  
Focus: Clean code, maintainability, explainability.

---

## 📄 License

MIT — feel free to fork and adapt.
