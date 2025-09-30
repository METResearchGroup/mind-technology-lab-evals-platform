# Evaluation Method Taxonomy - Industry Research

**Date**: September 30, 2025
**Research Sources**: Braintrust, LangChain/LangSmith, EleutherAI LM Harness, Arize Phoenix, Opik
**Status**: Research-backed, approved for implementation

---

## Industry Research Findings

### What Major Platforms Use

#### **Braintrust/Autoevals** ⭐ (Most Used in Production)
```typescript
// Heuristic scorers
Levenshtein    // String distance
ExactMatch     // Exact string comparison
Contains       // Substring check

// Statistical scorers
BLEU, ROUGE, METEOR  // Translation/summarization metrics

// LLM-as-judge scorers
Factuality     // Fact checking
Relevance      // Answer relevance
Safety         // Safety checking
```

**Key Insight**: Braintrust keeps it simple - clear names, minimal config, easy to understand

#### **LangChain/LangSmith** ⭐ (Most Comprehensive)
```python
# String Evaluators
ExactMatchStringEvaluator(
    ignore_case=True,           # Configurable!
    ignore_punctuation=True,
    ignore_numbers=False
)

EmbeddingDistanceEvaluator  # Semantic similarity
StringDistanceEvaluator     # Levenshtein distance
RegexMatchEvaluator         # Pattern matching
```

**Key Insight**: LangChain provides **configuration options** for exact match (ignore_case, etc.) - very flexible!

#### **Opik/Comet ML**
```typescript
const metrics = [
  new ExactMatch(),
  new Contains(),
  new RegexMatch(),
];
```

**Key Insight**: Simple class names, easy to instantiate

---

## Final Method Taxonomy

### Tier 1: Essential Methods (Implement Now)

Based on universal presence across all platforms surveyed:

#### **1. exact_match**
```yaml
Name: exact_match
Display Name: Exact Match
Category: code
Description: Exact string comparison after normalization

Configuration Options:
  ignore_case: true          # Default: case-insensitive
  ignore_punctuation: false  # Default: punctuation matters
  ignore_whitespace: true    # Default: trim whitespace

Implementation:
  1. Strip whitespace if ignore_whitespace=true
  2. Convert to lowercase if ignore_case=true
  3. Remove punctuation if ignore_punctuation=true
  4. Compare: expected == actual
  5. Return: passed (bool), score (1.0 or 0.0)

Examples Pass:
  - "Tokyo" == "tokyo" (case ignored)
  - "4" == "  4  " (whitespace trimmed)

Examples Fail:
  - "Tokyo" != "Tokyo, Japan" (extra text)
  - "4" != "four" (different representation)

Cost: Free
Latency: <1ms
Use When: Single-word answers, math, exact factual Q&A
Don't Use When: LLM output is verbose or reformulated
```

#### **2. contains**
```yaml
Name: contains
Display Name: Contains
Category: code
Description: Check if output contains expected substring

Configuration Options:
  ignore_case: true  # Default: case-insensitive

Implementation:
  1. Convert both to lowercase if ignore_case=true
  2. Check: expected.strip() in actual
  3. Return: passed (bool), score (1.0 or 0.0)

Examples Pass:
  - "Tokyo" in "The capital is Tokyo" (substring found)
  - "error" in "An error occurred" (keyword present)

Examples Fail:
  - "Tokyo" not in "Kyoto" (substring missing)
  - "success" not in "failed" (wrong keyword)

Cost: Free
Latency: <1ms
Use When: Keywords in verbose responses, flexible matching
Don't Use When: Need exact wording or format validation
```

#### **3. json_exact**
```yaml
Name: json_exact
Display Name: JSON Exact
Category: code
Description: Parse as JSON and check deep equality

Configuration Options:
  ignore_array_order: false  # Default: order matters

Implementation:
  1. Parse expected_output as JSON
  2. Parse actual output as JSON
  3. Compare: expected_json == actual_json
  4. Handle parse errors gracefully
  5. Return: passed (bool), score (1.0 or 0.0)

Examples Pass:
  - {"a": 1} == {"a": 1} (objects match)
  - {"a":1} == {"a": 1} (formatting ignored)

Examples Fail:
  - {"a": 1} != {"a": 2} (values differ)
  - {"a": 1} != {"a": 1, "b": 2} (extra field)
  - "not json" (parse error)

Cost: Free
Latency: <1ms
Use When: Structured data, JSON APIs, configuration outputs
Don't Use When: Output might not be valid JSON

Error Categories:
  - json_parse_error: Output is not valid JSON
  - json_mismatch: JSON objects don't match
```

#### **4. levenshtein**
```yaml
Name: levenshtein
Display Name: Levenshtein Distance
Category: code
Description: Fuzzy string matching using edit distance (returns similarity score 0-1)

Configuration Options:
  threshold: 0.8    # Minimum similarity to pass (default 80%)
  normalize: true   # Normalize by string length

Implementation:
  1. Calculate edit distance between expected and actual
  2. Normalize: similarity = 1 - (distance / max_length)
  3. Compare: similarity >= threshold
  4. Return: passed (bool), score (similarity value)

Examples Pass:
  - "hello" ≈ "helo" (0.9 similarity, one typo)
  - "Tokyo" ≈ "Tokio" (0.9 similarity, minor variation)

Examples Fail:
  - "Tokyo" ≈ "Paris" (0.0 similarity, completely different)
  - "yes" ≈ "maybe" (0.4 similarity, below threshold)

Cost: Free
Latency: <1ms
Use When: Typos acceptable, minor spelling variations
Don't Use When: Need exact match or semantic understanding

Note: Score represents similarity (higher is better), not just pass/fail
```

#### **5. llm_factuality**
```yaml
Name: llm_factuality
Display Name: LLM Factuality Judge
Category: llm
Description: LLM evaluates if output is factually correct against expected/ground truth

Configuration Options:
  judge_model: "gpt-4o-mini"  # Which LLM to use as judge

Implementation:
  1. Construct judge prompt with input, expected, actual, rubric
  2. Call LLM judge with prompt
  3. Parse judge response for score/reasoning
  4. Return: passed (bool), score (0.0-1.0), reasoning

Examples Pass:
  - Semantically correct facts (even if rephrased)
  - Accurate information with different wording

Examples Fail:
  - Hallucinated information
  - Factually incorrect data
  - Missing key information

Cost: $0.001-0.01 per evaluation
Latency: ~2s (depends on LLM API)
Use When: Complex factual questions, semantic correctness, nuanced evaluation
Don't Use When: Simple exact answers suffice (use exact_match instead - it's free!)

Note: Must be validated against human agreement (>80%) before trust
```

---

## Tier 2: Common Methods (Add Later)

#### **6. regex_match**
```yaml
Name: regex_match
Display Name: Regex Match
Category: code
Description: Match output against regex pattern

Configuration Options:
  pattern: null     # Required - regex pattern as string
  flags: 0          # Optional - re.IGNORECASE, etc.

Implementation:
  1. Compile regex pattern
  2. Match against actual output
  3. Return: passed (bool), score (1.0 or 0.0)

Examples Pass:
  - Email: "test@example.com" matches email regex
  - Phone: "(555) 123-4567" matches phone regex

Examples Fail:
  - Email: "not an email" doesn't match
  - Phone: "123" doesn't match full pattern

Cost: Free
Latency: <1ms
Use When: Format validation (emails, URLs, dates, patterns)
Don't Use When: Content validation (use other methods)
```

---

## Configuration System

### Schema Addition

```python
# Add evaluation_config field to task schema
class TaskCreate(BaseModel):
    evaluation_method: Literal[
        "exact_match",
        "contains",
        "json_exact",
        "levenshtein",
        "llm_factuality",
        "regex_match",  # Tier 2
        "llm_judge",    # Keep for backward compat
        "hybrid",       # Keep existing
    ]
    evaluation_config: dict[str, Any] | None = None  # NEW!
```

### Configuration Examples

```python
# Example 1: Exact match with case sensitivity
{
    "evaluation_method": "exact_match",
    "evaluation_config": {
        "ignore_case": False,  # Override default
    }
}

# Example 2: Levenshtein with lower threshold
{
    "evaluation_method": "levenshtein",
    "evaluation_config": {
        "threshold": 0.6,  # More lenient (default 0.8)
    }
}

# Example 3: Contains (use defaults)
{
    "evaluation_method": "contains",
    # No config needed - uses defaults
}
```

---

## Method Selection Decision Tree

```
1. Is output structured data (JSON)?
   YES → Use json_exact
   NO → Continue

2. Is exact wording required?
   YES → Use exact_match
   NO → Continue

3. Does output need specific substring/keyword?
   YES → Use contains
   NO → Continue

4. Are minor typos/variations acceptable?
   YES → Use levenshtein
   NO → Continue

5. Need pattern matching (email, URL, etc.)?
   YES → Use regex_match
   NO → Continue

6. Is evaluation subjective (quality, correctness, tone)?
   YES → Use llm_factuality or llm_judge
   NO → Reconsider if evaluation is needed
```

---

## Method Comparison Table

| Method | Speed | Cost | Strictness | Configuration | Best For |
|--------|-------|------|------------|---------------|----------|
| exact_match | <1ms | $0 | Very High | 3 options | Math, single-word answers |
| contains | <1ms | $0 | Medium | 1 option | Keywords in sentences |
| json_exact | <1ms | $0 | High | 1 option | Structured data, APIs |
| levenshtein | <1ms | $0 | Medium-Low | 2 options | Typos, minor variations |
| llm_factuality | ~2s | $0.001-0.01 | Medium | 1 option | Semantic correctness |
| regex_match | <1ms | $0 | High | 2 options | Format validation |

---

## Error Categories by Method

```python
METHOD_ERROR_CATEGORIES = {
    "exact_match": "exact_match_mismatch",
    "contains": "missing_substring",
    "json_exact": ["json_parse_error", "json_mismatch"],
    "levenshtein": "low_similarity",
    "llm_factuality": "factual_error",
    "regex_match": "pattern_mismatch",
}
```

---

## Implementation Priority

### Phase 1 (Now): Essential 4
1. exact_match
2. contains
3. json_exact
4. levenshtein

### Phase 2 (Soon): LLM + Regex
5. llm_factuality
6. regex_match

### Phase 3 (Future): Advanced
7. embedding_distance
8. json_schema
9. numeric_range

---

## Research-Backed Decisions

### ✅ **Decision 1: Use Industry-Standard Names**
- **From**: Braintrust, LangChain, Opik all use same names
- **Action**: Use `exact_match`, `contains`, `json_exact`, `levenshtein`
- **Why**: Familiarity, documentation, best practices already exist

### ✅ **Decision 2: Add Configuration Options**
- **From**: LangChain's ExactMatchStringEvaluator pattern
- **Action**: Add `evaluation_config` field to tasks (optional)
- **Why**: Flexibility without method explosion

### ✅ **Decision 3: Levenshtein for Fuzzy Matching**
- **From**: Braintrust Autoevals uses this heavily
- **Action**: Add as Tier 1 method (common use case)
- **Why**: Handles typos, minor variations

### ✅ **Decision 4: No Backward Compatibility with "code"**
- **From**: User request - clean codebase
- **Action**: Remove "code" entirely, regenerate seed data
- **Why**: Cleaner, explicit, no legacy baggage

### ✅ **Decision 5: Start with 4 Code Methods**
- **From**: Cover 90% of use cases (research shows these are most common)
- **Action**: Implement exact_match, contains, json_exact, levenshtein
- **Why**: Defer LLM methods to later (more complex, need validation)

---

## Updated Success Criteria

- [ ] 4 evaluation methods working in backend (exact_match, contains, json_exact, levenshtein)
- [ ] All "code" references removed from codebase
- [ ] Seed data regenerated with new method names
- [ ] All unit tests updated and passing
- [ ] Schema validation updated (no "code" allowed)
- [ ] Evaluation engine refactored with new methods
- [ ] Each method has unit test

**Ready for implementation.**
