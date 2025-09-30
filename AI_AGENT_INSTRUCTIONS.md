# AI Agent Instructions

**Purpose**: Core guidelines for AI agents working on this repository.

**Last Updated**: September 30, 2025

---

## 🎯 **Before Starting Any Task**

1. **Check project context**: Read relevant files in `projects/<project-name>/`
   - `README.md` - Project overview and objectives
   - `spec.md` - Technical specification
   - `todo.md` - Current Linear issues and progress
   - Relevant ticket in `tickets/` directory

2. **Review navigation**: Check `ROUTER.md` (root, backend, or frontend as needed)

3. **Propose execution plan**: Present detailed plan to user BEFORE executing

---

## ✅ **Testing Requirements**

Per [`ai_tools/agents/task_instructions/rules/CODING_RULES.md`](ai_tools/agents/task_instructions/rules/CODING_RULES.md):

- **Coverage**: >90% line, >80% branch (minimum 65% for MVP)
- **Test structure**: Save expected results to `expected_result` variable, assert against it
- **Isolation**: Each test must be independent and idempotent
- **CI-ready**: All tests must run headless (no GUI, no browser interaction)
- **Mock external deps**: Never hit real APIs or databases in unit tests

### **Testing Plan Must Include**:
- Specific test cases with inputs and expected outputs
- Test type (unit/integration/performance/security)
- Coverage targets per module
- Validation criteria

---

## 📝 **Before Merging a PR**

1. **Update project docs**:
   - Update ticket file in `projects/<project-name>/tickets/`
   - Update `projects/<project-name>/todo.md` with completion status
   - Update `projects/<project-name>/logs.md` with implementation notes

2. **Update navigation**:
   - Update `ROUTER.md` files if code structure changed
   - Update `backend/ROUTER.md` for backend changes
   - Update `frontend/ROUTER.md` for frontend changes

3. **Quality gates**:
   - All tests passing
   - Pre-commit hooks passing
   - Linting and type checking clean
   - Coverage targets met

---

## 🔄 **After Merging a PR**

1. **Update Linear**: Mark ticket as complete in Linear with completion summary
2. **Update todo.md**: Mark subtasks complete in `projects/<project-name>/todo.md`
3. **Deploy if needed**: Follow deployment steps in ticket

---

## 🚀 **Development Workflow**

1. Read ticket → Check context → Propose plan
2. Get approval → Implement → Test
3. Update docs → Create PR
4. Address review → Merge
5. Update Linear → Deploy

---

## 📋 **Quick Reference**

- **Project docs**: `projects/<project-name>/`
- **Navigation**: `ROUTER.md` (root, backend, frontend)
- **Backlog**: `BACKLOG.md`
- **Setup**: `SETUP.md`
- **Coding rules**: `ai_tools/agents/task_instructions/rules/CODING_RULES.md`
- **Code review**: `ai_tools/agents/task_instructions/collaborative_review/COMPREHENSIVE_CODE_REVIEW_CHECKLIST.md`
- **Critical analysis**: `ai_tools/agents/task_instructions/execution/CRITICAL_ANALYSIS_PROMPT.md`
