# Repository Navigation Guide

**Purpose**: This file helps AI agents and developers quickly navigate the codebase by providing a structured index of all important files and their purposes.

**Last Updated**: September 30, 2025

---

## 📖 **Getting Started**

### **Essential Documentation**
- [`README.md`](README.md) - Project overview and quick start
- [`SETUP.md`](SETUP.md) - Complete setup and installation guide
- [`BACKLOG.md`](BACKLOG.md) - Technical debt and future improvements

### **Configuration Files**
- [`pyproject.toml`](pyproject.toml) - Root Python project configuration
- [`vercel.json`](vercel.json) - Vercel deployment configuration for frontend

---

## 🎯 **Current Project: Evals Harness Platform**

### **Project Documentation**
All documentation for the active evals platform implementation:

- [`projects/evals-harness-platform/README.md`](projects/evals-harness-platform/README.md) - Project overview and objectives
- [`projects/evals-harness-platform/spec.md`](projects/evals-harness-platform/spec.md) - Technical specification and architecture
- [`projects/evals-harness-platform/todo.md`](projects/evals-harness-platform/todo.md) - Linear issues tracking and progress

### **Planning Documents**
- [`projects/evals-harness-platform/plan_ui_implementation.md`](projects/evals-harness-platform/plan_ui_implementation.md) - Frontend implementation plan
- [`projects/evals-harness-platform/plan_backend_implementation.md`](projects/evals-harness-platform/plan_backend_implementation.md) - Backend implementation plan
- [`projects/evals-harness-platform/braindump.md`](projects/evals-harness-platform/braindump.md) - Initial requirements and ideas

### **Progress Tracking**
- [`projects/evals-harness-platform/logs.md`](projects/evals-harness-platform/logs.md) - Implementation progress and decisions
- [`projects/evals-harness-platform/metrics.md`](projects/evals-harness-platform/metrics.md) - Performance and quality metrics
- [`projects/evals-harness-platform/lessons_learned.md`](projects/evals-harness-platform/lessons_learned.md) - Insights from implementation

### **Implementation Tickets**
All tickets are in [`projects/evals-harness-platform/tickets/`](projects/evals-harness-platform/tickets/):

- ✅ [`ticket-001-basic-ui.md`](projects/evals-harness-platform/tickets/ticket-001-basic-ui.md) - Basic stateless UI (MET-55) - DONE
- ✅ [`ticket-002-vercel-deployment.md`](projects/evals-harness-platform/tickets/ticket-002-vercel-deployment.md) - Vercel deployment (MET-56) - DONE
- ✅ [`ticket-003-fastapi-backend.md`](projects/evals-harness-platform/tickets/ticket-003-fastapi-backend.md) - FastAPI backend (MET-57) - DONE
- 📋 [`ticket-004-api-integration.md`](projects/evals-harness-platform/tickets/ticket-004-api-integration.md) - Frontend-backend integration (MET-58)
- 📋 [`ticket-005-error-analysis.md`](projects/evals-harness-platform/tickets/ticket-005-error-analysis.md) - Error analysis and LLM-as-judge (MET-59)
- 📋 [`ticket-006-cost-monitoring.md`](projects/evals-harness-platform/tickets/ticket-006-cost-monitoring.md) - Cost tracking (MET-60)

### **Retrospectives**
- [`projects/evals-harness-platform/retrospective/README.md`](projects/evals-harness-platform/retrospective/README.md) - Post-project analysis

---

## 🖥️ **Backend** (`/backend/`)

**📍 See [`backend/ROUTER.md`](backend/ROUTER.md) for complete backend navigation guide**

### **Quick Links**
- [`backend/README.md`](backend/README.md) - Setup and API documentation
- [`backend/pyproject.toml`](backend/pyproject.toml) - Dependencies and configuration
- [`backend/app/`](backend/app/) - Application code (API, models, services)
- [`backend/tests/`](backend/tests/) - Test suite (40 tests, 70% coverage)
- [`backend/scripts/seed_data.py`](backend/scripts/seed_data.py) - Database seeding

### **Key Modules**
- **API**: FastAPI routes in `backend/app/api/`
- **Services**: OpenRouter client, evaluation engine in `backend/app/services/`
- **Pricing**: Model-specific pricing in `backend/app/utils/pricing.py`
- **Database**: SQLAlchemy models in `backend/app/models/`

---

## 🎨 **Frontend** (`/frontend/`)

**📍 See [`frontend/ROUTER.md`](frontend/ROUTER.md) for complete frontend navigation guide**

### **Quick Links**
- [`frontend/README.md`](frontend/README.md) - Setup and development guide
- [`frontend/package.json`](frontend/package.json) - Dependencies and scripts
- [`frontend/src/app/`](frontend/src/app/) - Next.js pages
- [`frontend/src/components/`](frontend/src/components/) - React components
- [`frontend/__tests__/`](frontend/__tests__/) - Test suite

### **Key Modules**
- **Pages**: Main dashboard in `frontend/src/app/page.tsx`
- **Tabs**: Feature tabs in `frontend/src/components/tabs/`
- **Forms**: Form components in `frontend/src/components/forms/`
- **UI**: shadcn/ui components in `frontend/src/components/ui/`
- **Data**: Data loading in `frontend/src/lib/data.ts`

---

## 🗂️ **File Organization Patterns**

### **How to Navigate This Repository**

1. **Starting a new task?**
   - Check [`ROUTER.md`](ROUTER.md) (this file) for file locations
   - Read [`projects/evals-harness-platform/spec.md`](projects/evals-harness-platform/spec.md) for technical details
   - Check [`projects/evals-harness-platform/todo.md`](projects/evals-harness-platform/todo.md) for current status

2. **Working on backend?**
   - See **[`backend/ROUTER.md`](backend/ROUTER.md)** for complete backend navigation
   - Quick start: [`backend/README.md`](backend/README.md)

3. **Working on frontend?**
   - See **[`frontend/ROUTER.md`](frontend/ROUTER.md)** for complete frontend navigation
   - Quick start: [`frontend/README.md`](frontend/README.md)

4. **Need an AI agent persona?**
   - Engineering: [`ai_tools/agents/personas/engineering/router.md`](ai_tools/agents/personas/engineering/router.md)
   - AI Engineering: [`ai_tools/agents/personas/ai_engineering/router.md`](ai_tools/agents/personas/ai_engineering/router.md)
   - Research: [`ai_tools/agents/personas/research/router.md`](ai_tools/agents/personas/research/router.md)
   - Creative Production: [`ai_tools/agents/personas/creative_production/router.md`](ai_tools/agents/personas/creative_production/router.md)

5. **Looking for task instructions?**
   - Quick reference: [`ai_tools/agents/task_instructions/QUICK_REFERENCE.md`](ai_tools/agents/task_instructions/QUICK_REFERENCE.md)
   - Code review: [`ai_tools/agents/task_instructions/collaborative_review/`](ai_tools/agents/task_instructions/collaborative_review/)
   - Execution planning: [`ai_tools/agents/task_instructions/execution/`](ai_tools/agents/task_instructions/execution/)
   - Critical analysis: [`ai_tools/agents/task_instructions/execution/CRITICAL_ANALYSIS_PROMPT.md`](ai_tools/agents/task_instructions/execution/CRITICAL_ANALYSIS_PROMPT.md)

---

## 📊 **Key Metrics & Status**

### **Current Status** (as of September 30, 2025)
- ✅ Frontend deployed: https://frontend-6di9lbbgg-marktorres10s-projects.vercel.app
- ✅ Backend implemented: FastAPI + SQLite (PR #3)
- 📋 Backend deployment: Pending (Railway)
- 📋 Integration: Next phase (MET-58)

### **Progress**
- **Phase 1 (Frontend)**: ✅ 100% complete (MET-55, MET-56)
- **Phase 2 (Backend)**: ✅ 100% complete (MET-57)
- **Phase 3 (Integration)**: 📋 0% complete (MET-58, MET-59)
- **Phase 4 (Monitoring)**: 📋 0% complete (MET-60)

### **Test Coverage**
- **Backend**: 70% overall (pricing 100%, eval engine 89%, openrouter 88%, middleware 82%)
- **Frontend**: Tests configured, components tested

### **Quality Gates**
- ✅ Linting: Ruff (backend), ESLint (frontend)
- ✅ Type checking: mypy (backend), TypeScript (frontend)
- ✅ Pre-commit hooks: Configured for both
- ✅ CI/CD: Vercel (frontend), Railway pending (backend)

---

## 🔍 **Search Patterns for AI Agents**

### **Common Queries**

**"How do I navigate the backend code?"**
→ **[`backend/ROUTER.md`](backend/ROUTER.md)**

**"How do I navigate the frontend code?"**
→ **[`frontend/ROUTER.md`](frontend/ROUTER.md)**

**"What's the overall architecture?"**
→ `projects/evals-harness-platform/spec.md`

**"What are the current tasks?"**
→ `projects/evals-harness-platform/todo.md`

**"What should I work on next?"**
→ `projects/evals-harness-platform/todo.md` (check Linear status)

**"What technical debt exists?"**
→ `BACKLOG.md`

**"How do I set up the project?"**
→ `SETUP.md` (detailed) or `README.md` (quick start)

**"What AI personas are available?"**
→ See routers: `ai_tools/agents/personas/*/router.md`

**"Where are the task instructions for AI agents?"**
→ `ai_tools/agents/task_instructions/` (organized by category)

---

## 🔄 **Maintenance**

This router file should be updated when:
- New major features are added
- New documentation is created
- Directory structure changes significantly
- New important files are added to the root

**Update frequency**: Every major milestone or sprint
