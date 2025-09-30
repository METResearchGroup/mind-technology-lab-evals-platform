# Evals Platform - Technical Backlog

This file tracks technical debt, optimizations, and improvements to implement after MVP launch.

Last updated: September 30, 2025

---

## **🔴 HIGH PRIORITY** (Post-MVP, Pre-Production)

### **Database Performance**
**When**: Before deploying with >1000 tasks or >100 concurrent users

- [ ] Add database indexes on frequently queried columns
  - `eval_results(run_id, task_id, model_id, evaluated_at DESC)`
  - `eval_runs(status, started_at)`
  - `eval_tasks(project, task_type)`
  - **Impact**: 10-100x faster filtered queries at scale
  - **Effort**: 1 hour (migration + testing)
  - **Reference**: CodeRabbit PR#3 comment on `backend/app/api/results.py`

- [ ] Add check constraints and indexes to `eval_runs` table
  - Constraint: `status IN ('running', 'completed', 'failed')`
  - Index on `status` and `started_at`
  - **Impact**: Data integrity + query performance
  - **Effort**: 30 minutes
  - **Reference**: CodeRabbit PR#3 comment on `backend/app/models/eval_runs.py`

### **Production Database Migration**

- [ ] Migrate from SQLite to PostgreSQL
  - **Why**: SQLite doesn't handle concurrent writes well
  - **When**: When you see "database is locked" errors or need >5 concurrent users
  - **Effort**: 2-3 hours (connection pooling, testing, migration)
  - **Add**: Connection pooling configuration (`pool_pre_ping`, `pool_size`, `max_overflow`)
  - **Reference**: CodeRabbit PR#3 comment on `backend/app/database.py`

### **Error Handling Improvements**

- [ ] Add structured error details to custom exceptions
  - Add entity IDs and context to `TaskNotFoundError`, `ModelNotFoundError`, `RunNotFoundError`
  - **Impact**: Better debugging and error tracking
  - **Effort**: 1 hour
  - **Reference**: CodeRabbit PR#3 comment on `backend/app/utils/exceptions.py`

- [ ] Add database connection error handling in `get_db()`
  - Wrap session creation in try-except
  - Provide clear error messages
  - **Impact**: Better error messages on connection failures
  - **Effort**: 30 minutes
  - **Reference**: CodeRabbit PR#3 comment on `backend/app/database.py`

- [ ] Add explicit SQLAlchemy error handler to middleware
  - Return `"database_error"` instead of `"internal_error"`
  - **Impact**: Better observability
  - **Effort**: 15 minutes
  - **Reference**: CodeRabbit PR#3 comment on `backend/tests/unit/test_middleware.py`

### **Security Hardening**

- [ ] Gate OpenAPI docs behind debug flag
  - Only expose `/docs`, `/redoc`, `/openapi.json` when `DEBUG=true`
  - **Impact**: Reduced attack surface in production
  - **Effort**: 5 minutes
  - **Reference**: CodeRabbit PR#3 comment on `backend/app/main.py`

- [ ] Tighten CORS configuration
  - Change `allow_methods=["*"]` to explicit list: `["GET", "POST", "PUT", "DELETE"]`
  - Change `allow_headers=["*"]` to explicit list
  - **Impact**: Reduced security risk
  - **Effort**: 10 minutes
  - **Reference**: CodeRabbit PR#3 comment on `backend/app/main.py`

---

## **🟡 MEDIUM PRIORITY** (Performance & Quality)

### **Code Modernization**

- [ ] Migrate to FastAPI lifespan context manager
  - Replace deprecated `@app.on_event("startup")` with `lifespan` context
  - **Why**: Avoids deprecation warnings
  - **Effort**: 15 minutes
  - **Reference**: CodeRabbit PR#3 comment on `backend/app/main.py`

- [ ] Adopt SQLAlchemy 2.0 query style
  - Use `select()` instead of `session.query()`
  - Better type hints and IDE support
  - **Impact**: Cleaner code, better typing
  - **Effort**: 2 hours (refactor all queries + testing)
  - **Reference**: CodeRabbit PR#3 comments on `backend/app/api/results.py`, `backend/app/api/models.py`

- [ ] Migrate from JSON Text columns to SQLAlchemy JSON type
  - Convert `tags`, `config`, `metrics` columns to use JSON type
  - **Impact**: Automatic serialization, cleaner code
  - **Effort**: 2-3 hours (migration + schema refactor + testing)
  - **Reference**: CodeRabbit PR#3 comment on `backend/app/models/eval_tasks.py`

### **API Improvements**

- [ ] Add pagination support to results endpoint
  - Add `offset` parameter to `/api/results`
  - **Impact**: Better handling of large result sets
  - **Effort**: 30 minutes
  - **Reference**: CodeRabbit PR#3 comment on `backend/app/api/results.py`

- [ ] Commit evaluation results incrementally
  - Commit each result instead of batching all at end
  - Update run progress in real-time
  - **Impact**: Prevents data loss on crashes, enables progress tracking
  - **Effort**: 1 hour
  - **Reference**: CodeRabbit PR#3 comment on `backend/app/api/evaluations.py`

### **OpenRouter Client Optimizations**

- [ ] Reuse httpx.Client instance instead of per-call construction
  - Create persistent client, close on app shutdown
  - **Impact**: Reduced connection overhead, lower tail latency
  - **Effort**: 1 hour
  - **Reference**: CodeRabbit PR#3 comment on `backend/app/services/openrouter_client.py`

- [ ] Add async variant of OpenRouter client
  - Use `httpx.AsyncClient` and `asyncio.sleep`
  - **Why**: Avoids blocking event loop in async endpoints
  - **Effort**: 2-3 hours (new async methods + testing)
  - **Reference**: CodeRabbit PR#3 comment on `backend/app/services/openrouter_client.py`

- [ ] Add jitter to exponential backoff
  - Use `random.uniform(base * 0.8, base * 1.2)`
  - **Impact**: Reduces thundering herd on retry storms
  - **Effort**: 10 minutes
  - **Reference**: CodeRabbit PR#3 comment on `backend/app/services/openrouter_client.py`

- [ ] Extend retry policy to 5xx errors
  - Retry transient 500, 502, 503 errors like 429s
  - **Impact**: Better resilience to upstream outages
  - **Effort**: 30 minutes
  - **Reference**: CodeRabbit PR#3 comment on `backend/app/services/openrouter_client.py`

### **Testing Improvements**

- [ ] Add negative validation test cases
  - Invalid `task_type` / `evaluation_method` (should fail CheckConstraint)
  - Missing required fields
  - Boundary conditions (very long strings, special characters)
  - **Impact**: Better validation coverage
  - **Effort**: 1 hour
  - **Reference**: CodeRabbit PR#3 comment on `backend/tests/unit/test_api_endpoints.py`

- [ ] Make OpenRouter client init test hermetic
  - Mock settings instead of relying on env vars
  - **Impact**: Tests work in any environment
  - **Effort**: 10 minutes
  - **Reference**: CodeRabbit PR#3 comment on `backend/tests/unit/test_openrouter_client.py`

- [ ] Add test for circuit breaker reset on success
  - Verify `_consecutive_failures` goes to 0 after successful call
  - **Impact**: Prevents unexpected circuit breaker trips
  - **Effort**: 15 minutes
  - **Reference**: CodeRabbit PR#3 comment on `backend/tests/unit/test_openrouter_client.py`

- [ ] Mock `time.sleep` in retry tests
  - Prevents slow tests, validates backoff timing
  - **Impact**: Faster test suite
  - **Effort**: 15 minutes
  - **Reference**: CodeRabbit PR#3 comment on `backend/tests/unit/test_openrouter_client.py`

- [ ] Add tests for OpenRouter attribution headers
  - Verify `Referer` and `X-Title` headers are sent
  - **Impact**: Ensures analytics work correctly
  - **Effort**: 10 minutes
  - **Reference**: CodeRabbit PR#3 comment on `backend/tests/unit/test_openrouter_client.py`

- [ ] Add middleware tests for OpenRouter error types
  - Test `RateLimitError`, `APIError`, `OpenRouterError` handling
  - **Impact**: Complete middleware coverage
  - **Effort**: 30 minutes
  - **Reference**: CodeRabbit PR#3 comment on `backend/tests/unit/test_middleware.py`

### **Code Quality**

- [ ] Make logging setup idempotent
  - Add `force=reconfigure` parameter to `basicConfig`
  - **Why**: Logging setup can fail under Uvicorn/tests
  - **Effort**: 5 minutes
  - **Reference**: CodeRabbit PR#3 comment on `backend/app/utils/logging.py`

- [ ] Simplify schema field types
  - Make `config` non-optional in `ModelCreate` (always has default_factory)
  - **Impact**: Cleaner type hints, fewer None checks
  - **Effort**: 15 minutes
  - **Reference**: CodeRabbit PR#3 comment on `backend/app/schemas/model_schemas.py`

---

## **🔵 LOW PRIORITY** (Nice-to-Haves)

### **Documentation**

- [ ] Convert bare URLs to Markdown links in README
  - Satisfies markdownlint MD034
  - **Effort**: 2 minutes
  - **Reference**: CodeRabbit PR#3 comment on `backend/README.md`

- [ ] Add language specifier to code fence blocks
  - Add `text` to project structure fence
  - **Effort**: 1 minute
  - **Reference**: CodeRabbit PR#3 comment on `backend/README.md`

- [ ] Clarify "Ticket 5" reference in README
  - Link to actual Linear issue (MET-59)
  - **Effort**: 2 minutes
  - **Reference**: CodeRabbit PR#3 comment on `backend/README.md`

### **Dependency Management**

- [ ] Bump dependencies to latest stable versions
  - Only if you need new features or critical security patches
  - **Risk**: Breaking changes, compatibility issues
  - **When**: During scheduled maintenance windows
  - **Reference**: CodeRabbit PR#3 comment on `backend/pyproject.toml`

- [ ] Update pre-commit hook versions
  - ruff-pre-commit: v0.7.4 → v0.13.2
  - pre-commit-hooks: v5.0.0 → v6.0.0
  - **When**: During scheduled maintenance
  - **Reference**: CodeRabbit PR#3 comment on `backend/.pre-commit-config.yaml`

### **Code Cleanup**

- [ ] Remove duplicate `.pytest_cache/` entry in .gitignore
  - Listed at lines 39 and 60
  - **Effort**: 10 seconds
  - **Reference**: CodeRabbit PR#3 comment on `backend/.gitignore`

- [ ] Remove unreachable "Max retries exceeded" code
  - Line 121 in openrouter_client.py is unreachable
  - **Impact**: None (dead code)
  - **Effort**: 10 seconds
  - **Reference**: CodeRabbit PR#3 comment on `backend/app/services/openrouter_client.py`

- [ ] Fix docstring in OpenRouter client
  - Says "text" but returns "content"
  - **Effort**: 10 seconds
  - **Reference**: CodeRabbit PR#3 comment on `backend/app/services/openrouter_client.py`

### **Test Data Quality**

- [ ] Assert JSON semantics instead of string equality
  - In `test_database_models.py`, compare parsed JSON instead of serialized strings
  - **Impact**: More robust tests
  - **Effort**: 15 minutes
  - **Reference**: CodeRabbit PR#3 comments on `backend/tests/unit/test_database_models.py`

---

## **🚫 REJECTED** (Not Doing)

These suggestions from CodeRabbit are being explicitly rejected:

### **Externalize pricing to JSON/YAML file**
- **Reason**: Adds unnecessary complexity for 30 entries that change quarterly
- **Trade-off**: Code changes for pricing updates are fine; simpler than file parsing + validation
- **Maintenance**: Current approach is clear and type-safe
- **Decision**: Keep pricing in Python code

### **BaseHTTPMiddleware concerns**
- **Reason**: We're not using streaming responses
- **When to revisit**: If we add SSE or streaming endpoints
- **Decision**: Current middleware is fine for our use case

### **Seed script path manipulation alternatives**
- **Reason**: `sys.path.insert` works perfectly for one-off scripts
- **Alternative suggested**: Package installation, PYTHONPATH
- **Trade-off**: Added complexity for zero benefit
- **Decision**: Keep current approach - it's pragmatic and works

---

## **📊 Coverage Improvement Roadmap**

Current: 70% overall coverage
Target: 90% for production

### **To reach 80% coverage** (2-3 hours):
1. Fix API endpoint integration tests (database fixture issues)
2. Add middleware tests for OpenRouter errors
3. Add negative validation tests

### **To reach 90% coverage** (4-5 hours):
1. Add integration tests (database + API together)
2. Add error handling path coverage
3. Add edge case tests

---

## **🔄 Future Architecture Considerations**

### **Phase 3: Scalability** (When you have >100 users)
- Async evaluation engine
- Background task queue (Celery/RQ)
- Redis caching layer
- PostgreSQL connection pooling
- Load balancing

### **Phase 4: Enterprise Features** (When you have paying customers)
- Multi-tenancy and user authentication
- Fine-grained RBAC permissions
- Audit logging
- Data export/import
- Advanced analytics

---

## **📝 Notes on Backlog Management**

### **How to Use This File**:
1. Review quarterly or when performance issues arise
2. Prioritize based on actual user pain points, not theoretical improvements
3. Measure before optimizing (use profiling tools)
4. Re-evaluate rejected items if requirements change

### **Principles**:
- **YAGNI**: Only implement when you actually need it
- **Measure First**: Profile before optimizing
- **User Value**: Prioritize features over refactoring
- **Technical Debt**: Pay it down when it hurts, not preemptively

### **Anti-Patterns to Avoid**:
- Don't bump dependencies "just because" - test first, have a reason
- Don't add indexes until queries are actually slow
- Don't refactor working code without measuring improvement
- Don't externalize simple data structures that don't change often
