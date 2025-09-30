# Execution Plan: Implement Full Evaluate Tab with Real LLM Runs

**Ticket**: MET-58 (continuation) - Evaluate Tab Real LLM Execution
**Created**: September 30, 2025
**Status**: AWAITING APPROVAL

---

## 1. Executive Summary

Implement full evaluation execution functionality in the Evaluate tab, enabling users to:
- Run real LLM evaluations with selected tasks and models
- See live progress during evaluation runs
- View results immediately after completion in the Evaluate tab
- Browse all evaluation runs in Review Performance tab, sorted by recency
- Filter runs by tags, models, projects, pass/fail status, and time ranges

This completes the core evaluation workflow, transforming the platform from a UI prototype to a fully functional LLM evaluation system.

**Estimated Effort**: 2-3 hours
**Complexity**: Medium (backend mostly exists, frontend integration needed)

---

## 2. Context Analysis

### What the Ticket Asks For
1. **Evaluate Tab Enhancement**:
   - Run real evaluations (calling OpenRouter API)
   - Display results immediately after pressing "Run"
   - Show detailed results (model output, pass/fail, scores, costs)

2. **Review Performance Tab Enhancement**:
   - Display all evaluation runs (sorted by most recent)
   - Filter runs by tags, models, projects, time ranges
   - Drill into individual runs to see detailed results
   - Show aggregated statistics per run

### Current State
**Backend** ✅ (Already Complete):
- `POST /api/evaluate` - Runs evaluations synchronously, saves to DB
- `GET /api/evaluate/{run_id}` - Gets run status
- `GET /api/results` - Lists results with filters (run_id, task_id, model_id, passed, limit)
- `GET /api/results/{run_id}` - Gets all results for a specific run
- **MISSING**: `GET /api/runs` - List all evaluation runs

**Frontend** 🔨 (Partially Complete):
- ✅ `useRunEvaluation` hook - triggers evaluation
- ✅ `useRunStatus` hook - polls run status
- ✅ `useResults` hook - fetches filtered results
- ✅ EvaluateTab shows task/model selection and progress bar
- ❌ EvaluateTab doesn't show results after completion
- ❌ No hook to list all runs
- ❌ ReviewPerformanceTab doesn't show individual runs
- ❌ No run filtering/drilling UI

### Key Assumptions
1. **Synchronous Execution is OK**: Backend runs evals synchronously (blocking request). This is fine for MVP with <10 evals per run. Future optimization (async + polling) can be added later if needed.
2. **Results Fit in Memory**: Displaying all results for a run in UI is feasible (<100 results per run expected).
3. **Cost is Acceptable**: User has OpenRouter API key configured and accepts LLM API costs.
4. **No Real-time Updates Needed**: Showing results after completion is sufficient (no WebSocket streaming).

### Dependencies
- Backend API working (✅ verified)
- OpenRouter API key configured (✅ in `.env`)
- Database seeded with tasks and models (✅ just completed)
- React Query configured (✅ already set up)

---

## 3. Implementation Strategy

### High-Level Approach
**Two-Phase Enhancement**:

**Phase A: Evaluate Tab - Show Results After Run**
- After evaluation completes, fetch results for that run_id
- Display results table showing: task name, model name, output (truncated), pass/fail, score, cost, latency
- Add "View Full Output" modal for detailed inspection
- Show run summary stats (X/Y passed, total cost, avg latency)

**Phase B: Review Performance Tab - All Runs with Filtering**
- Add backend endpoint: `GET /api/runs` to list all runs
- Create `useRuns()` hook to fetch all runs
- Display runs table sorted by recency (most recent first)
- Add filters: date range, project (from task tags), pass rate threshold
- Allow drilling into individual runs (clicking run shows its results)
- Reuse results display component from Evaluate tab

### Why This Approach?
1. **Incremental**: Phase A delivers immediate value (see results), Phase B adds discoverability
2. **Component Reuse**: Results table component shared between both tabs (DRY)
3. **Backend Minimal**: Only need to add 1 endpoint (`GET /api/runs`)
4. **User-Centric**: Addresses both immediate feedback (Phase A) and historical analysis (Phase B)

### Alternatives Considered
❌ **Async Evaluation with Polling**: More complex, not needed for MVP (runs complete in <30s)
❌ **WebSocket Real-time Updates**: Overkill for current scale, adds complexity
❌ **Separate Results Page**: Less intuitive than showing results in context
✅ **Chosen Approach**: Synchronous execution + immediate results display (simplest, works)

---

## 4. Detailed Execution Plan

### Phase A: Evaluate Tab Results Display

#### **Step A1: Backend - Add `/api/runs` Endpoint**
**File**: `backend/app/api/evaluations.py`

**What to Add**:
```python
@router.get("/runs", response_model=list[RunStatusResponse])
def list_runs(
    limit: int = Query(100, le=1000),
    db: Session = Depends(get_db),
) -> list[RunStatusResponse]:
    """List all evaluation runs, ordered by most recent first."""
    runs = db.query(EvalRun).order_by(EvalRun.started_at.desc()).limit(limit).all()
    return [RunStatusResponse.from_orm(run) for run in runs]
```

**Why**: Enables frontend to fetch all runs for Review Performance tab.

**Testing**:
- Unit test: `test_list_runs_empty()`, `test_list_runs_ordering()`
- Manual: `curl http://localhost:8000/api/runs`

---

#### **Step A2: Frontend - Add `useRuns()` Hook**
**File**: `frontend/src/hooks/useEvaluation.ts`

**What to Add**:
```typescript
/**
 * Fetch all evaluation runs
 */
export function useRuns() {
  return useQuery<EvalRun[], Error>({
    queryKey: ["runs"],
    queryFn: () => evaluationService.getRuns(),
  });
}
```

**Why**: Provides React Query integration for listing all runs.

---

#### **Step A3: Frontend - Update evaluation-service.ts**
**File**: `frontend/src/lib/services/evaluation-service.ts`

**What to Update**:
```typescript
// Already has getRuns() method - verify it works correctly
async getRuns(): Promise<EvalRun[]> {
  return apiClient.get<EvalRun[]>("/api/runs");
}
```

**Why**: Already implemented, just need to verify endpoint matches backend.

---

#### **Step A4: Frontend - Create Results Display Component**
**File**: `frontend/src/components/tables/ResultsTable.tsx` (NEW)

**What to Create**:
- Reusable component that displays evaluation results
- Columns: Task Name, Model Name, Output (truncated to 100 chars), Pass/Fail badge, Score, Cost, Latency
- Click row to expand full output in modal/dialog
- Show total stats at bottom (X passed, Y failed, total cost, avg latency)

**Props**:
```typescript
interface ResultsTableProps {
  results: EvalResult[];
  tasks: EvalTask[];
  models: Model[];
  showFilters?: boolean;
}
```

**Why**: Reusable across Evaluate and Review Performance tabs (DRY principle).

---

#### **Step A5: Frontend - Enhance EvaluateTab with Results**
**File**: `frontend/src/components/tabs/EvaluateTab.tsx`

**What to Add**:
1. After `runStatus.status === "completed"`, fetch results for that run_id
2. Use `useResults({ run_id: runData?.id })` to automatically fetch when run completes
3. Display ResultsTable component below the "Run Evaluation" card
4. Add "Clear Results" button to dismiss results and start new run
5. Show run summary: "Run completed: 8/10 passed, $0.0245 total cost, 3.2s avg latency"

**Logic Flow**:
```
User clicks "Run"
  → runEvaluation mutation fires
  → Backend runs evals (synchronous)
  → Returns run_id + status
  → Frontend fetches results with useResults({ run_id })
  → ResultsTable displays results
  → User can click individual results to see full output
```

**Why**: Immediate feedback loop - user sees results right after running eval.

---

### Phase B: Review Performance Tab - All Runs

#### **Step B1: Frontend - Create RunsListView Component**
**File**: `frontend/src/components/tabs/ReviewPerformanceTab.tsx`

**What to Add**:
1. Use `useRuns()` hook to fetch all runs
2. Display runs table with columns:
   - Run Name/ID
   - Date/Time
   - Tasks (count)
   - Models (count)
   - Pass Rate (X/Y passed, %)
   - Total Cost
   - Status badge (completed/failed/running)
3. Click run → drills into results for that run (shows ResultsTable filtered by run_id)
4. Add filters:
   - Date range picker (last 24h, 7d, 30d, all time)
   - Project dropdown (extracted from task tags)
   - Pass rate threshold slider (show only runs with >80% pass rate)
   - Model filter (show only runs that used specific model)

**State Management**:
```typescript
const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
const { data: runs = [] } = useRuns();
const { data: runResults = [] } = useResults({ run_id: selectedRunId });
```

**Why**: Enables historical analysis and comparison across runs.

---

#### **Step B2: Frontend - Add Run Detail View**
**File**: `frontend/src/components/tabs/ReviewPerformanceTab.tsx`

**What to Add**:
- When user clicks a run, show detailed results for that run
- Reuse ResultsTable component (with `showFilters={false}`)
- Show "Back to All Runs" button
- Display run metadata: name, description, start time, duration, task/model counts

**Why**: Allows deep-dive into specific runs without leaving the tab.

---

#### **Step B3: Frontend - Add Run Comparison (Optional)**
**File**: `frontend/src/components/tabs/ReviewPerformanceTab.tsx`

**What to Add** (if time permits):
- "Compare Runs" mode: select 2 runs, show side-by-side comparison
- Highlight differences in pass rates, costs, scores
- Useful for A/B testing different prompts or models

**Why**: Enables data-driven decision-making when comparing approaches.

**Priority**: Low (nice-to-have, can defer to later ticket)

---

## 5. Code Implementation Strategy

### Files to Create
1. `frontend/src/components/tables/ResultsTable.tsx` - Reusable results display
2. `frontend/src/components/ui/ResultDetailModal.tsx` - Modal for full output view

### Files to Modify
1. `backend/app/api/evaluations.py` - Add `GET /api/runs` endpoint
2. `backend/tests/unit/test_api_endpoints.py` - Add tests for list runs
3. `frontend/src/hooks/useEvaluation.ts` - Add `useRuns()` hook
4. `frontend/src/components/tabs/EvaluateTab.tsx` - Add results display
5. `frontend/src/components/tabs/ReviewPerformanceTab.tsx` - Complete overhaul with runs list

### Code Structure Patterns

**Backend** (following existing patterns):
- Router pattern: All endpoints in `evaluations.py` router
- Schema validation: Use existing `RunStatusResponse`
- Logging: Follow existing logging patterns
- Error handling: Use existing exception classes

**Frontend** (following existing patterns):
- React Query: Consistent with `useTasks`, `useModels`
- Component structure: Cards + Tables (established pattern)
- Loading states: Spinner + skeleton loaders
- Error handling: Error boundaries + inline error messages

### Design Decisions

**Decision 1: Synchronous vs Async Execution**
- **Choice**: Keep synchronous execution for MVP
- **Reasoning**: Runs complete in <30s with current scale (1-10 tasks × 1-5 models)
- **Trade-off**: Blocking request, but simpler implementation
- **Future**: Can add async + background jobs when scale increases

**Decision 2: Results Display Location**
- **Choice**: Show results in both Evaluate (current run) and Review Performance (all runs)
- **Reasoning**: Immediate feedback in Evaluate, historical analysis in Review
- **Trade-off**: Some code duplication, but better UX
- **Mitigation**: Extract ResultsTable as shared component

**Decision 3: Run Status Polling**
- **Choice**: No polling needed (synchronous execution)
- **Reasoning**: Backend returns complete results immediately
- **Trade-off**: User waits for response, but simpler code
- **Future**: Add polling if we switch to async execution

**Decision 4: Results Pagination**
- **Choice**: No pagination initially, use limit=100
- **Reasoning**: Most runs will have <50 results (5 tasks × 5 models)
- **Trade-off**: Could be slow with huge runs, but unlikely at current scale
- **Future**: Add pagination when runs exceed 100 results regularly

---

## 6. Detailed Implementation Steps

### Phase A: Results Display in Evaluate Tab (60 min)

**A1: Backend - Add List Runs Endpoint** (10 min)
```bash
File: backend/app/api/evaluations.py
Action: Add GET /api/runs endpoint after get_run_status function
Testing: curl http://localhost:8000/api/runs
Expected: JSON array of all runs, newest first
```

**A2: Backend - Test List Runs** (10 min)
```bash
File: backend/tests/unit/test_api_endpoints.py
Action: Add test_list_runs() function
Testing: pytest tests/unit/test_api_endpoints.py::test_list_runs -v
Expected: Test passes, verifies ordering and response structure
```

**A3: Frontend - Add useRuns Hook** (5 min)
```bash
File: frontend/src/hooks/useEvaluation.ts
Action: Add useRuns() function (3 lines)
Testing: Import in component, verify no TypeScript errors
```

**A4: Frontend - Create ResultsTable Component** (20 min)
```bash
File: frontend/src/components/tables/ResultsTable.tsx (NEW)
Action: Create reusable table component with:
  - Columns: Task, Model, Output (truncated), Pass/Fail, Score, Cost, Latency
  - Row expansion for full output
  - Summary stats row at bottom
Testing: Import in Evaluate tab, verify renders correctly
```

**A5: Frontend - Enhance EvaluateTab** (15 min)
```bash
File: frontend/src/components/tabs/EvaluateTab.tsx
Action:
  1. Add useResults hook filtered by run_id from last run
  2. Conditionally render ResultsTable when results exist
  3. Add "Start New Run" button to clear results
  4. Show run summary stats
Testing: Run evaluation, verify results display immediately
```

---

### Phase B: Review Performance with Run History (60 min)

**B1: Frontend - Create RunsList Component** (25 min)
```bash
File: frontend/src/components/tabs/ReviewPerformanceTab.tsx
Action: Complete overhaul:
  1. Add useRuns() hook
  2. Display runs table with columns:
     - Run Name/ID, Date, Tasks, Models, Pass Rate, Cost, Status
  3. Add onClick handler to select run
  4. When run selected, show ResultsTable for that run
  5. Add "Back to All Runs" button
Testing: Click through runs, verify results load correctly
```

**B2: Frontend - Add Run Filters** (20 min)
```bash
File: frontend/src/components/tabs/ReviewPerformanceTab.tsx
Action: Add filter UI:
  1. Date range selector (24h, 7d, 30d, all)
  2. Project dropdown (extract from task tags via results)
  3. Pass rate threshold slider
  4. Model filter dropdown
Testing: Apply filters, verify runs list updates correctly
```

**B3: Frontend - Add Run Summary Stats** (15 min)
```bash
File: frontend/src/components/tabs/ReviewPerformanceTab.tsx
Action: Add stats cards above runs table:
  - Total runs
  - Total evaluations
  - Average pass rate
  - Total cost (all time)
Testing: Verify stats calculate correctly
```

---

### Phase C: Polish & Testing (30 min)

**C1: Add Result Detail Modal** (15 min)
```bash
File: frontend/src/components/ui/ResultDetailModal.tsx (NEW)
Action: Create modal showing:
  - Full task input
  - Full model output (syntax highlighted if code)
  - Evaluation details (score, metrics, error category)
  - Cost and latency
  - Pass/fail reasoning
Testing: Click result row, verify modal opens with all details
```

**C2: Error Handling** (10 min)
```bash
Files: EvaluateTab.tsx, ReviewPerformanceTab.tsx
Action:
  - Add error states for failed runs
  - Show error category and message from backend
  - Add retry button for failed evals
Testing: Simulate API error, verify error UI displays
```

**C3: End-to-End Testing** (5 min)
```bash
Action:
  1. Run evaluation with 2 tasks × 2 models = 4 evals
  2. Verify results appear in Evaluate tab
  3. Navigate to Review Performance tab
  4. Verify run appears in runs list
  5. Click run, verify results match
  6. Apply filters, verify filtering works
Testing: Complete user flow without errors
```

---

## 7. Risk Assessment

### Technical Risks

**Risk 1: Synchronous Execution Timeout**
- **Issue**: Large eval runs (50 tasks × 10 models) could timeout HTTP request (>60s)
- **Likelihood**: Medium (depends on user behavior)
- **Mitigation**: Add request timeout warning, recommend smaller batches
- **Future Fix**: Implement async execution with job queue

**Risk 2: OpenRouter API Failures**
- **Issue**: API key invalid, rate limits, or provider outages
- **Likelihood**: Low (circuit breaker already implemented)
- **Mitigation**: Backend has retry logic + circuit breaker, frontend shows clear errors
- **Future Fix**: Add fallback providers or mock mode for testing

**Risk 3: Cost Overruns**
- **Issue**: User accidentally runs expensive eval (100 tasks × GPT-4)
- **Likelihood**: Medium (human error)
- **Mitigation**: Show cost estimate before running, add confirmation dialog for >$1 evals
- **Future Fix**: Add budget limits per run/day

**Risk 4: Result Display Performance**
- **Issue**: Displaying 100+ results could slow down UI
- **Likelihood**: Low (most runs <50 results)
- **Mitigation**: Use limit=100, truncate outputs, virtualized table if needed
- **Future Fix**: Add pagination or virtual scrolling

### Implementation Risks

**Risk 5: Component Reuse Complexity**
- **Issue**: ResultsTable component needs to work in different contexts (Evaluate vs Review)
- **Likelihood**: Low (good abstraction prevents this)
- **Mitigation**: Clear props interface, well-tested component
- **Future Fix**: Split into separate components if needed

**Risk 6: Filter Logic Bugs**
- **Issue**: Complex filtering logic could have edge cases
- **Likelihood**: Medium (filters are complex)
- **Mitigation**: Write comprehensive tests for filter combinations
- **Future Fix**: Add filter presets for common use cases

---

## 8. Success Criteria

### Phase A Success Criteria
- [ ] User can run evaluation with real LLMs via OpenRouter
- [ ] Progress bar shows during execution
- [ ] Results appear immediately after completion in Evaluate tab
- [ ] Results table shows all required columns
- [ ] User can view full model output for each result
- [ ] Run summary stats display correctly (pass rate, cost, latency)
- [ ] Error handling shows clear messages for API failures

### Phase B Success Criteria
- [ ] Review Performance tab shows all runs, sorted by most recent
- [ ] User can click a run to view its detailed results
- [ ] Filters work correctly (date, project, pass rate, model)
- [ ] Summary stats reflect current filters
- [ ] Drill-down into run shows same results as in Evaluate tab
- [ ] Back button returns to runs list

### Overall Acceptance Criteria
- [ ] End-to-end workflow: Create task → Add model → Run eval → View results → Browse history
- [ ] All API calls succeed with proper error handling
- [ ] No console errors or warnings
- [ ] TypeScript compilation passes
- [ ] Loading states smooth and informative
- [ ] Performance acceptable (<2s for API calls, <100ms for UI updates)

---

## 9. Testing Strategy

### Backend Testing
```bash
# Unit tests for new endpoint
pytest tests/unit/test_api_endpoints.py::test_list_runs -v
pytest tests/unit/test_api_endpoints.py::test_list_runs_ordering -v
pytest tests/unit/test_api_endpoints.py::test_list_runs_empty -v

# Integration test for full eval flow
pytest tests/integration/ -v (if exists)

# Manual API testing
curl -X POST http://localhost:8000/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{"task_ids": [1, 2], "model_ids": [1], "name": "Test Run"}'
# Should return run_id and status

curl http://localhost:8000/api/runs
# Should return array of runs

curl http://localhost:8000/api/results?run_id={run_id}
# Should return results for that run
```

### Frontend Testing
```bash
# Type checking
cd frontend && npm run build

# Component rendering (manual)
1. Navigate to Evaluate tab
2. Select 1 task + 1 model
3. Click "Run Evaluation"
4. Verify:
   - Progress bar appears
   - Results table appears after completion
   - All columns populated correctly
   - Click result row → modal opens with full output

# Review Performance tab (manual)
1. Navigate to Review Performance tab
2. Verify runs list displays
3. Click a run → verify results show
4. Apply filters → verify list updates
5. Check summary stats → verify calculations correct
```

### Manual E2E Test Script
```
1. Create new task via Add Task tab
2. Verify task appears in View Tasks
3. Navigate to Evaluate tab
4. Select newly created task + GPT-4o-mini model
5. Click "Run Evaluation"
6. Wait for progress bar (should complete in 5-10s)
7. Verify results table appears with:
   - Task name matches
   - Model output is actual LLM response (not "dummy data")
   - Pass/fail status determined by eval engine
   - Cost and latency are real numbers
8. Click result row → verify full output modal
9. Navigate to Review Performance tab
10. Verify new run appears at top of list
11. Click new run → verify same results display
12. Apply date filter "Last 24h" → verify run still shows
13. Apply model filter "GPT-4o-mini" → verify run shows
14. Navigate back to Evaluate tab
15. Results should still be visible (state persisted)
```

---

## 10. Implementation Timeline

### Phase A: Evaluate Tab Results (60-90 min)
- Backend endpoint: 10 min
- Backend tests: 10 min
- Frontend hook: 5 min
- ResultsTable component: 20 min
- EvaluateTab enhancement: 15 min
- Testing & debugging: 15 min

### Phase B: Review Performance Runs (60-90 min)
- RunsList component: 25 min
- Run filters: 20 min
- Run detail view: 15 min
- Testing & debugging: 15 min

### Phase C: Polish (30 min)
- Result detail modal: 15 min
- Error handling: 10 min
- E2E testing: 5 min

**Total**: 2.5-3.5 hours

---

## 11. Post-Implementation Checklist

- [ ] All new endpoints documented in backend README
- [ ] Frontend components documented with JSDoc
- [ ] Update `ticket-004-api-integration.md` with completion status
- [ ] Update `E2E_TEST_RESULTS.md` with new E2E test for evaluate workflow
- [ ] Commit with descriptive message
- [ ] Create PR with detailed description
- [ ] Update Linear ticket MET-58 with progress
- [ ] Deploy to Railway (backend) and Vercel (frontend)

---

## 12. Expert Review Questions

### For @llm_evaluation_platform_architect.md:
1. Is synchronous execution acceptable for MVP, or should we implement async from the start?
2. Is the ResultsTable component abstraction appropriate for reuse across tabs?
3. Any concerns about the `/api/runs` endpoint design or response structure?
4. Should we add caching for runs list, or is React Query's default sufficient?
5. Any scalability concerns with current approach (100 results per run, 100 runs in list)?

### For @ai_evals_methodology_expert.md:
1. Does the results display show the right metrics for meaningful evaluation analysis?
2. Should we add error category filtering in Review Performance tab?
3. Is immediate results display sufficient, or do we need export/download functionality?
4. Should we add comparison features (e.g., compare 2 runs side-by-side) in MVP?
5. Any methodological concerns with how we're presenting evaluation results?

---

## 13. Approval Request

🚨 **APPROVAL REQUIRED BEFORE IMPLEMENTATION**

I've analyzed the requirements and created a detailed execution plan above.

**Key Points:**
- **Phase A**: Add results display to Evaluate tab (see results after running)
- **Phase B**: Complete Review Performance tab with all runs + filtering
- **Minimal backend changes**: Only adding `GET /api/runs` endpoint
- **Component reuse**: Shared ResultsTable for DRY code
- **Synchronous execution**: Simpler implementation, acceptable for MVP scale

**Implementation Sequence:**
1. Backend: Add list runs endpoint + tests (20 min)
2. Frontend: Create ResultsTable component (20 min)
3. Frontend: Enhance Evaluate tab with results (15 min)
4. Frontend: Complete Review Performance tab (60 min)
5. Polish: Modal, error handling, E2E testing (30 min)

**Estimated Timeline**: 2.5-3.5 hours total

**Next Steps:**
1. Expert review from @llm_evaluation_platform_architect.md and @ai_evals_methodology_expert.md
2. Address any concerns or questions
3. Revise plan based on feedback
4. Get your explicit approval
5. Begin implementation

**I will NOT start implementation until you explicitly approve this plan.**

Do you approve this execution plan? If not, what changes would you like me to make?
