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

4. **Seed the database with dummy data (optional):**
```bash
python scripts/seed_data.py
```

This will populate the database with:
- 8 evaluation tasks (classification, generation, safety tests)
- 4 model configurations (GPT-3.5, GPT-4, Claude Opus, Claude Sonnet)

5. **Run the server:**
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

## Important Notes

### Cost Tracking Limitation
⚠️ **IMPORTANT**: The current cost tracking implementation uses placeholder pricing rates and is NOT accurate for budget tracking. Cost calculations are rough estimates only.

**Current implementation**: Flat rates ($0.01/1k prompt tokens, $0.03/1k completion tokens)
**Real pricing**: Varies by model (GPT-4: ~$0.03/1k, GPT-3.5: ~$0.002/1k, etc.)

**TODO**: Implement model-specific pricing from OpenRouter API for accurate cost tracking (see `app/services/openrouter_client.py:162-166`)

### Ground Truth Validation

All evaluation tasks require validated ground truth for meaningful results. Follow this process:

**Ground Truth Sources (in order of reliability)**:
1. **Verified Facts**: Checkable against authoritative source (databases, documentation)
2. **Domain Expert Judgment**: Expert in the field validates the answer
3. **Consensus Human Judgment**: 3+ humans agree on the label (track inter-rater agreement)
4. **User Feedback**: Real user indicated if output was good
5. **Procedural Checks**: Output follows required procedure (code compiles, tests pass)

**When Creating Eval Tasks**:
1. Document the ground truth source in the `description` field
2. For subjective evaluations, use LLM-as-judge with human validation (>80% agreement)
3. Version your eval datasets (`task_version` field) when ground truth changes
4. Never modify existing ground truth - create new version instead

**Validation Requirements for LLM-as-Judge** (Ticket 5):
- Use a DIFFERENT model as judge than the one being evaluated
- Validate judge against 100+ human judgments
- Target: >80% agreement between judge and humans
- Track confidence levels and flag low-confidence judgments for human review

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
