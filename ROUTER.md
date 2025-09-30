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

### **Documentation**
- [`backend/README.md`](backend/README.md) - Backend setup, API endpoints, development guide
- [`backend/pyproject.toml`](backend/pyproject.toml) - Python dependencies and tool configuration
- [`backend/.env.example`](backend/.env.example) - Environment variables template

### **Application Code** (`backend/app/`)

**Core Application**:
- [`app/main.py`](backend/app/main.py) - FastAPI application entry point, middleware, routers
- [`app/config.py`](backend/app/config.py) - Configuration management with Pydantic Settings
- [`app/database.py`](backend/app/database.py) - SQLAlchemy engine, session, database initialization

**API Routes** (`backend/app/api/`):
- [`api/tasks.py`](backend/app/api/tasks.py) - Evaluation task CRUD endpoints
- [`api/models.py`](backend/app/api/models.py) - Model configuration CRUD endpoints
- [`api/evaluations.py`](backend/app/api/evaluations.py) - Evaluation execution endpoint
- [`api/results.py`](backend/app/api/results.py) - Results retrieval and filtering

**Database Models** (`backend/app/models/`):
- [`models/eval_tasks.py`](backend/app/models/eval_tasks.py) - EvalTask ORM model
- [`models/models.py`](backend/app/models/models.py) - Model configuration ORM model
- [`models/eval_results.py`](backend/app/models/eval_results.py) - EvalResult ORM model
- [`models/eval_runs.py`](backend/app/models/eval_runs.py) - EvalRun ORM model

**Pydantic Schemas** (`backend/app/schemas/`):
- [`schemas/task_schemas.py`](backend/app/schemas/task_schemas.py) - Task request/response schemas
- [`schemas/model_schemas.py`](backend/app/schemas/model_schemas.py) - Model request/response schemas
- [`schemas/result_schemas.py`](backend/app/schemas/result_schemas.py) - Result and run status schemas

**Business Logic** (`backend/app/services/`):
- [`services/openrouter_client.py`](backend/app/services/openrouter_client.py) - OpenRouter API client (circuit breaker, retry logic, cost tracking)
- [`services/evaluation_engine.py`](backend/app/services/evaluation_engine.py) - Evaluation logic for classification and generation tasks

**Utilities** (`backend/app/utils/`):
- [`utils/pricing.py`](backend/app/utils/pricing.py) - Model-specific pricing (30+ models, latest 2024/2025)
- [`utils/exceptions.py`](backend/app/utils/exceptions.py) - Custom exception classes
- [`utils/logging.py`](backend/app/utils/logging.py) - Logging configuration

**Middleware** (`backend/app/middleware/`):
- [`middleware/error_handling.py`](backend/app/middleware/error_handling.py) - Global error handling middleware

### **Testing** (`backend/tests/`)

**Test Configuration**:
- [`tests/conftest.py`](backend/tests/conftest.py) - Pytest fixtures and test database setup

**Unit Tests** (`backend/tests/unit/`):
- [`test_api_endpoints.py`](backend/tests/unit/test_api_endpoints.py) - API endpoint tests
- [`test_database_models.py`](backend/tests/unit/test_database_models.py) - ORM model tests
- [`test_evaluation_engine.py`](backend/tests/unit/test_evaluation_engine.py) - Basic evaluation engine tests
- [`test_evaluation_engine_comprehensive.py`](backend/tests/unit/test_evaluation_engine_comprehensive.py) - Comprehensive evaluation tests
- [`test_openrouter_client.py`](backend/tests/unit/test_openrouter_client.py) - OpenRouter client tests
- [`test_pricing.py`](backend/tests/unit/test_pricing.py) - Pricing utility tests
- [`test_middleware.py`](backend/tests/unit/test_middleware.py) - Middleware error handling tests

### **Scripts**
- [`backend/scripts/seed_data.py`](backend/scripts/seed_data.py) - Database seeding script (8 tasks, 5 models)

### **Quality Tools**
- [`backend/.pre-commit-config.yaml`](backend/.pre-commit-config.yaml) - Pre-commit hooks configuration
- [`backend/.gitignore`](backend/.gitignore) - Backend-specific git ignore rules

---

## 🎨 **Frontend** (`/frontend/`)

### **Documentation**
- [`frontend/README.md`](frontend/README.md) - Frontend setup and development guide
- [`frontend/package.json`](frontend/package.json) - Node.js dependencies and scripts
- [`frontend/tsconfig.json`](frontend/tsconfig.json) - TypeScript configuration

### **Application Code** (`frontend/src/`)

**Pages** (`frontend/src/app/`):
- [`app/page.tsx`](frontend/src/app/page.tsx) - Main dashboard page
- [`app/layout.tsx`](frontend/src/app/layout.tsx) - Root layout component
- [`app/globals.css`](frontend/src/app/globals.css) - Global styles

**Components** (`frontend/src/components/`):

**UI Components** (`components/ui/`):
- shadcn/ui components (Button, Card, Input, Label, Progress, Select, Table, Tabs, Badge, Alert, Dialog, Separator)

**Feature Components**:
- [`components/tabs/DashboardTab.tsx`](frontend/src/components/tabs/DashboardTab.tsx) - Dashboard overview
- [`components/tabs/TasksTab.tsx`](frontend/src/components/tabs/TasksTab.tsx) - Task management
- [`components/tabs/ModelsTab.tsx`](frontend/src/components/tabs/ModelsTab.tsx) - Model configuration
- [`components/tabs/EvaluateTab.tsx`](frontend/src/components/tabs/EvaluateTab.tsx) - Evaluation execution
- [`components/forms/TaskForm.tsx`](frontend/src/components/forms/TaskForm.tsx) - Task creation form
- [`components/forms/ModelForm.tsx`](frontend/src/components/forms/ModelForm.tsx) - Model configuration form
- [`components/layout/DashboardLayout.tsx`](frontend/src/components/layout/DashboardLayout.tsx) - Main layout wrapper
- [`components/tables/ResultsTable.tsx`](frontend/src/components/tables/ResultsTable.tsx) - Results display table

**Libraries** (`frontend/src/lib/`):
- [`lib/data.ts`](frontend/src/lib/data.ts) - Data loading utilities (currently dummy data)
- [`lib/utils.ts`](frontend/src/lib/utils.ts) - Utility functions (cn, etc.)

**Types**:
- [`types/index.ts`](frontend/src/types/index.ts) - TypeScript type definitions

### **Testing** (`frontend/__tests__/`)
- [`__tests__/components/DashboardLayout.test.tsx`](frontend/__tests__/components/DashboardLayout.test.tsx)
- [`__tests__/components/TaskForm.test.tsx`](frontend/__tests__/components/TaskForm.test.tsx)
- [`__tests__/lib/data.test.ts`](frontend/__tests__/lib/data.test.ts)

### **Configuration**
- [`frontend/next.config.ts`](frontend/next.config.ts) - Next.js configuration
- [`frontend/components.json`](frontend/components.json) - shadcn/ui configuration
- [`frontend/postcss.config.mjs`](frontend/postcss.config.mjs) - PostCSS configuration
- [`frontend/jest.config.js`](frontend/jest.config.js) - Jest test configuration
- [`frontend/jest.setup.js`](frontend/jest.setup.js) - Jest setup file
- [`frontend/eslint.config.mjs`](frontend/eslint.config.mjs) - ESLint configuration

### **Static Assets**
- [`frontend/public/data/`](frontend/public/data/) - Dummy JSON data files (dashboard, tasks, models, runs, results)

---

## 🤖 **AI Agent Tools** (`/ai_tools/`)

### **Agent Configuration**
- [`ai_tools/agents/README.md`](ai_tools/agents/README.md) - Agent system overview
- [`ai_tools/agents/AGENT_CONVERSATION_STYLE.md`](ai_tools/agents/AGENT_CONVERSATION_STYLE.md) - Conversation guidelines
- [`ai_tools/agents/HOW_TO_WRITE_PROMPTS.md`](ai_tools/agents/HOW_TO_WRITE_PROMPTS.md) - Prompt writing guide

### **Personas** (`ai_tools/agents/personas/`)

**Engineering Personas**:
- [`personas/engineering/router.md`](ai_tools/agents/personas/engineering/router.md) - Engineering persona router
- [`personas/engineering/ai_engineer.md`](ai_tools/agents/personas/engineering/ai_engineer.md) - AI engineering specialist
- [`personas/engineering/frontend_developer.md`](ai_tools/agents/personas/engineering/frontend_developer.md) - Frontend specialist
- [`personas/engineering/rapid_prototyper.md`](ai_tools/agents/personas/engineering/rapid_prototyper.md) - Rapid prototyping specialist
- [`personas/engineering/backend/`](ai_tools/agents/personas/engineering/backend/) - Backend specialists
- [`personas/engineering/frontend/`](ai_tools/agents/personas/engineering/frontend/) - Frontend specialists (23 files)
- [`personas/engineering/devops/`](ai_tools/agents/personas/engineering/devops/) - DevOps specialists (20 files)
- [`personas/engineering/data_engineering/`](ai_tools/agents/personas/engineering/data_engineering/) - Data engineering specialists (35 files)
- [`personas/engineering/machine_learning/`](ai_tools/agents/personas/engineering/machine_learning/) - ML specialists

**AI Engineering Personas**:
- [`personas/ai_engineering/router.md`](ai_tools/agents/personas/ai_engineering/router.md) - AI engineering router
- [`personas/ai_engineering/domain_specific/llm_evaluation_platform_architect.md`](ai_tools/agents/personas/ai_engineering/domain_specific/llm_evaluation_platform_architect.md) - LLM eval platform expert
- [`personas/ai_engineering/domain_specific/ai_evals_methodology_expert.md`](ai_tools/agents/personas/ai_engineering/domain_specific/ai_evals_methodology_expert.md) - Evals methodology expert
- [`personas/ai_engineering/domain_specific/prompt_engineering_specialist.md`](ai_tools/agents/personas/ai_engineering/domain_specific/prompt_engineering_specialist.md) - Prompt engineering expert

**Research Personas**:
- [`personas/research/router.md`](ai_tools/agents/personas/research/router.md) - Research persona router
- [`personas/research/README.md`](ai_tools/agents/personas/research/README.md) - Research personas overview
- [`personas/research/methodology/`](ai_tools/agents/personas/research/methodology/) - Research methodology specialists (18 files)
- [`personas/research/workflow/`](ai_tools/agents/personas/research/workflow/) - Research workflow specialists (10 files)

**Creative Production Personas**:
- [`personas/creative_production/router.md`](ai_tools/agents/personas/creative_production/router.md) - Creative production router
- [`personas/creative_production/domain_specific/`](ai_tools/agents/personas/creative_production/domain_specific/) - Domain specialists (8 files)
- [`personas/creative_production/task_specific/`](ai_tools/agents/personas/creative_production/task_specific/) - Task specialists (4 files)
- [`personas/creative_production/tool_specific/`](ai_tools/agents/personas/creative_production/tool_specific/) - Tool specialists (7 files)

### **Task Instructions** (`ai_tools/agents/task_instructions/`)

**Execution**:
- [`task_instructions/execution/EXECUTION_PLANNING_PROMPT.md`](ai_tools/agents/task_instructions/execution/EXECUTION_PLANNING_PROMPT.md) - Execution planning framework
- [`task_instructions/execution/CRITICAL_ANALYSIS_PROMPT.md`](ai_tools/agents/task_instructions/execution/CRITICAL_ANALYSIS_PROMPT.md) - Critical analysis framework
- [`task_instructions/execution/`](ai_tools/agents/task_instructions/execution/) - 7 execution task files

**Code Review**:
- [`task_instructions/collaborative_review/COMPREHENSIVE_CODE_REVIEW_CHECKLIST.md`](ai_tools/agents/task_instructions/collaborative_review/COMPREHENSIVE_CODE_REVIEW_CHECKLIST.md) - Code review checklist
- [`task_instructions/collaborative_review/`](ai_tools/agents/task_instructions/collaborative_review/) - 3 review task files

**Project Management**:
- [`task_instructions/project_management/`](ai_tools/agents/task_instructions/project_management/) - 15 PM task files

**Engineering**:
- [`task_instructions/engineering/CODING_RULES.md`](ai_tools/agents/task_instructions/engineering/CODING_RULES.md) - Coding standards and best practices
- [`task_instructions/rules/CODING_REPO_CONVENTIONS.md`](ai_tools/agents/task_instructions/rules/CODING_REPO_CONVENTIONS.md) - Repository conventions

**Quick Reference**:
- [`task_instructions/QUICK_REFERENCE.md`](ai_tools/agents/task_instructions/QUICK_REFERENCE.md) - Quick reference guide
- [`task_instructions/README.md`](ai_tools/agents/task_instructions/README.md) - Task instructions overview

### **Guides**
- [`agents/guides/README.md`](ai_tools/agents/guides/README.md) - Guides overview
- [`agents/guides/creative_production_guide/`](ai_tools/agents/guides/creative_production_guide/) - Creative production workflow (26 files)

### **General AI Tools**
- [`ai_tools/LEARNING_NEW_TOPIC_V2.md`](ai_tools/LEARNING_NEW_TOPIC_V2.md) - Learning framework (v2)
- [`ai_tools/LEARNING_NEW_TOPIC.md`](ai_tools/LEARNING_NEW_TOPIC.md) - Learning framework (v1)
- [`ai_tools/LLM_REFLECTION_DEBUGGING_RULES.md`](ai_tools/LLM_REFLECTION_DEBUGGING_RULES.md) - LLM debugging guide
- [`ai_tools/PROMPT_IMPROVEMENT.md`](ai_tools/PROMPT_IMPROVEMENT.md) - Prompt improvement techniques
- [`ai_tools/NOTEBOOK_LM_PODCAST_PROMPT.md`](ai_tools/NOTEBOOK_LM_PODCAST_PROMPT.md) - NotebookLM podcast generation

---

## 🗂️ **File Organization Patterns**

### **How to Navigate This Repository**

1. **Starting a new task?**
   - Check [`ROUTER.md`](ROUTER.md) (this file) for file locations
   - Read [`projects/evals-harness-platform/spec.md`](projects/evals-harness-platform/spec.md) for technical details
   - Check [`projects/evals-harness-platform/todo.md`](projects/evals-harness-platform/todo.md) for current status

2. **Working on backend?**
   - See [`backend/README.md`](backend/README.md) for setup
   - API routes in `backend/app/api/`
   - Business logic in `backend/app/services/`
   - Tests in `backend/tests/unit/`

3. **Working on frontend?**
   - See [`frontend/README.md`](frontend/README.md) for setup
   - Components in `frontend/src/components/`
   - Pages in `frontend/src/app/`
   - Tests in `frontend/__tests__/`

4. **Need an AI agent persona?**
   - Check router files first: [`engineering/router.md`](ai_tools/agents/personas/engineering/router.md), [`ai_engineering/router.md`](ai_tools/agents/personas/ai_engineering/router.md), [`research/router.md`](ai_tools/agents/personas/research/router.md)
   - Browse domain-specific or task-specific folders

5. **Looking for task instructions?**
   - Check [`task_instructions/QUICK_REFERENCE.md`](ai_tools/agents/task_instructions/QUICK_REFERENCE.md)
   - Browse by category: execution, engineering, project_management, etc.

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

**"Where is the evaluation logic?"**
→ `backend/app/services/evaluation_engine.py`

**"Where are API endpoints defined?"**
→ `backend/app/api/*.py` (tasks, models, evaluations, results)

**"Where is the database schema?"**
→ `backend/app/models/*.py` or `projects/evals-harness-platform/spec.md` (data model section)

**"Where is the OpenRouter integration?"**
→ `backend/app/services/openrouter_client.py`

**"Where is model pricing configured?"**
→ `backend/app/utils/pricing.py`

**"Where are the UI components?"**
→ `frontend/src/components/` (organized by type: ui, tabs, forms, tables, layout)

**"Where is the frontend data loading?"**
→ `frontend/src/lib/data.ts`

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

---

## 🔄 **Maintenance**

This router file should be updated when:
- New major features are added
- New documentation is created
- Directory structure changes significantly
- New important files are added to the root

**Update frequency**: Every major milestone or sprint
