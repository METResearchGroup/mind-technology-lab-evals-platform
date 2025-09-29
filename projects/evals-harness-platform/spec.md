# Evals Harness Platform - Technical Specification

## Project Overview

### Problem Statement
Lab researchers need a rapid, in-house evaluation platform to compare LLM performance across classification and generation tasks, with primary focus on detecting hallucinations and measuring accuracy. Current solutions are either too complex for rapid iteration or lack the specific evaluation methods needed for research workflows.

### Stakeholders
- **Primary Users**: Lab researchers (technical users)
- **Secondary Users**: Research team members for collaboration
- **Decision Makers**: Project leads needing performance overviews

### Success Criteria
- **Functional**: Users can add tasks, run evaluations, and analyze results within 5 minutes
- **Performance**: Platform handles 100+ tasks and 10+ models without performance degradation
- **Accuracy**: Evaluation results are reproducible and statistically meaningful
- **Usability**: Technical users can add new tasks and models without documentation

## Technical Requirements

### Core Functionality
1. **Task Management**: Add, view, and organize evaluation tasks
2. **Model Management**: Add and configure LLM providers via OpenRouter
3. **Evaluation Execution**: Run evaluations with real-time progress tracking
4. **Results Analysis**: Filter and compare results by tags, metrics, and time
5. **Error Analysis**: Categorize and track failure modes (hallucinations, accuracy)

### Evaluation Methods
- **Classification Tasks**: Accuracy, precision, recall, F1-score
- **Generation Tasks**: Hallucination detection, factual accuracy, coherence
- **Hybrid Evaluation**: Code assertions + LLM-as-judge for complex tasks

### Data Model (SQLite MVP)

Based on expert recommendations for MVP, here's the simplified schema:

```sql
-- Core evaluation tasks
CREATE TABLE eval_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_version VARCHAR(50) NOT NULL DEFAULT 'v1.0',
  name VARCHAR(255) NOT NULL,
  description TEXT,
  input TEXT NOT NULL,
  expected_output TEXT,
  ground_truth TEXT,
  task_type VARCHAR(50) NOT NULL CHECK (task_type IN ('classification', 'generation')),
  evaluation_method VARCHAR(50) NOT NULL CHECK (evaluation_method IN ('code', 'llm_judge', 'hybrid')),
  rubric TEXT, -- For LLM-as-judge evaluations
  tags TEXT, -- JSON array of tags: ["topic:research", "difficulty:hard"]
  project VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LLM models and configurations
CREATE TABLE models (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider VARCHAR(50) NOT NULL, -- 'openrouter'
  model_name VARCHAR(100) NOT NULL, -- 'gpt-4', 'claude-3-opus'
  prompt_version VARCHAR(50) NOT NULL DEFAULT 'v1.0',
  config TEXT, -- JSON: {"temperature": 0.7, "max_tokens": 1000}
  api_key_hash VARCHAR(255), -- Hashed API key for security
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Evaluation results
CREATE TABLE eval_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL REFERENCES eval_tasks(id),
  model_id INTEGER NOT NULL REFERENCES models(id),
  run_id VARCHAR(100) NOT NULL, -- Groups results from same evaluation run
  model_output TEXT NOT NULL,
  passed BOOLEAN,
  score REAL, -- 0.0 to 1.0
  metrics TEXT, -- JSON: {"accuracy": 0.95, "f1": 0.87}
  error_category VARCHAR(100), -- 'hallucination', 'accuracy', 'format'
  latency_ms INTEGER,
  cost_usd REAL,
  evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Evaluation runs for reproducibility
CREATE TABLE eval_runs (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  task_ids TEXT, -- JSON array of task IDs
  model_ids TEXT, -- JSON array of model IDs
  status VARCHAR(50) DEFAULT 'running', -- 'running', 'completed', 'failed'
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  total_tasks INTEGER,
  completed_tasks INTEGER DEFAULT 0,
  failed_tasks INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX idx_eval_results_task_model ON eval_results(task_id, model_id);
CREATE INDEX idx_eval_results_run_id ON eval_results(run_id);
CREATE INDEX idx_eval_tasks_type ON eval_tasks(task_type);
CREATE INDEX idx_eval_tasks_tags ON eval_tasks(tags);
```

### API Design

#### Backend API (FastAPI)
```python
# Core endpoints
GET    /api/tasks                    # List all tasks with filtering
POST   /api/tasks                    # Create new task
GET    /api/tasks/{id}               # Get specific task
PUT    /api/tasks/{id}               # Update task
DELETE /api/tasks/{id}               # Delete task

GET    /api/models                   # List all models
POST   /api/models                   # Add new model
GET    /api/models/{id}              # Get specific model
PUT    /api/models/{id}              # Update model

POST   /api/evaluate                 # Run evaluation
GET    /api/evaluate/{run_id}        # Get evaluation status
GET    /api/results                  # Get results with filtering
GET    /api/results/{run_id}         # Get results for specific run

GET    /api/analytics/performance    # Performance analytics
GET    /api/analytics/errors         # Error analysis
```

#### Frontend API Integration
```typescript
// API client with TypeScript interfaces
interface EvalTask {
  id: number;
  task_version: string;
  name: string;
  description?: string;
  input: string;
  expected_output?: string;
  ground_truth?: string;
  task_type: 'classification' | 'generation';
  evaluation_method: 'code' | 'llm_judge' | 'hybrid';
  rubric?: string;
  tags: string[];
  project?: string;
  created_at: string;
  updated_at: string;
}

interface Model {
  id: number;
  provider: string;
  model_name: string;
  prompt_version: string;
  config: Record<string, any>;
  created_at: string;
}

interface EvalResult {
  id: number;
  task_id: number;
  model_id: number;
  run_id: string;
  model_output: string;
  passed?: boolean;
  score?: number;
  metrics: Record<string, number>;
  error_category?: string;
  latency_ms: number;
  cost_usd: number;
  evaluated_at: string;
}
```

### User Interface Design

#### Tab Structure (Next.js SPA)
1. **Evaluate Tab**
   - Task selector (dropdown with search)
   - Model selector (multi-select)
   - Run button with progress indicator
   - Results display (side-by-side comparison)

2. **Add Task Tab**
   - Form with validation
   - Task type selection (classification/generation)
   - Evaluation method selection
   - Tags input (comma-separated)
   - Preview and save

3. **View Tasks Tab**
   - Data table with sorting/filtering
   - Columns: ID, Name, Type, Method, Tags, Created
   - Actions: Edit, Delete, Run Evaluation
   - Search and filter by tags/project

4. **Add Model Tab**
   - Provider selection (OpenRouter)
   - Model name input
   - Configuration (temperature, max_tokens)
   - API key input (secure storage)
   - Test connection button

5. **Review Performance Tab**
   - Filter by tags/project/time
   - Model comparison table
   - Metrics: Accuracy, F1, Hallucination Rate, Cost
   - Export to CSV functionality

#### UI Components (Tailwind CSS)
```typescript
// Key components
- TaskForm: Add/edit tasks with validation
- ModelForm: Add/edit models with API testing
- EvaluationRunner: Run evaluations with progress
- ResultsTable: Display results with filtering
- PerformanceDashboard: Analytics and comparisons
- ErrorAnalysis: Categorize and visualize failures
```

### Evaluation Implementation

#### Classification Tasks
```python
def evaluate_classification(task: EvalTask, model_output: str) -> EvalResult:
    if task.evaluation_method == 'code':
        # Exact match or regex pattern matching
        passed = model_output.strip().lower() == task.expected_output.strip().lower()
        score = 1.0 if passed else 0.0
    elif task.evaluation_method == 'llm_judge':
        # Use LLM-as-judge with validation
        judge_result = llm_judge_evaluate(task.input, model_output, task.rubric)
        passed = judge_result['passed']
        score = judge_result['score']
    
    return EvalResult(
        passed=passed,
        score=score,
        metrics={'accuracy': score},
        error_category='accuracy' if not passed else None
    )
```

#### Generation Tasks
```python
def evaluate_generation(task: EvalTask, model_output: str) -> EvalResult:
    # Hallucination detection
    hallucination_score = detect_hallucinations(task.input, model_output, task.ground_truth)
    
    # Factual accuracy
    accuracy_score = check_factual_accuracy(model_output, task.ground_truth)
    
    # Overall score
    overall_score = (hallucination_score + accuracy_score) / 2
    
    return EvalResult(
        passed=overall_score > 0.7,  # Threshold for passing
        score=overall_score,
        metrics={
            'hallucination_score': hallucination_score,
            'accuracy_score': accuracy_score,
            'overall_score': overall_score
        },
        error_category='hallucination' if hallucination_score < 0.7 else 'accuracy' if accuracy_score < 0.7 else None
    )
```

### Error Analysis Implementation

#### Hallucination Detection
```python
def detect_hallucinations(input_text: str, output: str, ground_truth: str) -> float:
    # Use LLM-as-judge to detect hallucinations (with validation)
    prompt = f"""
    Analyze if the following response contains hallucinations (made-up facts):
    
    Input: {input_text}
    Response: {output}
    Ground Truth: {ground_truth}
    
    Rate from 0.0 (completely hallucinated) to 1.0 (factually accurate).
    Focus on: factual claims, specific details, numerical data.
    
    Provide:
    1. Score: 0.0 to 1.0
    2. Reasoning: 1-2 sentences explaining why
    3. Confidence: HIGH, MEDIUM, or LOW
    
    Be strict. When in doubt, score lower.
    """
    
    result = llm_judge(prompt)
    
    # Validate judge reliability (expert recommendation)
    if result['confidence'] == 'LOW':
        # Flag for human review
        log_low_confidence_judgment(result)
    
    return float(result['score'])

# LLM-as-Judge Validation (Expert Requirement)
def validate_llm_judge_reliability():
    """
    Validate LLM judge against human agreement (>80% target)
    Run on 100 test cases, compare with human judgments
    """
    test_cases = load_validation_dataset(100)
    human_scores = get_human_judgments(test_cases)
    llm_scores = get_llm_judgments(test_cases)
    
    agreement_rate = calculate_agreement(human_scores, llm_scores)
    
    if agreement_rate < 0.8:
        raise ValueError(f"LLM judge reliability too low: {agreement_rate}")
    
    return agreement_rate
```

#### Error Categorization (Expert-Recommended Taxonomy)
```python
ERROR_CATEGORIES = {
    # Primary error types (from expert rubric)
    'hallucination': 'Model invented facts, features, or capabilities',
    'format_violation': 'Model broke expected output structure',
    'refusal_failure': 'Model refused to answer when it should have',
    'over_confidence': 'Model gave wrong answers with high confidence',
    'under_confidence': 'Model refused/hedged on questions it should know',
    'context_loss': 'Model forgot earlier parts of conversation',
    'instruction_following': 'Model ignored specific user instructions',
    
    # Secondary error types
    'accuracy': 'Model gave incorrect factual information', 
    'incomplete': 'Model gave partial or incomplete response',
    'off_topic': 'Model response was not relevant to the question',
    'bias': 'Model response showed demographic or other bias'
}

# Error severity scoring (expert framework)
def calculate_error_priority(frequency: int, severity: int, user_impact: int, difficulty: int) -> float:
    """
    Priority Score = (Frequency × Severity × User Impact) / Difficulty to Fix
    """
    return (frequency * severity * user_impact) / max(difficulty, 1)
```

### Technical Architecture

#### Backend Stack
- **Framework**: FastAPI (Python 3.10+)
- **Database**: SQLite with SQLAlchemy ORM
- **LLM Integration**: OpenRouter API client with retry logic
- **Validation**: Pydantic models
- **Authentication**: Simple API key system
- **Error Handling**: Exponential backoff, circuit breaker pattern
- **Cost Tracking**: Comprehensive API usage monitoring

#### Frontend Stack
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS v3
- **State Management**: React Query for API state
- **UI Components**: Headless UI + custom components
- **Forms**: React Hook Form with Zod validation

#### Development Environment
```bash
# Backend
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn sqlalchemy openai python-multipart

# Frontend  
npm create next-app@latest evals-frontend --typescript --tailwind
cd evals-frontend
npm install @tanstack/react-query react-hook-form @hookform/resolvers zod
```

### Deployment Strategy

#### MVP Deployment
- **Backend**: Local development server (uvicorn)
- **Frontend**: Next.js dev server
- **Database**: SQLite file (local)
- **Storage**: Local file system

#### Future Scaling
- **Database**: Migrate to PostgreSQL when needed
- **Deployment**: Railway or Vercel for cloud deployment
- **Caching**: Add Redis for model response caching
- **Monitoring**: Add logging and metrics collection

### Success Metrics

#### Functional Metrics
- **Task Creation**: <30 seconds to add new task
- **Evaluation Speed**: <10 seconds per task evaluation
- **Result Analysis**: <5 seconds to filter and display results
- **Error Detection**: >90% accuracy in hallucination detection

#### User Experience Metrics
- **Learning Curve**: <10 minutes to run first evaluation
- **Error Rate**: <5% failed evaluations due to platform issues
- **Reproducibility**: 100% reproducible results for same inputs

### Risk Mitigation

#### Technical Risks
- **API Rate Limits**: Implement exponential backoff and retry logic with circuit breaker
- **Cost Control**: Set spending limits, alerts, and daily/monthly budgets
- **Data Loss**: Regular SQLite backups with point-in-time recovery
- **Performance**: Monitor query performance, add indexes, plan for PostgreSQL migration
- **Provider Failures**: Graceful degradation and fallback strategies

#### Evaluation Risks
- **Bias**: Use diverse task examples, validate ground truth, track demographic bias
- **Reproducibility**: Version all prompts, configurations, and random seeds
- **LLM Judge Reliability**: Validate against human agreement (>80% target)
- **Statistical Significance**: Implement proper statistical testing for results
- **Ground Truth Quality**: Regular audits and inter-rater reliability checks

### Implementation Timeline

#### Week 1 (MVP)
- **Day 1-2**: Backend API and database setup
- **Day 3-4**: Frontend UI implementation
- **Day 5**: Integration and testing
- **Day 6-7**: Bug fixes and polish

#### Future Iterations
- **Week 2**: Error analysis features
- **Week 3**: Performance optimizations
- **Week 4**: Advanced analytics and reporting

This specification provides a clear roadmap for building an MVP evals harness platform that meets your immediate needs while following expert best practices for evaluation methodology and platform architecture.
