# Evals Harness Platform - Brain Dump

## Project Overview
Building an in-house LLM evaluation harness platform for lab research to quickly evaluate and iterate across different LLM providers for specific use cases.

## Core Requirements & Vision

### Primary Purpose
- Enable rapid evaluation and comparison of different LLM providers
- Support lab research workflows for testing LLM performance on specific tasks
- Provide quick iteration capabilities for prompt engineering and model selection

### Key Use Cases
1. **Model Comparison**: "Which LLM performs best on our specific tasks?"
2. **Task Management**: Add, review, and organize evaluation tasks
3. **Performance Analysis**: Slice and dice results by tags, projects, metrics
4. **Rapid Testing**: Quick evaluation of new prompts/models on existing tasks

### User Personas
- **Lab Researchers**: Need to quickly test hypotheses about LLM performance
- **Research Team**: Collaborative evaluation and knowledge sharing
- **Project Leads**: Need overview of model performance across different projects

## Technical Requirements

### Frontend (UI)
- **Framework**: TypeScript + Next.js
- **Interface**: Single-page application with tabbed navigation
- **Key Tabs**:
  1. **Evaluate**: Pick task + model → Run → See results
  2. **Add Task**: Form to create new evaluation tasks
  3. **View Tasks**: Tabular database view of all tasks
  4. **Add Model**: Form to add new LLM providers (OpenRouter integration)
  5. **Review Performance**: Filtered performance analysis by tags/projects

### Data Model Considerations

#### Current Proposed Schema
```
Tasks:
- Task ID (UUID)
- Task iteration/version
- Task name
- Task description
- Ground truth label
- Label type (classification|extraction|generation)
- Rubric for LLM judge
- Metrics (tags for evaluation types)
- Date added
- Tags (topic:hard, difficulty:easy, etc.)
- Project tags
- Added by (user tracking)

Models:
- Model ID
- Provider (OpenRouter)
- Model name
- Configuration
- Cost tracking

Results:
- Result ID
- Task ID
- Model ID
- Model output
- Evaluation scores
- Timestamp
- Cost
```

#### Questions About Data Model
1. **Task Versioning**: How do we handle task evolution? Do we need full versioning or just iteration tracking?
2. **Ground Truth**: For subjective tasks, how do we handle multiple valid answers?
3. **Evaluation Methods**: Should we support both automated and human evaluation?
4. **Metrics**: How flexible should the metrics system be? Predefined vs. custom metrics?
5. **Caching**: Do we cache model responses to avoid re-running expensive evaluations?

### LLM Provider Integration
- **Primary**: OpenRouter (unified API for multiple providers)
- **Requirements**: Rate limiting, cost tracking, error handling
- **Fallback**: Direct provider APIs if needed

### Evaluation Methods
- **Automated**: Code-based assertions, regex matching
- **LLM-as-Judge**: For subjective evaluation (with validation)
- **Hybrid**: Combination of methods

## Technical Architecture Questions

### Backend Architecture
1. **Database**: PostgreSQL vs. SQLite for initial version?
2. **API**: REST vs. GraphQL for data fetching?
3. **Caching**: Redis for model response caching?
4. **Deployment**: Local development vs. cloud deployment?

### Performance Requirements
1. **Evaluation Speed**: How fast should evaluations run?
2. **Concurrent Evaluations**: How many parallel evaluations?
3. **Data Volume**: Expected number of tasks/models/results?

### Integration Points
1. **OpenRouter API**: Rate limits, authentication, error handling
2. **File Storage**: Where to store evaluation datasets?
3. **Export/Import**: CSV, JSON export capabilities?

## Design Decisions Needed

### UI/UX Questions
1. **Evaluation Flow**: Should evaluation be synchronous or asynchronous?
2. **Results Display**: How to show evaluation results? Side-by-side comparison?
3. **Filtering**: How complex should the filtering system be?
4. **Visualization**: Do we need charts/graphs or is tabular data sufficient?

### Data Management
1. **Task Import**: Should we support bulk import of tasks?
2. **Data Validation**: How strict should input validation be?
3. **Backup/Export**: How to handle data backup and migration?

### Evaluation Methodology
1. **Rubric System**: How detailed should evaluation rubrics be?
2. **Scoring**: Numerical scores vs. pass/fail vs. both?
3. **Confidence**: Should we track model confidence in responses?

## Constraints & Considerations

### Technical Constraints
- **Team Size**: Small research team (likely 1-5 people)
- **Budget**: Cost-conscious (need to track API usage)
- **Timeline**: Need rapid prototyping and iteration
- **Maintenance**: Should be easy to maintain and extend

### Research Constraints
- **Reproducibility**: Results must be reproducible
- **Version Control**: Need to track changes to tasks and models
- **Documentation**: Clear documentation for research purposes

### Security & Privacy
- **API Keys**: Secure storage of provider API keys
- **Data Privacy**: Handling of potentially sensitive evaluation data
- **Access Control**: Who can add/modify tasks and models?

## Open Questions

### Methodology Questions
1. **Evaluation Standards**: Should we follow specific evaluation methodologies?
2. **Bias Detection**: How do we ensure evaluations are fair and unbiased?
3. **Statistical Significance**: Do we need statistical testing for results?

### Platform Questions
1. **Scalability**: How much should we plan for future growth?
2. **Extensibility**: How easy should it be to add new evaluation methods?
3. **Integration**: Should we plan for integration with other research tools?

### User Experience Questions
1. **Learning Curve**: How complex should the interface be?
2. **Documentation**: How much in-app help do we need?
3. **Collaboration**: How do multiple researchers collaborate on evaluations?

## Potential Challenges

### Technical Challenges
1. **API Rate Limits**: Managing rate limits across multiple providers
2. **Cost Management**: Preventing runaway API costs
3. **Error Handling**: Graceful handling of API failures
4. **Performance**: Ensuring fast evaluation times

### Methodology Challenges
1. **Evaluation Quality**: Ensuring evaluations are meaningful and reliable
2. **Bias**: Avoiding evaluation bias in task design
3. **Reproducibility**: Ensuring consistent results across runs

### User Experience Challenges
1. **Complexity**: Balancing functionality with simplicity
2. **Learning**: Helping users understand evaluation methodology
3. **Workflow**: Integrating with existing research workflows

## Success Criteria

### Functional Success
- Users can quickly add tasks and models
- Evaluation results are accurate and reproducible
- Performance analysis provides actionable insights
- System is reliable and fast

### User Success
- Researchers can iterate quickly on evaluations
- Results are easy to understand and share
- System integrates well with research workflow
- Learning curve is minimal

### Technical Success
- System is maintainable and extensible
- Costs are predictable and manageable
- Performance meets user expectations
- Code quality is high and well-documented

## Next Steps
1. **Clarify Requirements**: Get more specific details on use cases
2. **Technical Decisions**: Make key architectural decisions
3. **Data Model**: Finalize the data schema
4. **UI/UX Design**: Create wireframes and user flows
5. **Implementation Plan**: Break down into actionable tasks

## Expert Persona Analysis & Recommendations

### AI Evals Methodology Expert Insights
Based on the methodology expert's rubric, here are critical recommendations:

#### Phase 0: Foundation Requirements
- **Start with Error Analysis**: Before building the platform, conduct manual error review of 50-100 model outputs to understand failure modes
- **Use Real Data**: Avoid synthetic examples - source evaluation tasks from actual research use cases
- **Version Everything**: Implement versioning from day 1 for tasks, prompts, and models
- **Ground Truth Validation**: Ensure ground truth labels are verified and documented

#### Evaluation Design Principles
- **Clear Objectives**: Each task should have specific, measurable objectives
- **Appropriate Methods**: Use code assertions for deterministic checks, LLM-as-judge for subjective evaluation
- **Validation**: If using LLM-as-judge, validate against human agreement (>80% target)
- **Uncertainty Handling**: Test model calibration and refusal behavior

### LLM Evaluation Platform Architect Insights
Based on the platform architect's recommendations:

#### Architecture Decisions
- **Start Simple**: Monolith architecture is fine for small teams (1-5 people)
- **Tech Stack**: FastAPI + PostgreSQL + React/Next.js (proven, maintainable)
- **Provider Abstraction**: Unified interface for OpenRouter integration
- **Caching Strategy**: Aggressive caching of model responses to reduce costs

#### Data Model Recommendations
The architect suggests this core schema:
```sql
-- Tasks with versioning
CREATE TABLE eval_tasks (
  id UUID PRIMARY KEY,
  task_version VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  input TEXT NOT NULL,
  expected_output TEXT,
  ground_truth JSONB,
  metadata JSONB,  -- Tags, category, etc.
  created_at TIMESTAMP
);

-- Models with prompt versioning
CREATE TABLE models (
  id UUID PRIMARY KEY,
  provider VARCHAR,
  model_name VARCHAR,
  prompt_version VARCHAR NOT NULL,
  config JSONB,
  created_at TIMESTAMP
);

-- Results with full context
CREATE TABLE eval_results (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES eval_tasks(id),
  model_id UUID REFERENCES models(id),
  model_output TEXT,
  passed BOOLEAN,
  score FLOAT,
  latency_ms INTEGER,
  cost_usd DECIMAL(10,6),
  evaluated_at TIMESTAMP
);
```

#### Key Platform Principles
- **Keep Prompts in Code**: Store prompts in version control, not database
- **Provider Agnostic**: Design for multiple LLM providers from start
- **Cost Tracking**: Implement comprehensive cost monitoring
- **Reproducibility**: Ensure all eval runs are reproducible

## Refined Recommendations

### Data Model Enhancements
1. **Add Evaluation Methods Table**: Track different evaluation approaches (code, LLM-judge, human)
2. **Add Metrics Schema**: Flexible metrics system with predefined and custom metrics
3. **Add Run Tracking**: Track evaluation runs for reproducibility
4. **Add Error Categories**: Track failure modes for analysis

### UI/UX Recommendations
1. **Start with Core Tabs**: Evaluate, Add Task, View Tasks, Add Model, Review Performance
2. **Add Error Analysis Tab**: Dedicated space for error categorization and analysis
3. **Add Run History**: Track and compare evaluation runs over time
4. **Add Export/Import**: CSV/JSON support for data portability

### Technical Architecture
1. **Backend**: FastAPI with PostgreSQL
2. **Frontend**: Next.js with TypeScript
3. **Provider**: OpenRouter integration with fallback options
4. **Caching**: Redis for model response caching
5. **Deployment**: Start with Railway/Vercel for simplicity

## User Requirements Clarification

### Task Types
- **Primary**: Classification and Generation (equally weighted)
- **Evaluation Focus**: 
  - Hallucinations detection (highest priority)
  - Accuracy measurement (highest priority)
  - Generation quality assessment (secondary)

### Technical Constraints
- **Timeline**: Need working prototype this week
- **Team**: Technical user - can handle complex UI
- **Caching**: Skip for now (MVP focus)
- **Datasets**: No existing datasets - prototype must support adding new tasks
- **Database**: Start with SQLite (expert recommendation for MVP)

### Architecture Decisions
- **Start Simple**: SQLite instead of PostgreSQL for MVP
- **Focus**: Core functionality over optimization
- **Iteration**: Build, test, iterate quickly
