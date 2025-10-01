# FINAL Implementation Plan: Evaluate Tab with Real LLM Execution

**Date**: September 30, 2025
**Status**: 🟡 **AWAITING USER APPROVAL**
**Revised After Expert Review**

---

## Executive Summary

Implement complete evaluation execution workflow with **6 critical additions** from expert review:

### Core Features
1. ✅ Run real LLM evaluations via OpenRouter
2. ✅ Display results immediately in Evaluate tab
3. ✅ Browse all runs in Review Performance tab
4. ✅ Filter/sort runs by multiple criteria

### Critical Additions (from expert review)
1. 🆕 **Cost estimation BEFORE running** (prevent expensive accidents)
2. 🆕 **Run name input field** (usability)
3. 🆕 **Error category filtering** (methodology requirement)
4. 🆕 **Evaluation method display** (transparency: code vs LLM-judge)
5. 🆕 **Ground truth comparison** (understand why pass/fail)
6. 🆕 **Timeout verification** (handle large runs)

### Expert Scores
- **Platform Architect**: 8.5/10 - "Solid architecture, ship it"
- **Methodology Expert**: 7/10 - "Infrastructure excellent, but needs real data after this ticket"

**Timeline**: 2.5-3 hours | **Risk**: Low | **Value**: High

---

## Implementation Phases

### Phase A: Backend Enhancements (20 min)

#### A1: Add `GET /api/runs` Endpoint
**File**: `backend/app/api/evaluations.py`

```python
@router.get("/runs", response_model=list[RunStatusResponse])
def list_runs(
    limit: int = Query(100, le=1000, description="Maximum number of runs to return"),
    db: Session = Depends(get_db),
) -> list[RunStatusResponse]:
    """List all evaluation runs, ordered by most recent first.

    Args:
        limit: Maximum number of runs to return (default 100, max 1000)
        db: Database session

    Returns:
        List of evaluation runs
    """
    runs = db.query(EvalRun).order_by(EvalRun.started_at.desc()).limit(limit).all()
    logger.info(f"Listed {len(runs)} evaluation runs")
    return [RunStatusResponse.from_orm(run) for run in runs]
```

**Testing**:
```bash
curl http://localhost:8000/api/runs | python3 -m json.tool
# Should return array of runs, newest first
```

#### A2: Add Backend Tests
**File**: `backend/tests/unit/test_api_endpoints.py`

```python
def test_list_runs_empty(client):
    """Test listing runs when none exist."""
    response = client.get("/api/runs")
    assert response.status_code == 200
    assert response.json() == []

def test_list_runs_ordering(client):
    """Test runs ordered by most recent first."""
    # Create 3 runs at different times
    # Verify first run in response is most recent
```

**Testing**:
```bash
pytest tests/unit/test_api_endpoints.py::test_list_runs -v
```

#### A3: Verify Timeout Configuration
**File**: `backend/app/services/openrouter_client.py`

```python
# Verify existing timeout is sufficient
with httpx.Client(timeout=30.0) as client:
    # Current: 30s timeout
    # Sufficient for: ~20-30 individual LLM calls
    # Add comment documenting limit
```

**Document**: Add to ERROR_ANALYSIS.md - "Max recommended: 25 tasks × models per run to avoid timeout"

---

### Phase B: Core Results Display (60 min)

#### B1: Create ResultsTable Component
**File**: `frontend/src/components/tables/ResultsTable.tsx` (NEW)

```typescript
interface ResultsTableProps {
  results: EvalResult[];
  tasks: EvalTask[];
  models: Model[];
  showSummary?: boolean;  // Show stats footer
  onResultClick?: (result: EvalResult) => void;
}

export function ResultsTable({ results, tasks, models, showSummary = true, onResultClick }: ResultsTableProps) {
  // Columns: Task Name, Model, Output (100 chars), Method, Pass/Fail, Score, Cost, Latency
  // Click row → call onResultClick to open detail modal
  // Footer: X/Y passed (Z%), Total cost: $X.XX, Avg latency: Xms
}
```

**Features**:
- ✅ Truncate output to 100 chars with "..." (click to see full)
- ✅ Badge for pass/fail (green/red)
- ✅ Badge for evaluation method (code/llm_judge/hybrid)
- ✅ Color-coded score (0-0.5 red, 0.5-0.8 yellow, 0.8-1.0 green)
- ✅ Cost formatted to 4 decimals ($0.0012)
- ✅ Latency formatted (3,245ms → 3.2s)

#### B2: Create Result Detail Modal
**File**: `frontend/src/components/ui/ResultDetailModal.tsx` (NEW)

```typescript
interface ResultDetailModalProps {
  result: EvalResult | null;
  task: EvalTask | null;
  model: Model | null;
  open: boolean;
  onClose: () => void;
}

export function ResultDetailModal({ result, task, model, open, onClose }: ResultDetailModalProps) {
  // Show full details in dialog:
  // - Task: name, input, expected output, ground truth, rubric
  // - Model: name, provider, config
  // - Result: full output, pass/fail, score, metrics, error category
  // - Comparison: expected vs actual (side-by-side)
  // - Metadata: cost, latency, timestamp, evaluation method
}
```

**Features**:
- ✅ Syntax highlighting for code outputs (if detected)
- ✅ Side-by-side comparison (expected | actual)
- ✅ Show evaluation method and why it passed/failed
- ✅ Display error category if failed
- ✅ Copy button for model output

#### B3: Create Cost Estimation Utility
**File**: `frontend/src/lib/utils/cost-estimation.ts` (NEW)

```typescript
export function estimateEvalCost(
  taskIds: number[],
  modelIds: number[],
  tasks: EvalTask[],
  models: Model[]
): number {
  // Rough estimation:
  // For each task×model combination:
  //   - Estimate input tokens: ~task.input.length / 4
  //   - Estimate output tokens: ~500 (conservative)
  //   - Look up model pricing (hardcoded for common models)
  //   - Sum costs

  const totalEvals = taskIds.length * modelIds.length;
  const avgCostPerEval = 0.01; // Conservative estimate for GPT-4o-mini
  return totalEvals * avgCostPerEval;
}
```

**Accuracy**: Rough estimate (within 2x of actual). Actual cost shown in results.

---

### Phase C: Enhance Evaluate Tab (45 min)

#### C1: Add Run Configuration Section
**File**: `frontend/src/components/tabs/EvaluateTab.tsx`

**What to Add** (before "Run Evaluation" button):
```typescript
const [runName, setRunName] = useState("");
const estimatedCost = estimateEvalCost(selectedTasks, selectedModels, tasks, models);

// Add UI:
<div className="space-y-4">
  <Input
    placeholder="Run name (optional, e.g., 'GPT-4 baseline test')"
    value={runName}
    onChange={(e) => setRunName(e.target.value)}
  />

  {selectedTasks.length > 0 && selectedModels.length > 0 && (
    <div className="text-sm space-y-1">
      <p>Total evaluations: {selectedTasks.length × selectedModels.length}</p>
      <p>Estimated cost: ~${estimatedCost.toFixed(2)}</p>
      {estimatedCost > 0.50 && (
        <Alert variant="warning">
          ⚠️ This run will cost more than $0.50. Consider reducing tasks/models.
        </Alert>
      )}
    </div>
  )}
</div>
```

#### C2: Display Results After Completion
**File**: `frontend/src/components/tabs/EvaluateTab.tsx`

**What to Add** (after progress card):
```typescript
const [selectedResult, setSelectedResult] = useState<EvalResult | null>(null);
const { data: currentRunResults = [] } = useResults(
  runData?.id ? { run_id: runData.id } : undefined
);

// Add UI:
{runStatus?.status === "completed" && currentRunResults.length > 0 && (
  <Card>
    <CardHeader>
      <CardTitle>Results</CardTitle>
      <CardDescription>
        Run: {runData.name || runData.id} - Completed {new Date(runStatus.completed_at).toLocaleString()}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <ResultsTable
        results={currentRunResults}
        tasks={tasks}
        models={models}
        showSummary={true}
        onResultClick={(result) => setSelectedResult(result)}
      />

      <div className="mt-4 flex justify-between">
        <Button variant="outline" onClick={() => {
          setSelectedTasks([]);
          setSelectedModels([]);
          // Clear run data to start fresh
        }}>
          Start New Run
        </Button>
      </div>
    </CardContent>
  </Card>
)}

<ResultDetailModal
  result={selectedResult}
  task={tasks.find(t => t.id === selectedResult?.task_id) || null}
  model={models.find(m => m.id === selectedResult?.model_id) || null}
  open={!!selectedResult}
  onClose={() => setSelectedResult(null)}
/>
```

---

### Phase D: Review Performance Tab Overhaul (60 min)

#### D1: Add useRuns Hook
**File**: `frontend/src/hooks/useEvaluation.ts`

```typescript
export function useRuns(limit?: number) {
  return useQuery<EvalRun[], Error>({
    queryKey: ["runs", limit],
    queryFn: () => evaluationService.getRuns(limit),
    staleTime: 1000 * 60, // 1 minute (runs don't change often)
  });
}
```

#### D2: Restructure Review Performance Tab
**File**: `frontend/src/components/tabs/ReviewPerformanceTab.tsx`

**New Structure**:
```typescript
export function ReviewPerformanceTab() {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState('7d');
  const [errorCategoryFilter, setErrorCategoryFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState<number | null>(null);
  const [projectFilter, setProjectFilter] = useState('all');

  const { data: runs = [] } = useRuns();
  const { data: tasks = [] } = useTasks();
  const { data: models = [] } = useModels();
  const { data: allResults = [] } = useResults({ limit: 1000 });
  const { data: selectedRunResults = [] } = useResults(
    selectedRunId ? { run_id: selectedRunId } : undefined
  );

  // Filter runs based on filters
  const filteredRuns = runs.filter(run => {
    // Date filter logic
    // Error category filter logic (check run's results)
    // Model filter logic
    // Project filter logic (check run's task tags)
  });

  // View modes: "list" (all runs) or "detail" (single run results)
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");

  return (
    <div>
      {viewMode === "list" ? (
        <RunsListView
          runs={filteredRuns}
          onRunClick={(runId) => {
            setSelectedRunId(runId);
            setViewMode("detail");
          }}
        />
      ) : (
        <RunDetailView
          run={runs.find(r => r.id === selectedRunId)}
          results={selectedRunResults}
          tasks={tasks}
          models={models}
          onBack={() => setViewMode("list")}
        />
      )}
    </div>
  );
}
```

**Why Two-View Pattern**:
- List view: Overview of all runs (scannable)
- Detail view: Deep-dive into one run (detailed)
- Better than showing everything at once (overwhelming)

#### D3: Add Runs List View
```typescript
function RunsListView({ runs, onRunClick }) {
  return (
    <>
      {/* Filters Card */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <Select value={dateFilter} onChange={setDateFilter}>
              {/* Last 24h, 7d, 30d, All */}
            </Select>

            <Select value={errorCategoryFilter} onChange={setErrorCategoryFilter}>
              {/* All, Hallucination, Format, Refusal */}
            </Select>

            <Select value={modelFilter} onChange={setModelFilter}>
              {/* All models + individual models */}
            </Select>

            <Select value={projectFilter} onChange={setProjectFilter}>
              {/* All projects + extracted from tasks */}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Runs Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Run Name</TableHead>
              <TableHead>Date/Time</TableHead>
              <TableHead>Tasks × Models</TableHead>
              <TableHead>Pass Rate</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {runs.map(run => (
              <TableRow
                key={run.id}
                onClick={() => onRunClick(run.id)}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell>{run.name || run.id.slice(0, 8)}</TableCell>
                <TableCell>{formatDate(run.started_at)}</TableCell>
                <TableCell>{run.task_ids.length} × {run.model_ids.length}</TableCell>
                <TableCell>
                  {/* Calculate from results */}
                  {calculatePassRate(run)}
                  ({run.completed_tasks - run.failed_tasks}/{run.total_tasks})
                </TableCell>
                <TableCell>${calculateRunCost(run)}</TableCell>
                <TableCell>
                  <StatusBadge status={run.status} />
                </TableCell>
                <TableCell>
                  <Button size="sm" onClick={(e) => {
                    e.stopPropagation();
                    reRunEval(run.task_ids, run.model_ids);
                  }}>
                    Re-run
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
```

#### D4: Add Run Detail View
```typescript
function RunDetailView({ run, results, tasks, models, onBack }) {
  const [selectedResult, setSelectedResult] = useState<EvalResult | null>(null);

  return (
    <>
      {/* Run Metadata Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{run.name || `Run ${run.id.slice(0, 8)}`}</CardTitle>
              <CardDescription>
                Started: {formatDate(run.started_at)} |
                Duration: {calculateDuration(run)} |
                Status: {run.status}
              </CardDescription>
            </div>
            <Button onClick={onBack}>← Back to All Runs</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <StatCard label="Evaluations" value={run.total_tasks} />
            <StatCard label="Passed" value={run.completed_tasks - run.failed_tasks} />
            <StatCard label="Failed" value={run.failed_tasks} />
            <StatCard label="Pass Rate" value={`${calculatePassRate(run)}%`} />
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Results ({results.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ResultsTable
            results={results}
            tasks={tasks}
            models={models}
            showSummary={true}
            onResultClick={setSelectedResult}
          />
        </CardContent>
      </Card>

      {/* Result Detail Modal */}
      <ResultDetailModal
        result={selectedResult}
        task={tasks.find(t => t.id === selectedResult?.task_id) || null}
        model={models.find(m => m.id === selectedResult?.model_id) || null}
        open={!!selectedResult}
        onClose={() => setSelectedResult(null)}
      />
    </>
  );
}
```

---

## File-by-File Changes Summary

### Backend Changes (20 min)
```
backend/app/api/evaluations.py
  + Add GET /api/runs endpoint (15 lines)

backend/tests/unit/test_api_endpoints.py
  + Add test_list_runs_empty() (10 lines)
  + Add test_list_runs_ordering() (20 lines)
```

### Frontend New Files (75 min)
```
frontend/src/components/tables/ResultsTable.tsx (NEW)
  + Create reusable results table component (~150 lines)
  + Columns: Task, Model, Output, Method, Pass/Fail, Score, Cost, Latency
  + Summary footer with aggregated stats

frontend/src/components/ui/ResultDetailModal.tsx (NEW)
  + Create detail modal component (~120 lines)
  + Show full task, model, result details
  + Side-by-side expected vs actual comparison

frontend/src/lib/utils/cost-estimation.ts (NEW)
  + Estimate eval run cost (~40 lines)
  + Rough calculation based on task/model counts
```

### Frontend Modifications (60 min)
```
frontend/src/hooks/useEvaluation.ts
  + Add useRuns() hook (8 lines)

frontend/src/lib/services/evaluation-service.ts
  ~ Verify getRuns() implementation matches backend

frontend/src/components/tabs/EvaluateTab.tsx
  + Add run name input field
  + Add cost estimation display
  + Add results display after completion
  + Add detail modal integration
  ~ Refactor to use new components
  (~80 lines added/modified)

frontend/src/components/tabs/ReviewPerformanceTab.tsx
  ~ Complete overhaul with new structure
  + Add runs list view
  + Add run detail view
  + Add filters (date, error category, model, project)
  + Add summary stats
  (~250 lines, mostly new)
```

**Total New Code**: ~500 lines
**Total Modified Code**: ~100 lines
**Total Files Changed**: 9 (6 new, 3 modified)

---

## Critical Additions from Expert Review

### 1. Cost Estimation (Architect R1 - HIGH PRIORITY)
**Where**: EvaluateTab, before "Run" button
**What**: Display estimated cost, warn if >$0.50
**Why**: Prevents accidental expensive runs
**Effort**: 15 min

### 2. Run Name Input (Architect S1 - HIGH PRIORITY)
**Where**: EvaluateTab, above "Run" button
**What**: Input field for custom run names
**Why**: Easier to identify runs in history
**Effort**: 5 min

### 3. Error Category Filtering (Methodology M2 - HIGH PRIORITY)
**Where**: ReviewPerformanceTab filters
**What**: Dropdown to filter by error_category
**Why**: Essential for error pattern analysis
**Effort**: 15 min

### 4. Evaluation Method Display (Methodology M4 - HIGH PRIORITY)
**Where**: ResultsTable column
**What**: Badge showing code/llm_judge/hybrid
**Why**: Transparency in how results were determined
**Effort**: 5 min

### 5. Ground Truth Comparison (Methodology M5 - HIGH PRIORITY)
**Where**: ResultDetailModal
**What**: Side-by-side expected vs actual output
**Why**: Understand why eval passed/failed
**Effort**: 10 min

### 6. Timeout Verification (Architect R2 - HIGH PRIORITY)
**Where**: Backend OpenRouterClient, documentation
**What**: Verify 30s timeout sufficient, document limits
**Why**: Prevent mysterious timeout failures
**Effort**: 5 min

**Total Additional Effort**: +55 min = **Grand Total: 3-3.5 hours**

---

## Known Limitations (To Document)

### Acknowledged by Both Experts:
1. **LLM-as-Judge is Placeholder**: Not validated against human agreement yet (ticket-005)
2. **Dummy Data is Synthetic**: User must add real research tasks after this implementation
3. **No Confidence Scoring**: Judge doesn't return confidence levels yet (ticket-005)
4. **No Export Functionality**: CSV/JSON export deferred to ticket-006
5. **No Run Cancellation**: Can't stop running evals mid-flight (BACKLOG)
6. **Limited Async Support**: Large runs (>50 evals) may timeout (BACKLOG - add job queue)

### Where to Document:
- `ERROR_ANALYSIS.md` - Methodology gaps and next steps
- `ticket-004-api-integration.md` - Implementation limitations
- `BACKLOG.md` - Deferred features

---

## Success Validation

### Must Pass (Blocking):
```bash
# Test 1: Run evaluation with real LLM
1. Navigate to Evaluate tab
2. Select: "Basic Math Classification" task + "gpt-4o-mini" model
3. Enter run name: "Test Run 1"
4. Verify cost estimate shows (~$0.01)
5. Click "Run Evaluation"
6. Verify progress bar appears
7. Wait for completion (5-10s)
8. Verify results table appears with:
   ✅ Model output is real LLM response (e.g., "The answer is 4" or "4")
   ✅ Pass/fail determined by eval engine (should pass)
   ✅ Evaluation method badge shows "code"
   ✅ Cost is real ($0.0001 - $0.001 for mini model)
   ✅ Latency is real (500-2000ms)
9. Click result row → verify detail modal opens
10. Verify modal shows expected "4" vs actual output
11. Close modal
```

```bash
# Test 2: Browse run history
1. Navigate to Review Performance tab
2. Verify "Test Run 1" appears in runs list
3. Verify pass rate shows (1/1 or 100%)
4. Verify cost matches what was shown
5. Click run → verify same results display as in Evaluate tab
6. Click "Back to All Runs"
7. Run another eval with different tasks/models
8. Return to Review Performance
9. Verify new run appears at TOP (most recent first)
10. Apply date filter "Last 24h" → both runs should show
```

```bash
# Test 3: Filtering
1. In Review Performance tab
2. Apply error category filter: "all"
3. Apply model filter: "gpt-4o-mini"
4. Verify only runs using that model show
5. Apply project filter: "dev-testing"
6. Verify only runs with dev-testing tasks show
7. Clear filters → all runs return
```

```bash
# Test 4: Error handling
1. Stop backend server (simulate failure)
2. Try to run evaluation
3. Verify error message shows clearly
4. Restart backend
5. Retry → verify works
```

---

## Expert Consensus

### Platform Architect Says:
> "The plan is architecturally sound. Synchronous execution is fine for MVP. Component reuse is good. Add cost estimation to prevent expensive mistakes. Ship it."

### Methodology Expert Says:
> "Infrastructure plan is excellent—it will enable proper evaluation work. BUT: after implementing this, you MUST do real error analysis with actual data. The 8 dummy tasks are useful for testing the platform, but they're not real evals. Ticket-005 must focus on methodology: real data, validated judges, proper error analysis. This ticket builds the platform; next ticket makes it scientifically valid."

### Combined Recommendation:
✅ **Implement this plan with the 6 critical additions**
✅ **Document limitations clearly**
✅ **After completion, USER must add real research tasks**
✅ **Ticket-005 (MET-59) must address methodology gaps**

---

## Approval Checklist

Before I proceed, please confirm:

- [ ] **You approve the overall plan** (Phases A-D)
- [ ] **You approve the 6 critical additions** (cost estimation, run naming, etc.)
- [ ] **You understand the limitations** (LLM-judge placeholder, synthetic data)
- [ ] **You're comfortable with the timeline** (2.5-3.5 hours)
- [ ] **You want both phases implemented** (not just Phase A)

**Questions to Answer:**
1. Cost limit preference? (e.g., warn at $0.50, block at $5.00?)
2. Run naming: required or optional? (Recommend: optional)
3. Implement Phase A first for feedback, or both phases together? (Recommend: together)
4. Keep 8 dummy tasks or replace entirely after implementation? (Recommend: keep for testing)

---

## 🚨 FINAL APPROVAL REQUEST

**I will NOT begin implementation until you explicitly approve.**

Please review:
1. ✅ Original plan: `EVALUATE_TAB_EXECUTION_PLAN.md`
2. ✅ Expert reviews: `EVALUATE_TAB_EXPERT_REVIEWS.md`
3. ✅ This final plan: `EVALUATE_TAB_FINAL_PLAN.md`

**Your approval means**:
- I will implement Phases A-D as described
- I will include all 6 critical additions
- I will document limitations clearly
- Estimated 2.5-3.5 hours

**Ready to proceed? Please type "APPROVED" or provide feedback for revisions.**
