# Expert Reviews: Evaluate Tab Implementation Plan

**Date**: September 30, 2025
**Plan**: `EVALUATE_TAB_EXECUTION_PLAN.md`
**Reviewers**: LLM Evaluation Platform Architect, AI Evals Methodology Expert

---

## Review #1: LLM Evaluation Platform Architect

**Overall Assessment**: ✅ **APPROVED with Recommendations**
**Score**: 8.5/10 (Strong plan, minor optimizations suggested)

### Strengths

✅ **Pragmatic Architecture Decisions**
- Synchronous execution for MVP is correct choice (Hamel's principle: "Start simple")
- Avoiding premature async optimization follows "YAGNI" principle
- Component reuse (ResultsTable) shows good abstraction thinking

✅ **Follows Established Patterns**
- Router pattern consistent with existing backend
- React Query usage matches existing hooks
- Error handling aligns with current middleware

✅ **Appropriate Scope**
- Focused on user value (immediate results + historical browsing)
- Not over-engineering (no microservices, no complex job queues)
- Clear phases with incremental delivery

✅ **Data Model Alignment**
- Leverages existing schema (RunStatusResponse, EvalResultResponse)
- No new database migrations needed
- Proper use of existing foreign keys and relationships

### Recommendations

⚠️ **R1: Add Cost Estimation Before Running**
```typescript
// In EvaluateTab, before "Run Evaluation" button
const estimatedCost = calculateEstimatedCost(selectedTasks, selectedModels);

// Show warning if > $0.50
{estimatedCost > 0.50 && (
  <Alert variant="warning">
    Estimated cost: ${estimatedCost.toFixed(2)}
    {estimatedCost > 1.0 && " - This is a large run!"}
  </Alert>
)}
```

**Why**: Prevents accidental expensive runs (especially with GPT-4)
**Effort**: 10 min
**Priority**: Medium

⚠️ **R2: Add Request Timeout Configuration**
```python
# In evaluations.py
EVAL_TIMEOUT_SECONDS = 300  # 5 minutes max

# In OpenRouterClient.__init__
self.timeout = httpx.Timeout(30.0, read=60.0)  # Already exists, verify it's sufficient
```

**Why**: Large runs could timeout default HTTP timeout (30s)
**Effort**: 5 min (mostly verification)
**Priority**: High (prevents mysterious failures)

⚠️ **R3: Add Run Cancellation Capability (Future)**
```python
# For now, just document limitation
# Future: Add DELETE /api/runs/{run_id} to cancel running evals
```

**Why**: User might start wrong run and want to cancel
**Effort**: 30 min (defer to future ticket)
**Priority**: Low (rare need, complex implementation)

⚠️ **R4: Consider Response Compression**
```python
# If results have large outputs (>10KB per result)
from fastapi.responses import ORJSONResponse

@router.get("/results", response_class=ORJSONResponse)
# Faster serialization for large payloads
```

**Why**: JSON parsing can be slow with large model outputs
**Effort**: 5 min
**Priority**: Low (optimize only if performance issue observed)

### Architecture Concerns

🔍 **Concern 1: No Caching Strategy for Runs List**
- **Issue**: Every tab switch re-fetches all runs
- **Current**: React Query has 5min stale time (probably fine)
- **Recommendation**: Monitor network tab, add longer staleTime if needed
- **Action**: No change needed now, revisit if performance issue

🔍 **Concern 2: No Pagination for Runs**
- **Issue**: Fetching 1000+ runs could be slow
- **Current**: Limit to 100 most recent (reasonable)
- **Recommendation**: Add pagination when >100 runs exist
- **Action**: Add to BACKLOG.md for future

🔍 **Concern 3: Results Table Not Virtualized**
- **Issue**: Rendering 100 table rows could lag on slower devices
- **Current**: Acceptable for MVP
- **Recommendation**: Monitor, add react-window if laggy
- **Action**: Test on slow device, optimize if needed

### Technical Suggestions

💡 **Suggestion 1: Add Run Name Input Field**
```typescript
// In EvaluateTab, before Run button
<Input
  placeholder="Run name (optional)"
  value={runName}
  onChange={(e) => setRunName(e.target.value)}
/>
// Pass to runEvaluation({ run_name: runName || `Run ${date}` })
```

**Why**: Makes runs easier to identify in history
**Effort**: 5 min
**Priority**: High (great UX improvement)

💡 **Suggestion 2: Add "Re-run" Button in Results**
```typescript
// In ResultsTable or ReviewPerformanceTab
<Button onClick={() => reRunEval(run.task_ids, run.model_ids)}>
  Re-run This Evaluation
</Button>
```

**Why**: Common workflow is comparing runs after prompt changes
**Effort**: 10 min
**Priority**: Medium

💡 **Suggestion 3: Add Export to CSV**
```typescript
// In ResultsTable
<Button onClick={() => exportResultsToCSV(results)}>
  Export to CSV
</Button>
```

**Why**: Enables external analysis in Excel/Python
**Effort**: 15 min
**Priority**: Low (defer to future)

### Verdict

✅ **APPROVED FOR IMPLEMENTATION**

The plan is solid and follows best practices. Synchronous execution is appropriate for MVP scale. Component architecture is clean. Minor optimizations suggested but not blocking.

**Must-Haves Before Proceeding:**
- ✅ Add cost estimation display (R1) - prevents expensive mistakes
- ✅ Verify timeout configuration (R2) - prevents mysterious failures
- ✅ Add run name input (S1) - critical for usability

**Can-Defers:**
- ⚠️ Run cancellation (R3) - add to BACKLOG
- ⚠️ Response compression (R4) - optimize if needed
- ⚠️ Re-run button (S2) - nice-to-have
- ⚠️ CSV export (S3) - defer to ticket-006

**Implementation Priority:**
1. Implement plan as written (Phase A → B → C)
2. Add cost estimation (R1) during Phase A
3. Verify timeouts (R2) during Phase A
4. Add run name input (S1) during Phase A
5. Defer other suggestions to BACKLOG

---

## Review #2: AI Evals Methodology Expert

**Overall Assessment**: ⚠️ **APPROVED with Critical Gaps Noted**
**Score**: 7/10 (Implementation is solid, but methodology has significant gaps)

### Alignment with Eval Methodology Rubric

#### ✅ Phase 0: Error Analysis - PARTIAL
**Current State**:
- ✅ ERROR_ANALYSIS.md created with framework
- ✅ Error categories documented
- ❌ **NO REAL ERROR ANALYSIS CONDUCTED** (only framework, no actual errors reviewed)
- ❌ Using synthetic dummy data, not real production data

**From Rubric**:
> "Error analysis is the most critical activity in evals. It tells you what evals to write."

**Critical Gap**: You haven't done manual error review of real LLM outputs yet. The 8 dummy tasks are synthetic, not based on actual failure modes discovered through error analysis.

**Recommendation for THIS Ticket**:
- ✅ Implement the evaluate tab as planned (infrastructure is solid)
- ⚠️ After implementation, USER MUST run real evals and conduct error analysis
- ⚠️ Document this as "Next Step" in ticket completion

**Recommendation for NEXT Ticket (MET-59)**:
- Run 50-100 real evaluations with actual research tasks
- Manually review all outputs (especially failures)
- Categorize error types (hallucinations, format errors, refusals)
- Prioritize error categories
- Write new eval tasks based on discovered failure modes

#### ✅ Phase 1: Eval Design - PARTIAL
**Current State**:
- ✅ Clear objectives for each dummy task
- ✅ Ground truth documented for classification tasks
- ⚠️ **GROUND TRUTH IS SYNTHETIC** (not verified against real data)
- ✅ Eval dataset version tracking exists (task_version field)

**From Rubric**:
> "The biggest mistake is using synthetic data or toy examples. Evals must reflect real-world complexity."

**Critical Gap**: All 8 dummy tasks are "toy examples" (2+2, capital of France). While useful for testing infrastructure, they don't reflect real research evaluation needs.

**Recommendation**:
- ✅ Keep dummy tasks for development/testing (properly tagged)
- ⚠️ After implementing evaluate tab, USER must add real research tasks
- ⚠️ Real tasks should come from actual research questions, not made up

**Example Real Task** (vs Synthetic):
```
SYNTHETIC (current):
"What is 2+2?" → "4"

REAL (what user needs):
"Given this cognitive science paper abstract: [real abstract],
identify the primary hypothesis and supporting evidence."
→ Ground truth from domain expert review
```

#### ✅ Phase 2: Implementation - EXCELLENT
**Current State**:
- ✅ Code-based evaluation for deterministic tasks (correct choice!)
- ✅ LLM-as-judge for generation tasks (appropriate)
- ✅ Hybrid approach for complex reasoning (good!)
- ⚠️ **LLM-AS-JUDGE NOT YET VALIDATED** (placeholder implementation)

**From Rubric**:
> "Don't use LLM-as-judge for everything. Code-based assertions are faster, cheaper, and more reliable when applicable."

**Strengths**:
- ✅ Correctly uses code assertions for exact match (2+2, capital cities)
- ✅ Correctly uses LLM-judge for subjective tasks (haiku quality, code explanation)
- ✅ Has rubric defined for LLM-judge tasks

**Critical Gap**: LLM-as-judge evaluation is placeholder (just checks for keywords). Need to:
1. Implement real LLM-as-judge with structured prompts
2. Validate judge against human judgments (>80% agreement)
3. Track judge model version
4. Document judge validation results

**Recommendation**:
- ✅ Implement evaluate tab as planned (infrastructure first)
- ⚠️ Defer LLM-as-judge validation to ticket-005 (Error Analysis & LLM-as-Judge)
- ⚠️ Document limitation: "LLM-judge is placeholder, needs validation"

#### ✅ Phase 3: Integration - EXCELLENT
**Current State**:
- ✅ Results will be visible immediately (good feedback loop)
- ✅ Run history enables comparison over time
- ✅ Filtering by tags/models enables workflow integration
- ✅ Cost tracking visible (critical for budget management)

**Strengths**:
- ✅ Fast iteration: run eval → see results → adjust → re-run (seconds, not minutes)
- ✅ Comparison enabled: browse history, compare runs
- ✅ Cost visible: prevents runaway spending
- ✅ Pass/fail criteria clear: user knows what passed/failed

**No critical gaps here** - implementation plan is solid.

### Methodology-Specific Recommendations

⚠️ **M1: Add Confidence/Uncertainty Display**
```typescript
// In ResultsTable, add column
<TableCell>
  {result.metrics?.confidence || 'N/A'}
  {result.metrics?.confidence === 'LOW' && (
    <Badge variant="warning">Review Manually</Badge>
  )}
</TableCell>
```

**Why**: Low-confidence results need manual review (per rubric)
**Effort**: 10 min
**Priority**: Medium

⚠️ **M2: Add Error Category Filtering**
```typescript
// In ReviewPerformanceTab filters
<Select value={errorFilter} onValueChange={setErrorFilter}>
  <SelectItem value="all">All Errors</SelectItem>
  <SelectItem value="hallucination">Hallucinations</SelectItem>
  <SelectItem value="format">Format Errors</SelectItem>
  <SelectItem value="refusal">Refusals</SelectItem>
</Select>
```

**Why**: Enables error pattern analysis (Phase 0 of rubric)
**Effort**: 15 min
**Priority**: High (critical for error analysis)

⚠️ **M3: Add "Flag for Review" Functionality**
```typescript
// In ResultsTable
<Button onClick={() => flagResult(result.id, "needs_review")}>
  Flag for Manual Review
</Button>
```

**Why**: Some results need human judgment (ambiguous cases)
**Effort**: 20 min (needs backend endpoint)
**Priority**: Low (defer to future)

⚠️ **M4: Display Evaluation Method in Results**
```typescript
// In ResultsTable, show how each result was evaluated
<Badge>{result.evaluation_method}</Badge>
// "code", "llm_judge", "hybrid"
```

**Why**: User should know how each result was determined
**Effort**: 5 min
**Priority**: High (transparency)

⚠️ **M5: Add "Ground Truth" Column (Optional)**
```typescript
// In ResultDetailModal, show expected vs actual
<div>
  <h4>Expected Output:</h4>
  <pre>{task.expected_output}</pre>

  <h4>Model Output:</h4>
  <pre>{result.model_output}</pre>

  <h4>Match:</h4>
  {result.passed ? '✅ Passed' : '❌ Failed'}
</div>
```

**Why**: Helps user understand why eval passed/failed
**Effort**: 10 min
**Priority**: High (essential for understanding results)

### Critical Methodology Gaps (For Future Tickets)

🚨 **GAP 1: No Real Error Analysis Yet**
- **Issue**: Platform will work, but evals are synthetic
- **Impact**: Won't catch real failure modes until user adds real tasks
- **Mitigation**: Document clearly, guide user to add real tasks
- **Next Ticket**: MET-59 must include actual error analysis with real data

🚨 **GAP 2: LLM-as-Judge Not Validated**
- **Issue**: Judge outputs not validated against human agreement
- **Impact**: Can't trust pass/fail for generation tasks
- **Mitigation**: Document as "placeholder" in UI
- **Next Ticket**: MET-59 must validate judge (>80% human agreement)

🚨 **GAP 3: No Inter-Rater Reliability**
- **Issue**: Ground truth labels from single source (not validated)
- **Impact**: May have incorrect labels
- **Mitigation**: Use verified facts for dummy tasks (2+2=4, Paris=capital)
- **Next Ticket**: Real tasks need expert validation

### Verdict

✅ **APPROVED FOR IMPLEMENTATION** with caveats:

**Must Include in THIS Ticket:**
1. ✅ Cost estimation display (R1 from architect)
2. ✅ Error category filtering (M2)
3. ✅ Display evaluation method in results (M4)
4. ✅ Ground truth comparison in detail view (M5)

**Document as Known Limitations:**
1. LLM-as-judge is placeholder (not validated)
2. Dummy tasks are synthetic (need real tasks)
3. No confidence scoring yet (add in ticket-005)

**Defer to Future Tickets:**
1. Full LLM-as-judge validation (MET-59)
2. Real error analysis with production data (MET-59)
3. Inter-rater reliability tracking (MET-60+)
4. Flag for review functionality (MET-60+)

**Methodological Assessment**:
- ✅ Infrastructure: Excellent (enables rapid iteration)
- ⚠️ Methodology: Gaps exist but documented and planned
- ✅ User Workflow: Will enable real evaluation work
- ⚠️ Data Quality: Synthetic now, must transition to real

**This ticket builds the platform. Next ticket (MET-59) must focus on methodology.**

---

## Consolidated Expert Feedback

### Both Experts Agree On:

✅ **Approve implementation plan as written**
✅ **Synchronous execution is correct for MVP**
✅ **Component reuse (ResultsTable) is good design**
✅ **Incremental delivery (Phase A → B) makes sense**

### Critical Additions Before Implementation:

1. **Cost Estimation** (Architect R1)
   - Display estimated cost before running
   - Warn if >$0.50
   - Prevent accidental expensive runs

2. **Error Category Filtering** (Methodology M2)
   - Add error_category filter to Review Performance
   - Enables error pattern analysis
   - Critical for Phase 0 of methodology rubric

3. **Evaluation Method Display** (Methodology M4)
   - Show how each result was evaluated (code/llm_judge/hybrid)
   - Transparency requirement

4. **Ground Truth Comparison** (Methodology M5)
   - In detail modal, show expected vs actual output
   - Essential for understanding pass/fail decisions

5. **Run Name Input** (Architect S1)
   - Let user name runs for easier identification
   - Better than auto-generated timestamps

6. **Timeout Verification** (Architect R2)
   - Verify HTTP timeout sufficient for large runs
   - Document limits (max X tasks/models before timeout)

### Deferred to Future Tickets:

- Run cancellation → BACKLOG
- CSV export → ticket-006 (cost monitoring)
- Response compression → optimize if needed
- LLM-as-judge validation → ticket-005 (MET-59)
- Real error analysis → ticket-005 (MET-59)
- Confidence scoring → ticket-005
- Flag for review → ticket-006+

---

## Updated Implementation Plan

### Phase A: Enhanced Evaluate Tab (90 min)
1. Backend: Add `GET /api/runs` endpoint (10 min)
2. Backend: Add tests for list runs (10 min)
3. Backend: Verify timeout configuration (5 min)
4. Frontend: Add `useRuns()` hook (5 min)
5. Frontend: Create ResultsTable component with evaluation_method column (25 min)
6. Frontend: Create ResultDetailModal with ground truth comparison (15 min)
7. Frontend: Enhance EvaluateTab:
   - Add run name input field (5 min)
   - Add cost estimation display (10 min)
   - Add results display after completion (10 min)
8. Testing & debugging (15 min)

### Phase B: Enhanced Review Performance Tab (60 min)
1. Frontend: Add runs list view (20 min)
2. Frontend: Add filters (date, project, model, error_category) (25 min)
3. Frontend: Add run detail drill-down (10 min)
4. Testing & debugging (15 min)

### Phase C: Documentation & Polish (20 min)
1. Update ticket-004 with implementation notes (5 min)
2. Add known limitations to ERROR_ANALYSIS.md (5 min)
3. E2E testing (10 min)

**Total**: 2.5-3 hours (updated from 2.5-3.5 hours)

---

## Risk Mitigation Updates

### New Risks Identified

**Risk 7: Cost Estimation Accuracy**
- **Issue**: Estimated cost may not match actual (token counting is approximate)
- **Mitigation**: Show "~$X estimated" with disclaimer
- **Future**: Track actual vs estimated, improve accuracy

**Risk 8: Error Category Inconsistency**
- **Issue**: Different tasks may use different error categories
- **Mitigation**: Document standard error categories in ERROR_ANALYSIS.md
- **Future**: Enforce taxonomy with validation

### Updated Success Criteria

#### Must Pass:
- [ ] Run evaluation with real LLM → see actual model output (not "dummy data")
- [ ] Cost estimation shows before running (prevents accidents)
- [ ] Results display immediately with all columns (task, model, output, pass/fail, score, cost, latency)
- [ ] Detail modal shows expected vs actual comparison
- [ ] Review Performance shows all runs sorted by date
- [ ] Filters work: date range, error category, model, project
- [ ] Error handling graceful (API failures show clear messages)

#### Should Pass:
- [ ] Run name input field allows custom naming
- [ ] Timeout configuration handles large runs (up to 50 evals)
- [ ] Performance acceptable (<2s load times)

#### Nice to Have:
- [ ] Re-run button for quick iteration
- [ ] CSV export for external analysis

---

## Final Recommendation

### From LLM Platform Architect:
**"Ship it with the critical additions (cost estimation, run naming, error category filtering). The architecture is sound and enables rapid iteration, which is the goal. Defer optimizations to BACKLOG until you have real performance data."**

### From AI Evals Methodology Expert:
**"The platform infrastructure is excellent and will enable proper evaluation work. However, the real work begins AFTER this ticket: conducting error analysis with real data, validating LLM-as-judge, and building evals grounded in actual failure modes. Document the methodology gaps clearly so the next ticket (MET-59) can address them systematically."**

### Consolidated Verdict:

✅ **APPROVED FOR IMPLEMENTATION**

**with the following MUST-HAVE additions**:
1. Cost estimation before running (prevent expensive accidents)
2. Run name input field (usability)
3. Error category filtering (methodology requirement)
4. Evaluation method display (transparency)
5. Ground truth comparison in detail view (understanding results)
6. Timeout verification (prevent mysterious failures)

**and the following clearly DOCUMENTED LIMITATIONS**:
1. LLM-as-judge is placeholder (ticket-005 will validate)
2. Dummy tasks are synthetic (user must add real tasks)
3. No confidence scoring yet (ticket-005)
4. No export functionality yet (ticket-006)

**READY FOR USER APPROVAL**

---

## Questions for User

1. **Cost Limits**: What's your comfort level for eval run costs? Should we add hard limit (e.g., refuse to run if estimated >$5)?

2. **Run Naming**: Should run names be required or optional? (Proposal: optional with auto-generated default)

3. **Results Persistence**: How long should we keep evaluation results? (Proposal: keep forever for MVP, add retention policy later)

4. **Priority**: Should we implement Phase A first and get feedback before Phase B, or implement both together?

5. **Dummy Data**: After implementation, do you want to keep the 8 dummy tasks or replace them entirely with real research tasks?

**Please review the updated plan and provide approval to proceed!**
