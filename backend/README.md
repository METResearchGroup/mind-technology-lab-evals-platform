# Evals Harness Platform - Backend

FastAPI backend for the LLM evaluation platform with SQLite database and OpenRouter integration.

## Setup

1. **Create virtual environment:**
```bash
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

2. **Install dependencies:**
```bash
uv pip install -e ".[dev]"
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env and add your OpenRouter API key
```

4. **Run the server:**
```bash
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000
API documentation at http://localhost:8000/docs

## Development

**Run tests:**
```bash
pytest
```

**Run tests with coverage:**
```bash
pytest --cov=app --cov-report=html
```

**Linting:**
```bash
ruff check .
```

**Type checking:**
```bash
mypy app
```

**Pre-commit hooks:**
```bash
pre-commit install
pre-commit run --all-files
```

## API Endpoints

- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/{id}` - Get specific task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `GET /api/models` - List all models
- `POST /api/models` - Add new model
- `POST /api/evaluate` - Run evaluation
- `GET /api/results` - Get results with filtering

## Project Structure

```
backend/
├── app/
│   ├── models/         # SQLAlchemy ORM models
│   ├── schemas/        # Pydantic validation schemas
│   ├── api/            # API route handlers
│   ├── services/       # Business logic
│   ├── utils/          # Utilities
│   └── middleware/     # Middleware
├── tests/              # Test suite
└── migrations/         # Database migrations
```
