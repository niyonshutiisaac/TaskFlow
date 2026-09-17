# kLab Tech Upskill - Submission Guide

## Project: Taskflow — Task Management System

### Repository Structure
This project is ready to push to GitHub. Create a new repo and push:

```bash
cd taskflow
git init
git add .
git commit -m "feat: complete task management system - kLab challenge"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/taskflow.git
git push -u origin main
```

### Live Demo (Current Preview)
- **Frontend**: https://5173-ivwr5x0m82jrbomypmpph.e2b.app (E2B sandbox preview)
- **Backend API**: https://5000-ivwr5x0m82jrbomypmpph.e2b.app/api/health
- **For production**: Deploy to Vercel (frontend) + Render (backend) + Neon (DB)

### What to Submit in Form

**Full Name**: [Your Name]  
**Email**: [Your Email]  
**GitHub Repo**: `https://github.com/YOUR_USERNAME/taskflow`  
**Live Demo**: Your Vercel link after deployment  
**Technologies Used**: 
- Frontend: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- Backend: Node.js, Express, TypeScript, pg, Zod
- Database: PostgreSQL via Neon (serverless)
- Deployment: Vercel + Render + Neon

### How to Demo to Reviewers

1. Show **Stats Overview** — explains data aggregation
2. Show **Search** — debounced, searches title + description
3. Show **Filters** — status (pending/completed) + priority
4. Create task — validation, press N shortcut
5. Toggle status — optimistic update
6. Edit/Delete — ••• menu
7. Switch **List / Board** view — board groups by status
8. Show **API docs** in README
9. Show **Neon console** — table, indexes, data
10. Explain **clean code** — separation of concerns, types, error handling

### Key Talking Points

- **Why Neon?** Serverless Postgres, autoscaling, pooling, free tier, branching for previews
- **Why no ORM?** For interview, raw SQL shows understanding; pg Pool with SSL config
- **Why Zod?** Runtime validation + TS inference
- **UI decisions**: Avoided AI look (no purple gradient), used warm neutral palette #FAFAF8, ink black, stone borders, Linear-inspired density
- **Fallback memory store**: Works without DB for demo, but production uses Neon — shows defensive coding

### Deployment Steps (5 min)

**Neon**:
1. console.neon.tech → Create project → Copy pooled connection string

**Backend on Render**:
1. New Web Service → Connect GitHub → Root: `backend`
2. Build: `npm install && npm run build`
3. Start: `npm start`
4. Env: DATABASE_URL, FRONTEND_URL, NODE_ENV=production

**Frontend on Vercel**:
1. Import → Root: `frontend`
2. Build: `npm run build`
3. Env: VITE_API_URL=https://your-backend.onrender.com/api

### Checklist Before Submit

- [x] All CRUD endpoints work
- [x] Filtering by status works
- [x] Search works
- [x] Validation (frontend + backend)
- [x] Professional UI (not AI-looking)
- [x] TypeScript everywhere
- [x] README with install, DB setup, decisions
- [x] .env.example files
- [x] Clean, maintainable code
- [ ] Deploy and add live links to README
- [ ] Push to GitHub
- [ ] Submit form

Good luck! 🚀
