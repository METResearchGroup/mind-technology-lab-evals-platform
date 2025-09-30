# Backend Navigation Guide

**Purpose**: Navigation guide for the FastAPI backend of the Evals Harness Platform.

**Last Updated**: September 30, 2025

---

## 📖 **Getting Started**

### **Documentation**
- [`README.md`](README.md) - Backend setup, API endpoints, development guide
- [`pyproject.toml`](pyproject.toml) - Python dependencies and tool configuration
- [`.env.example`](.env.example) - Environment variables template
- [`.gitignore`](.gitignore) - Git ignore rules for backend
- [`.pre-commit-config.yaml`](.pre-commit-config.yaml) - Pre-commit hooks configuration

### **Quick Commands**
```bash
# Setup
uv venv
source .venv/bin/activate
uv pip install -e ".[dev]"

# Run server
uvicorn app.main:app --reload

# Run tests
pytest tests/unit/ -v

# Seed database
python scripts/seed_data.py
```

---

## 📁 **Application Code** (`app/`)

### **Core Application**
- [`app/main.py`](app/main.py) - FastAPI application entry point, middleware, routers, startup/shutdown
- [`app/config.py`](app/config.py) - Configuration management with Pydantic Settings (API keys, CORS, DB URL)
- [`app/database.py`](app/database.py) - SQLAlchemy engine, session management, database initialization

### **API Routes** (`app/api/`)
REST API endpoints organized by resource:

- [`app/api/tasks.py`](app/api/tasks.py) - Evaluation task CRUD (`GET/POST/PUT/DELETE /api/tasks`)
- [`app/api/models.py`](app/api/models.py) - Model configuration CRUD (`GET/POST/PUT/DELETE /api/models`)
- [`app/api/evaluations.py`](app/api/evaluations.py) - Evaluation execution (`POST /api/evaluate`)
- [`app/api/results.py`](app/api/results.py) - Results retrieval and filtering (`GET /api/results`)

### **Database Models** (`app/models/`)
SQLAlchemy ORM models:

- [`app/models/eval_tasks.py`](app/models/eval_tasks.py) - `EvalTask` model (tasks table)
- [`app/models/models.py`](app/models/models.py) - `Model` model (models table)
- [`app/models/eval_results.py`](app/models/eval_results.py) - `EvalResult` model (eval_results table)
- [`app/models/eval_runs.py`](app/models/eval_runs.py) - `EvalRun` model (eval_runs table)
- [`app/models/__init__.py`](app/models/__init__.py) - Model exports

### **Pydantic Schemas** (`app/schemas/`)
Request/response validation schemas:

- [`app/schemas/task_schemas.py`](app/schemas/task_schemas.py) - `TaskCreate`, `TaskUpdate`, `TaskResponse`
- [`app/schemas/model_schemas.py`](app/schemas/model_schemas.py) - `ModelCreate`, `ModelUpdate`, `ModelResponse`
- [`app/schemas/result_schemas.py`](app/schemas/result_schemas.py) - `EvalResultResponse`, `EvaluationRequest`, `RunStatusResponse`
- [`app/schemas/__init__.py`](app/schemas/__init__.py) - Schema exports

### **Business Logic** (`app/services/`)
Core business logic and external integrations:

- [`app/services/openrouter_client.py`](app/services/openrouter_client.py) - OpenRouter API client
  - Circuit breaker pattern with thread-safe state
  - Exponential backoff retry logic (5 retries)
  - Real-time cost tracking
  - Rate limit handling
- [`app/services/evaluation_engine.py`](app/services/evaluation_engine.py) - Evaluation logic
  - Classification evaluation (exact match, LLM-as-judge, hybrid)
  - Generation evaluation (placeholder for ticket 5)
  - Error categorization
- [`app/services/__init__.py`](app/services/__init__.py) - Service exports

### **Utilities** (`app/utils/`)
Shared utilities and helpers:

- [`app/utils/pricing.py`](app/utils/pricing.py) - Model-specific pricing for 30+ models
  - Latest 2024/2025 models (GPT-4o, Claude 3.5, Gemini Flash)
  - Per-token cost calculation (accurate to 6 decimal places)
  - Fallback pricing for unknown models
- [`app/utils/exceptions.py`](app/utils/exceptions.py) - Custom exception classes
  - `TaskNotFoundError`, `ModelNotFoundError`, `RunNotFoundError`
  - `ValidationError`
- [`app/utils/logging.py`](app/utils/logging.py) - Logging configuration
  - Structured logging with timestamps
  - Console output handler
- [`app/utils/__init__.py`](app/utils/__init__.py) - Utility exports

### **Middleware** (`app/middleware/`)
Custom FastAPI middleware:

- [`app/middleware/error_handling.py`](app/middleware/error_handling.py) - Global error handling
  - Catches all exceptions and returns JSON responses
  - Custom handlers for NotFoundErrors, RateLimitError, APIError
  - Logging for all errors
- [`app/middleware/__init__.py`](app/middleware/__init__.py) - Middleware exports

---

## 🧪 **Testing** (`tests/`)

### **Test Configuration**
- [`tests/conftest.py`](tests/conftest.py) - Pytest fixtures and test database setup
  - In-memory SQLite database for tests
  - FastAPI TestClient configuration
  - Database lifecycle management
- [`tests/__init__.py`](tests/__init__.py) - Test package marker

### **Unit Tests** (`tests/unit/`)
Comprehensive unit test coverage (40 tests, 70% coverage):

- [`tests/unit/test_api_endpoints.py`](tests/unit/test_api_endpoints.py) - API endpoint tests (CRUD operations)
- [`tests/unit/test_database_models.py`](tests/unit/test_database_models.py) - ORM model tests (8 tests, 95% coverage)
- [`tests/unit/test_evaluation_engine.py`](tests/unit/test_evaluation_engine.py) - Basic evaluation engine tests
- [`tests/unit/test_evaluation_engine_comprehensive.py`](tests/unit/test_evaluation_engine_comprehensive.py) - Comprehensive evaluation tests (12 tests)
  - Classification exact match (success/failure/case-insensitive/whitespace)
  - LLM-as-judge placeholder tests
  - Hybrid evaluation logic
  - Generation task evaluation
  - Error handling (invalid task type/method)
- [`tests/unit/test_openrouter_client.py`](tests/unit/test_openrouter_client.py) - OpenRouter client tests (7 tests, 88% coverage)
  - Client initialization
  - Successful generation
  - Configuration passing
  - Rate limit retry logic
  - Circuit breaker behavior
  - API error handling
- [`tests/unit/test_pricing.py`](tests/unit/test_pricing.py) - Pricing utility tests (11 tests, 100% coverage)
  - Model pricing lookup
  - Cost calculation accuracy
  - Latest models verification
  - Edge cases (zero tokens, unknown models)
- [`tests/unit/test_middleware.py`](tests/unit/test_middleware.py) - Middleware error handling tests (7 tests, 82% coverage)
  - Success response passthrough
  - NotFoundError handling
  - Generic exception handling
- [`tests/unit/__init__.py`](tests/unit/__init__.py) - Unit tests package marker

### **Integration Tests** (`tests/integration/`)
- Directory created for future integration tests
- Will include API + database integration tests

### **Performance Tests** (`tests/performance/`)
- Directory created for future performance tests
- Will include load testing and response time validation

### **Security Tests** (`tests/security/`)
- Directory created for future security tests
- Will include authentication and rate limiting tests

---

## 🔧 **Scripts** (`scripts/`)

- [`scripts/seed_data.py`](scripts/seed_data.py) - Database seeding script
  - 8 diverse evaluation tasks (classification, generation, safety, reasoning)
  - 5 latest model configurations (GPT-4o, Claude 3.5, Gemini Flash)
  - Idempotent (checks for existing data before seeding)
  - Usage: `python scripts/seed_data.py`

---

## 🏗️ **Architecture Overview**

### **Request Flow**
```
Client Request
  ↓
FastAPI App (main.py)
  ↓
CORS Middleware
  ↓
Error Handling Middleware
  ↓
API Router (api/*.py)
  ↓
Pydantic Validation (schemas/*.py)
  ↓
Business Logic (services/*.py)
  ↓
Database Access (models/*.py)
  ↓
SQLAlchemy ORM
  ↓
SQLite Database
```

### **Key Design Patterns**
- **Dependency Injection**: Database sessions via FastAPI `Depends()`
- **Circuit Breaker**: Thread-safe circuit breaker in OpenRouter client
- **Retry Logic**: Exponential backoff with 5 retries
- **Error Handling**: Centralized middleware with custom exceptions
- **Cost Tracking**: Per-request cost calculation with model-specific pricing

---

## 📊 **Module Responsibilities**

### **API Layer** (`app/api/`)
- HTTP request handling
- Input validation (Pydantic)
- Response serialization
- Error responses

### **Service Layer** (`app/services/`)
- Business logic implementation
- External API integration (OpenRouter)
- Evaluation algorithms
- No direct database access (receives sessions from API layer)

### **Data Layer** (`app/models/`)
- Database schema definition
- ORM mappings
- Relationships and constraints
- No business logic

### **Schema Layer** (`app/schemas/`)
- Request/response validation
- Type coercion and conversion
- JSON serialization (via `from_orm` methods)
- Documentation (via Field descriptions)

### **Utils Layer** (`app/utils/`)
- Shared utilities (pricing, logging, exceptions)
- No dependencies on other app modules
- Pure functions where possible

---

## 🔍 **Common Search Patterns**

**"Where do I add a new API endpoint?"**
→ Create route in appropriate `app/api/*.py`, add to router, import in `app/main.py`

**"Where do I add a new database table?"**
→ Create model in `app/models/*.py`, create schema in `app/schemas/*.py`, import in `__init__.py` files

**"Where do I add a new evaluation method?"**
→ Extend `app/services/evaluation_engine.py` with new method in `EvaluationEngine` class

**"Where do I add model pricing?"**
→ Update `MODEL_PRICING` dictionary in `app/utils/pricing.py`

**"Where do I add a new external API integration?"**
→ Create new service in `app/services/` following pattern from `openrouter_client.py`

**"Where are the tests?"**
→ `tests/unit/` for unit tests (mirroring `app/` structure)

**"How do I run the API locally?"**
→ See [`README.md`](README.md) setup section

---

## 🎯 **Current Status & Coverage**

### **Test Coverage** (as of September 30, 2025)
- **Overall**: 70%
- **Pricing module**: 100%
- **Evaluation engine**: 89%
- **OpenRouter client**: 88%
- **Middleware**: 82%

### **Known Issues**
- API endpoint integration tests need database fixture fixes
- LLM-as-judge is placeholder (full implementation in ticket 5)

### **Ready for**
- ✅ Frontend integration
- ✅ Railway deployment
- ✅ Basic evaluation execution
- 📋 Advanced error analysis (ticket 5)

---

## 📝 **Development Workflow**

### **Adding a New Feature**
1. Update models (`app/models/`)
2. Create schemas (`app/schemas/`)
3. Implement business logic (`app/services/`)
4. Create API endpoints (`app/api/`)
5. Write tests (`tests/unit/`)
6. Update documentation

### **Making Changes**
1. Create feature branch
2. Make changes
3. Run tests: `pytest tests/unit/ -v`
4. Run linting: `ruff check . --fix`
5. Commit (pre-commit hooks run automatically)
6. Push and create PR

### **Quality Checks**
- Pre-commit hooks enforce: ruff, ruff-format, trailing-whitespace, end-of-file-fixer
- CI/CD: Tests must pass before merge
- Coverage: Must maintain ≥65% (target 90% for production)

---

## 🔗 **Related Documentation**

- **Project Spec**: [`../projects/evals-harness-platform/spec.md`](../projects/evals-harness-platform/spec.md)
- **Ticket 3**: [`../projects/evals-harness-platform/tickets/ticket-003-fastapi-backend.md`](../projects/evals-harness-platform/tickets/ticket-003-fastapi-backend.md)
- **Technical Backlog**: [`../BACKLOG.md`](../BACKLOG.md)
- **Root Router**: [`../ROUTER.md`](../ROUTER.md)
