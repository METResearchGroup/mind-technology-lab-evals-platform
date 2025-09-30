# Evaluation Method Taxonomy Design

**Date**: September 30, 2025
**Reviewer**: LLM Evaluation Platform Architect
**Goal**: Design a precise, practical taxonomy for code-based evaluation methods

---

## Current Problem

**Current State**: Single "code" method is too vague
- What does "code" actually do? (Exact match? Contains? JSON comparison?)
- Hard to know what evaluation will do without reading code
- No visibility into evaluation logic in UI

**Impact**:
- Users confused when evals fail (expected "Tokyo", got "The capital of Japan is Tokyo")
- Can't choose right method for their task
- Platform feels like a black box

---

## Proposed Taxonomy (LLM Platform Architect Review)

### Design Principles (from Hamel's Rubric)

1. **Start Simple**: Don't over-engineer, add methods as needed
2. **Be Explicit**: Method name should describe what it does
3. **Code > LLM**: Use deterministic code checks whenever possible (faster, cheaper, more reliable)
4. **Composable**: Methods should be composable for hybrid approaches

### Recommended Method Taxonomy

```
CODE-BASED METHODS (Deterministic, Fast, Cheap)
├── exact_match          - Exact string match (case-insensitive)
├── contains             - Check if output contains expected substring
├── regex_match          - Pattern matching with regex
├── json_exact           - Parse as JSON and check equality
├── json_schema          - Validate JSON structure against schema
├── numeric_range        - Check if number falls in expected range
├── list_contains        - Check if all expected items present (order independent)
├── format_check         - Validate format (email, URL, date, etc.)
└── code_execution       - Run code and check output/side effects

LLM-BASED METHODS (Subjective, Slower, More Expensive)
├── llm_judge            - LLM evaluates quality/correctness
├── llm_rubric           - LLM scores against detailed rubric
└── llm_classification   - LLM classifies response into categories

HYBRID METHODS (Combine Code + LLM)
├── hybrid_strict        - Code check first, LLM only if code fails
├── hybrid_lenient       - Code check OR LLM check (either passes)
└── hybrid_consensus     - Both must agree to pass
```

### Detailed Method Specifications

#### **exact_match**
```yaml
Name: exact_match
Description: Exact string match (whitespace trimmed, case-insensitive)
Use When: Need precise answer (math, factual Q&A with single-word answers)
Example:
  Input: "What is 2+2?"
  Expected: "4"
  Pass: "4", "  4  ", "4.0"
  Fail: "The answer is 4", "four"
Implementation:
  expected.strip().lower() == actual.strip().lower()
Cost: Free (no API call)
Latency: <1ms
```

#### **contains**
```yaml
Name: contains
Description: Check if output contains expected substring (case-insensitive)
Use When: Answer needs specific information but verbosity is OK
Example:
  Input: "What is the capital of Japan?"
  Expected: "Tokyo"
  Pass: "Tokyo", "The capital is Tokyo", "Tokyo is the capital"
  Fail: "Kyoto", "I don't know"
Implementation:
  expected.strip().lower() in actual.strip().lower()
Cost: Free
Latency: <1ms
```

#### **regex_match**
```yaml
Name: regex_match
Description: Match output against regex pattern
Use When: Format matters (emails, phone numbers, structured text)
Example:
  Input: "Extract email from: Contact John at john@example.com"
  Expected: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
  Pass: "john@example.com", "contact@company.co.uk"
  Fail: "john@", "not an email"
Implementation:
  re.match(expected_pattern, actual) is not None
Cost: Free
Latency: <1ms
```

#### **json_exact**
```yaml
Name: json_exact
Description: Parse both as JSON and check deep equality
Use When: Structured data where order matters
Example:
  Input: "Return user as JSON: name=John, age=30"
  Expected: '{"name": "John", "age": 30}'
  Pass: '{"name": "John", "age": 30}', '{"name":"John","age":30}'
  Fail: '{"age": 30, "name": "John"}' (if order matters)
Implementation:
  json.loads(expected) == json.loads(actual)
Cost: Free
Latency: <1ms
```

#### **json_schema**
```yaml
Name: json_schema
Description: Validate JSON against schema (structure, not values)
Use When: Care about format, not specific values
Example:
  Input: "Return user info as JSON"
  Expected Schema: {"type": "object", "required": ["name", "age"]}
  Pass: '{"name": "Any", "age": 99}', '{"name": "Bob", "age": 25, "extra": "ok"}'
  Fail: '{"name": "Bob"}' (missing age), 'not json'
Implementation:
  jsonschema.validate(json.loads(actual), expected_schema)
Cost: Free
Latency: <1ms
```

#### **numeric_range**
```yaml
Name: numeric_range
Description: Extract number and check if in range
Use When: Approximate numeric answers (estimations, calculations)
Example:
  Input: "Estimate population of Tokyo"
  Expected: {"min": 13_000_000, "max": 15_000_000}
  Pass: "14 million", "~14,000,000", "approximately 13.5M"
  Fail: "10 million", "over 20 million"
Implementation:
  extracted_num = extract_number(actual)
  min_val <= extracted_num <= max_val
Cost: Free
Latency: <1ms
```

#### **contains** (List variant)
```yaml
Name: list_contains
Description: Check if all expected items present (order-independent)
Use When: Multiple facts, any order OK
Example:
  Input: "List primary colors"
  Expected: ["red", "blue", "yellow"]
  Pass: "red, blue, yellow", "yellow, red, and blue"
  Fail: "red, blue" (missing yellow), "red, blue, green" (contains all but has extra)
Implementation:
  all(item.lower() in actual.lower() for item in expected_list)
Cost: Free
Latency: <1ms
```

#### **format_check**
```yaml
Name: format_check
Description: Validate format (email, URL, date, etc.)
Use When: Format correctness matters, not content
Example:
  Input: "Extract email from text"
  Expected Format: "email"
  Pass: "john@example.com", "test@test.org"
  Fail: "john@", "not an email", "john.doe"
Implementation:
  validators.email(actual)  # Using validators library
Cost: Free
Latency: <1ms
```

---

## Recommended Implementation Plan

### Phase 1: Core Methods (Implement Now)
```python
EVALUATION_METHODS = {
    # Code-based (deterministic)
    "exact_match": "Exact string match (case-insensitive, trimmed)",
    "contains": "Output contains expected substring",
    "json_exact": "Parse and compare JSON objects",
    "regex_match": "Match against regex pattern",

    # LLM-based (subjective)
    "llm_judge": "LLM evaluates quality/correctness",

    # Hybrid
    "hybrid": "Code check first, LLM fallback",
}
```

### Phase 2: Advanced Methods (Add Later)
```python
ADVANCED_METHODS = {
    "json_schema": "Validate JSON structure",
    "numeric_range": "Number within specified range",
    "list_contains": "All items present (order-independent)",
    "format_check": "Validate format (email, URL, etc.)",
    "code_execution": "Execute code and verify output",
}
```

### Migration Strategy

**Don't Break Existing Tasks**: Map old "code" → new method
```python
# In evaluation engine
if task.evaluation_method == "code":
    # Check if task has expected_output
    if task.expected_output:
        # Use exact_match for backward compatibility
        return evaluate_exact_match(task, model_output)
    else:
        raise ValueError("Code evaluation requires expected_output")
```

**Database Schema Update**: Add new column
```python
# OLD schema
evaluation_method VARCHAR(50) CHECK (evaluation_method IN ('code', 'llm_judge', 'hybrid'))

# NEW schema
evaluation_method VARCHAR(50) CHECK (evaluation_method IN (
    'exact_match', 'contains', 'json_exact', 'regex_match',
    'llm_judge', 'hybrid',
    'code'  # Deprecated, maps to exact_match
))
```

---

## UI/UX Design

### Method Display with Tooltips

**In Task Table**:
```tsx
<Badge
  variant="outline"
  title="Exact string match (case-insensitive, trimmed)"
  className="cursor-help"
>
  exact_match
</Badge>
```

**Better: Use Tooltip Component**:
```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>
      <Badge variant="outline">exact_match</Badge>
    </TooltipTrigger>
    <TooltipContent>
      <div className="space-y-1">
        <p className="font-semibold">Exact Match</p>
        <p className="text-xs">Exact string match (case-insensitive, whitespace trimmed)</p>
        <p className="text-xs text-muted-foreground">
          Example: "Tokyo" matches "tokyo" or "  Tokyo  "
        </p>
      </div>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

**In Filters**:
```tsx
<Select>
  <SelectItem value="exact_match">
    <div className="flex items-center justify-between w-full">
      <span>Exact Match</span>
      <Info className="h-3 w-3" /> {/* Hover for tooltip */}
    </div>
  </SelectItem>
</Select>
```

---

## Implementation Priority

### Must Have (Implement Now)
1. **exact_match** - Replaces current "code" for exact matching
2. **contains** - Solves your current problem (verbose LLM outputs)
3. **json_exact** - Common for structured output
4. **llm_judge** - Already exists

### Should Have (Next 2 Weeks)
5. **regex_match** - Format validation
6. **hybrid** - Best of both worlds

### Nice to Have (Future)
7. **json_schema** - Advanced JSON validation
8. **numeric_range** - Approximate numbers
9. **list_contains** - Multi-item checking
10. **format_check** - Email/URL validation

---

## Example: Your Failing Task Fixed

### Current (Failing)
```python
{
    "input": "What is the capital of Japan?",
    "expected_output": "Tokyo",
    "evaluation_method": "code",  # exact_match
}
# LLM output: "The capital of Japan is Tokyo"
# Result: FAIL (no match)
```

### Option 1: Use "contains"
```python
{
    "input": "What is the capital of Japan?",
    "expected_output": "Tokyo",
    "evaluation_method": "contains",  # NEW!
}
# LLM output: "The capital of Japan is Tokyo"
# Result: PASS ("Tokyo" is in the output)
```

### Option 2: Better Prompt + exact_match
```python
{
    "input": "What is the capital of Japan? Answer with ONLY the city name.",
    "expected_output": "Tokyo",
    "evaluation_method": "exact_match",
}
# LLM output: "Tokyo"
# Result: PASS (exact match)
```

---

## Architect Recommendations

### 🏗️ **Implementation Strategy**

**Phase 1: Backend Refactor** (30 min)
1. Rename `evaluation_method` values for clarity
2. Update evaluation engine with new methods
3. Add method registry with descriptions
4. Ensure backward compatibility

**Phase 2: Frontend Tooltips** (20 min)
1. Install shadcn tooltip component
2. Create MethodBadgeWithTooltip component
3. Add method descriptions registry (shared with backend)
4. Use in Task table and filters

**Phase 3: Migration** (10 min)
1. Update existing tasks (optional - old "code" still works)
2. Update seed data to use new methods
3. Document in ERROR_ANALYSIS.md

**Total**: 1 hour

### 🎯 **Best Practices**

#### DO:
✅ **Be Explicit**: "exact_match" > "code" (clear what it does)
✅ **Provide Examples**: Every method has pass/fail examples
✅ **Document Trade-offs**: Speed vs flexibility, strictness vs leniency
✅ **Show in UI**: Tooltips explain methods without reading docs

#### DON'T:
❌ **Over-engineer**: Start with 4-5 methods, add more as needed
❌ **Break existing tasks**: Support "code" for backward compatibility
❌ **Hide implementation**: Make evaluation logic transparent
❌ **Forget costs**: Document which methods cost money (LLM) vs free (code)

### 🔍 **Method Selection Guide**

**Decision Tree**:
```
1. Is output structured data (JSON, CSV)?
   YES → Use json_exact or json_schema
   NO → Continue

2. Is exact wording required?
   YES → Use exact_match
   NO → Continue

3. Does output need specific substring/keyword?
   YES → Use contains or regex_match
   NO → Continue

4. Is evaluation subjective (quality, tone, coherence)?
   YES → Use llm_judge
   NO → Consider if you need an eval at all

5. Want both code + LLM validation?
   YES → Use hybrid
```

### 📊 **Method Comparison Table**

| Method | Speed | Cost | Strictness | Use Case |
|--------|-------|------|------------|----------|
| exact_match | <1ms | $0 | Very High | Math, single-word answers |
| contains | <1ms | $0 | Medium | Keywords, facts in sentences |
| regex_match | <1ms | $0 | Medium-High | Emails, phone numbers, patterns |
| json_exact | <1ms | $0 | High | Structured data, APIs |
| json_schema | <1ms | $0 | Medium | JSON format validation |
| llm_judge | ~2s | $0.001-0.01 | Low-Medium | Quality, tone, coherence |
| hybrid | ~2s | $0.001-0.01 | Medium | Complex reasoning + facts |

---

## UI Tooltip Content

### Tooltip Template
```tsx
{
  name: "exact_match",
  displayName: "Exact Match",
  description: "Exact string match (case-insensitive, whitespace trimmed)",
  examples: {
    pass: ["'Tokyo' matches 'tokyo'", "'4' matches '  4  '"],
    fail: ["'Tokyo' ≠ 'Tokyo, Japan'", "'4' ≠ 'four'"]
  },
  cost: "Free",
  latency: "<1ms",
  useWhen: "Single-word answers, math problems, factual Q&A"
}
```

### Tooltip Component Design
```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <Badge variant="outline" className="cursor-help">
      {method}
    </Badge>
  </TooltipTrigger>
  <TooltipContent className="max-w-sm">
    <div className="space-y-2">
      <div className="font-semibold">{methodInfo.displayName}</div>
      <p className="text-xs">{methodInfo.description}</p>

      <div className="space-y-1">
        <p className="text-xs font-medium text-green-600">✓ Passes:</p>
        {methodInfo.examples.pass.map(ex => (
          <p className="text-xs text-muted-foreground ml-2">• {ex}</p>
        ))}
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-red-600">✗ Fails:</p>
        {methodInfo.examples.fail.map(ex => (
          <p className="text-xs text-muted-foreground ml-2">• {ex}</p>
        ))}
      </div>

      <div className="flex justify-between text-xs text-muted-foreground border-t pt-2">
        <span>Cost: {methodInfo.cost}</span>
        <span>Latency: {methodInfo.latency}</span>
      </div>
    </div>
  </TooltipContent>
</Tooltip>
```

---

## Architect Verdict

### ✅ **APPROVED Implementation**

**Recommendation**: Start with **4 core methods**
1. **exact_match** - Current "code" behavior (strict)
2. **contains** - Solves your verbose LLM problem (lenient)
3. **json_exact** - Structured data (common need)
4. **llm_judge** - Already exists

**Rationale**:
- Covers 90% of use cases
- Easy to understand and choose
- Can add more methods incrementally
- Backward compatible ("code" → "exact_match")

### 🔧 **Implementation Approach**

**Option A: Add New Methods, Keep "code"** (Recommended)
```python
# Evaluation engine
if method == "code" or method == "exact_match":
    return self.evaluate_exact_match(task, output)
elif method == "contains":
    return self.evaluate_contains(task, output)
elif method == "json_exact":
    return self.evaluate_json_exact(task, output)
```

**Pros**:
- Backward compatible (old tasks keep working)
- Gradual migration (update tasks over time)
- No breaking changes

**Option B: Deprecate "code"** (Not Recommended)
```python
# Force migration
if method == "code":
    warnings.warn("'code' is deprecated, use specific method")
    method = "exact_match"  # Auto-migrate
```

**Cons**:
- Breaking change (risky)
- Confusing for existing users
- More work upfront

### 📋 **Recommended Changes**

#### Backend Changes
```python
# app/schemas/task_schemas.py
evaluation_method: Literal[
    "exact_match",    # NEW: Explicit exact match
    "contains",       # NEW: Substring check
    "json_exact",     # NEW: JSON equality
    "llm_judge",      # Existing
    "hybrid",         # Existing
    "code",           # DEPRECATED: alias for exact_match
]

# app/services/evaluation_engine.py
METHOD_DESCRIPTIONS = {
    "exact_match": {
        "name": "Exact Match",
        "description": "Exact string match (case-insensitive, trimmed)",
        "cost": "Free",
        "latency": "<1ms",
        "examples_pass": ["'Tokyo' == 'tokyo'"],
        "examples_fail": ["'Tokyo' ≠ 'Tokyo, Japan'"],
    },
    # ... other methods
}

def evaluate_classification(self, task, output):
    method = task.evaluation_method

    # Map deprecated "code" to "exact_match"
    if method == "code":
        method = "exact_match"

    if method == "exact_match":
        return self._exact_match(task, output)
    elif method == "contains":
        return self._contains(task, output)
    # ... etc
```

#### Frontend Changes
```tsx
// lib/evaluation-methods.ts (NEW)
export const EVALUATION_METHODS = {
  exact_match: {
    displayName: "Exact Match",
    description: "Exact string match (case-insensitive, whitespace trimmed)",
    examplesPass: ["'Tokyo' matches 'tokyo'", "'4' matches '  4  '"],
    examplesFail: ["'Tokyo' ≠ 'Tokyo, Japan'"],
    cost: "Free",
    latency: "<1ms",
    useWhen: "Single-word answers, math, factual Q&A",
  },
  contains: {
    displayName: "Contains",
    description: "Check if output contains expected substring",
    examplesPass: ["'Tokyo' found in 'The capital is Tokyo'"],
    examplesFail: ["'Tokyo' not in 'Kyoto is the city'"],
    cost: "Free",
    latency: "<1ms",
    useWhen: "Keywords, facts in verbose responses",
  },
  // ... more methods
};

// components/ui/MethodBadgeWithTooltip.tsx (NEW)
export function MethodBadgeWithTooltip({ method }: { method: string }) {
  const info = EVALUATION_METHODS[method] || EVALUATION_METHODS.exact_match;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className="cursor-help">
          {method}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        {/* Show method details */}
      </TooltipContent>
    </Tooltip>
  );
}
```

---

## Final Recommendations

### Implement in This Order:

1. **Backend** (30 min):
   - Add `_exact_match`, `_contains`, `_json_exact` methods to evaluation engine
   - Update schema to accept new method names
   - Keep "code" as alias for "exact_match" (backward compatible)
   - Add METHOD_DESCRIPTIONS registry

2. **Frontend** (20 min):
   - Install shadcn tooltip component
   - Create `evaluation-methods.ts` with method descriptions
   - Create `MethodBadgeWithTooltip` component
   - Replace method badges in ViewTasksTab and EvaluateTab

3. **Testing** (10 min):
   - Create task with "contains" method
   - Run evaluation → verify passes
   - Hover over method badge → verify tooltip shows
   - Update unit tests

**Total**: ~1 hour

### Success Criteria:
- [ ] New methods work correctly in evaluation engine
- [ ] Tooltips show on hover in View Tasks table
- [ ] Tooltips show on hover in method filter dropdown
- [ ] Backward compatibility: old "code" tasks still work
- [ ] Your "Tokyo" task can be fixed by changing to "contains"

**Ready to implement?**
