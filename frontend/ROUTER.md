# Frontend Navigation Guide

**Purpose**: Navigation guide for the Next.js frontend of the Evals Harness Platform.

**Last Updated**: September 30, 2025

---

## 📖 **Getting Started**

### **Documentation**
- [`README.md`](README.md) - Frontend setup and development guide
- [`package.json`](package.json) - Node.js dependencies and scripts
- [`tsconfig.json`](tsconfig.json) - TypeScript configuration
- [`next.config.ts`](next.config.ts) - Next.js configuration
- [`components.json`](components.json) - shadcn/ui configuration

### **Quick Commands**
```bash
# Setup
npm install

# Development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Linting
npm run lint
```

---

## 📁 **Application Code** (`src/`)

### **Pages** (`src/app/`)
Next.js 14 App Router pages:

- [`src/app/page.tsx`](src/app/page.tsx) - Main dashboard page (tab navigation)
- [`src/app/layout.tsx`](src/app/layout.tsx) - Root layout component (metadata, font, structure)
- [`src/app/globals.css`](src/app/globals.css) - Global styles and Tailwind directives
- [`src/app/favicon.ico`](src/app/favicon.ico) - Site favicon

### **Components** (`src/components/`)

#### **Tab Components** (`src/components/tabs/`)
Main feature tabs:

- [`tabs/DashboardTab.tsx`](src/components/tabs/DashboardTab.tsx) - Dashboard overview with stats and recent results
- [`tabs/TasksTab.tsx`](src/components/tabs/TasksTab.tsx) - Task management (list, create, edit)
- [`tabs/ModelsTab.tsx`](src/components/tabs/ModelsTab.tsx) - Model configuration management
- [`tabs/EvaluateTab.tsx`](src/components/tabs/EvaluateTab.tsx) - Evaluation execution interface

#### **Form Components** (`src/components/forms/`)
Form implementations:

- [`forms/TaskForm.tsx`](src/components/forms/TaskForm.tsx) - Task creation/editing form
  - React Hook Form with Zod validation
  - All task fields (name, input, expected_output, task_type, etc.)
- [`forms/ModelForm.tsx`](src/components/forms/ModelForm.tsx) - Model configuration form
  - Provider, model name, prompt version
  - JSON configuration editing

#### **Layout Components** (`src/components/layout/`)
- [`layout/DashboardLayout.tsx`](src/components/layout/DashboardLayout.tsx) - Main dashboard layout wrapper
  - Header with title
  - Tab navigation
  - Content area

#### **Table Components** (`src/components/tables/`)
- [`tables/ResultsTable.tsx`](src/components/tables/ResultsTable.tsx) - Results display table
  - Filtering by run, task, model, pass/fail
  - Sortable columns
  - Result details

#### **UI Components** (`src/components/ui/`)
shadcn/ui component library (12 components):

- `button.tsx` - Button component with variants
- `card.tsx` - Card container component
- `input.tsx` - Form input component
- `label.tsx` - Form label component
- `progress.tsx` - Progress bar component
- `select.tsx` - Dropdown select component
- `table.tsx` - Table components (Table, TableHeader, TableRow, TableCell, etc.)
- `tabs.tsx` - Tab navigation components
- `badge.tsx` - Badge/tag component
- `alert.tsx` - Alert/notification component
- `dialog.tsx` - Modal dialog component
- `separator.tsx` - Visual separator component

### **Libraries** (`src/lib/`)
Shared utilities and data access:

- [`lib/data.ts`](src/lib/data.ts) - Data loading utilities
  - Currently loads dummy JSON files from `/public/data/`
  - To be replaced with API calls in ticket 4 (MET-58)
- [`lib/utils.ts`](src/lib/utils.ts) - Utility functions
  - `cn()` - Tailwind class name merger (uses clsx + tailwind-merge)

### **Types** (`src/types/`)
- [`types/index.ts`](src/types/index.ts) - TypeScript type definitions
  - `Task`, `Model`, `EvalRun`, `EvalResult`, `DashboardStats`
  - Matches backend schemas

---

## 🧪 **Testing** (`__tests__/`)

### **Component Tests** (`__tests__/components/`)
- [`__tests__/components/DashboardLayout.test.tsx`](__tests__/components/DashboardLayout.test.tsx) - Layout component tests
- [`__tests__/components/TaskForm.test.tsx`](__tests__/components/TaskForm.test.tsx) - Form validation tests

### **Library Tests** (`__tests__/lib/`)
- [`__tests__/lib/data.test.ts`](__tests__/lib/data.test.ts) - Data loading tests

### **Test Configuration**
- [`jest.config.js`](jest.config.js) - Jest configuration
- [`jest.setup.js`](jest.setup.js) - Jest setup file (testing-library matchers)

---

## 🎨 **Static Assets** (`public/`)

### **Dummy Data** (`public/data/`)
JSON files for development (to be replaced with API calls):

- `dashboard.json` - Dashboard statistics
- `tasks.json` - Evaluation tasks list
- `models.json` - Model configurations
- `runs.json` - Evaluation runs
- `results.json` - Evaluation results

### **Icons and Assets**
- `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`

---

## ⚙️ **Configuration Files**

### **Build & Development**
- [`next.config.ts`](next.config.ts) - Next.js configuration (currently minimal)
- [`postcss.config.mjs`](postcss.config.mjs) - PostCSS configuration for Tailwind CSS
- [`tsconfig.json`](tsconfig.json) - TypeScript compiler configuration

### **Code Quality**
- [`eslint.config.mjs`](eslint.config.mjs) - ESLint configuration
- No pre-commit hooks yet (to be added in ticket 4)

### **Component Library**
- [`components.json`](components.json) - shadcn/ui configuration
  - Component style: default
  - Tailwind CSS settings
  - Path aliases

---

## 🏗️ **Architecture Overview**

### **Component Hierarchy**
```
app/page.tsx (Root Page)
  └─ DashboardLayout
      └─ Tabs Component
          ├─ DashboardTab (stats + recent results)
          ├─ TasksTab (task list + TaskForm)
          ├─ ModelsTab (model list + ModelForm)
          ├─ EvaluateTab (run evaluations)
          └─ ResultsTab (ResultsTable with filters)
```

### **Data Flow** (Current - Dummy Data)
```
Component
  ↓
lib/data.ts
  ↓
fetch('/data/*.json')
  ↓
public/data/*.json
```

### **Data Flow** (Future - API Integration)
```
Component
  ↓
React Query
  ↓
API Client (lib/api.ts)
  ↓
Backend API
```

---

## 📊 **Technology Stack**

### **Core**
- **Next.js 15.5.4** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first CSS framework

### **UI Library**
- **shadcn/ui** - Component library built on Radix UI
- **Radix UI** - Headless UI primitives
- **Lucide React** - Icon library
- **Class Variance Authority** - Component variant styling

### **State Management**
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **TanStack Query (React Query)** - Server state (added, not yet used)

### **Testing**
- **Jest** - Test runner
- **React Testing Library** - Component testing
- **Playwright** - E2E testing (configured, not yet used)
- **@testing-library/jest-dom** - DOM matchers

### **Development Tools**
- **ESLint** - Linting
- **TypeScript** - Type checking
- **Turbopack** - Fast bundler (--turbopack flag in build)

---

## 🔍 **Common Search Patterns**

**"Where is the main page?"**
→ `src/app/page.tsx`

**"Where are the tab components?"**
→ `src/components/tabs/*.tsx`

**"Where is the data fetching logic?"**
→ `src/lib/data.ts` (currently dummy data)

**"Where are the form components?"**
→ `src/components/forms/*.tsx`

**"Where are the UI primitives?"**
→ `src/components/ui/*.tsx`

**"Where are the TypeScript types?"**
→ `src/types/index.ts`

**"Where is the styling?"**
→ `src/app/globals.css` (global) and inline with Tailwind classes

**"Where are the tests?"**
→ `__tests__/` (mirrors `src/` structure)

**"Where is the dummy data?"**
→ `public/data/*.json`

---

## 🎯 **Current Status** (as of September 30, 2025)

### **Completed (MET-55, MET-56)**
- ✅ Next.js 14 → 15 with Turbopack
- ✅ 5 main tabs implemented
- ✅ Dummy JSON data loading
- ✅ Form validation with React Hook Form + Zod
- ✅ Responsive design with Tailwind CSS v4
- ✅ Deployed to Vercel: https://frontend-6di9lbbgg-marktorres10s-projects.vercel.app
- ✅ Tests configured (Jest + React Testing Library)
- ✅ Bundle optimized (225 kB First Load JS)

### **Next Phase (MET-58)**
- 📋 Replace dummy data with API calls
- 📋 Install and configure React Query
- 📋 Create API client service layer
- 📋 Add loading states and error handling
- 📋 Implement evaluation execution flow

---

## 📝 **Development Notes**

### **Key Files to Modify for API Integration**
1. `src/lib/data.ts` - Replace fetch from JSON with API calls
2. `src/lib/api.ts` - Create new API client (to be created)
3. `src/app/page.tsx` - Wrap with QueryClientProvider
4. `src/components/tabs/*.tsx` - Replace data loading with useQuery hooks

### **Testing Strategy**
- Unit tests for components and utilities
- Integration tests for data loading
- E2E tests with Playwright (future)
- Aim for >90% coverage before production

---

## 🔗 **Related Documentation**

- **Project Spec**: [`../projects/evals-harness-platform/spec.md`](../projects/evals-harness-platform/spec.md)
- **Ticket 1**: [`../projects/evals-harness-platform/tickets/ticket-001-basic-ui.md`](../projects/evals-harness-platform/tickets/ticket-001-basic-ui.md)
- **Ticket 2**: [`../projects/evals-harness-platform/tickets/ticket-002-vercel-deployment.md`](../projects/evals-harness-platform/tickets/ticket-002-vercel-deployment.md)
- **Ticket 4**: [`../projects/evals-harness-platform/tickets/ticket-004-api-integration.md`](../projects/evals-harness-platform/tickets/ticket-004-api-integration.md)
- **Root Router**: [`../ROUTER.md`](../ROUTER.md)
