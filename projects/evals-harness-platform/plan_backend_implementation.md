# Evals Harness Platform - Backend Implementation Plan

## Overview
This document outlines the backend implementation plan for the evals harness platform, focusing on FastAPI, SQLite, and OpenRouter integration.

## Backend Architecture

### Core Components
1. **FastAPI Application**: Main API server with auto-generated documentation
2. **SQLite Database**: MVP database with SQLAlchemy ORM
3. **OpenRouter Integration**: LLM provider abstraction layer
4. **Evaluation Engine**: Classification and generation evaluation methods
5. **Error Analysis**: Hallucination detection and error categorization
6. **Cost Tracking**: API usage monitoring and budget controls

## Implementation Phases

### Phase 1: Core Backend Setup (2 hours)
**Priority**: High

#### Subtasks:
1. **Environment Setup** (30 minutes)
   - Create Python virtual environment with uv
   - Install dependencies: FastAPI, SQLAlchemy, Pydantic, pytest
   - Configure development tools: Ruff, mypy, isort
   - Set up pre-commit hooks

2. **FastAPI Application Structure** (1 hour)
   - Create main FastAPI application
   - Set up project structure with routers
   - Configure CORS and middleware
   - Add basic health check endpoint
   - Set up logging configuration

3. **Database Setup** (30 minutes)
   - Configure SQLite database connection
   - Set up SQLAlchemy models
   - Create database initialization script
   - Add Alembic for migrations

### Phase 2: Data Models and API Endpoints (2 hours)
**Priority**: High

#### Subtasks:
1. **SQLAlchemy Models** (1 hour)
   - Implement `eval_tasks` model with versioning
   - Implement `models` model for LLM configurations
   - Implement `eval_results` model with metadata
   - Add proper relationships and constraints

2. **Pydantic Schemas** (30 minutes)
   - Create request/response schemas
   - Add validation rules and error messages
   - Implement schema inheritance

3. **API Endpoints** (30 minutes)
   - CRUD endpoints for tasks
   - CRUD endpoints for models
   - CRUD endpoints for results
   - Add proper error handling and status codes

### Phase 3: OpenRouter Integration (1 hour)
**Priority**: High

#### Subtasks:
1. **OpenRouter Client** (45 minutes)
   - Implement API client with retry logic
   - Add exponential backoff for rate limits
   - Implement cost tracking per request
   - Add proper error handling

2. **Model Management** (15 minutes)
   - Fetch available models from OpenRouter
   - Cache model information
   - Validate model compatibility

### Phase 4: Evaluation Engine (2 hours)
**Priority**: High

#### Subtasks:
1. **Core Evaluation Logic** (1 hour)
   - Implement classification evaluation
   - Implement generation evaluation
   - Add evaluation result processing
   - Handle different task types

2. **Error Analysis** (1 hour)
   - Implement LLM-as-judge hallucination detection
   - Add error categorization system
   - Implement priority scoring framework
   - Add statistical validation methods

### Phase 5: Cost Tracking and Monitoring (1 hour)
**Priority**: Medium

#### Subtasks:
1. **Cost Tracking** (30 minutes)
   - Track API costs per request
   - Implement spending limits
   - Add budget alerts
   - Create cost analysis endpoints

2. **Performance Monitoring** (30 minutes)
   - Add response time tracking
   - Implement performance metrics
   - Add monitoring endpoints
   - Set up logging for analysis

## Technical Specifications

### Database Schema
```sql
-- Core tables with UUIDs and versioning
eval_tasks (id, version, name, description, task_type, ground_truth, rubric, metadata, created_at)
models (id, name, provider, model_id, config, metadata, created_at)
eval_results (id, task_id, model_id, run_id, result, score, error_analysis, cost, created_at)
eval_runs (id, task_ids, model_ids, status, config, results_summary, created_at)
```

### API Endpoints
```
GET    /api/tasks              # List all tasks
POST   /api/tasks              # Create new task
GET    /api/tasks/{id}         # Get task details
PUT    /api/tasks/{id}         # Update task
DELETE /api/tasks/{id}         # Delete task

GET    /api/models             # List all models
POST   /api/models             # Create new model
GET    /api/models/{id}        # Get model details
PUT    /api/models/{id}        # Update model
DELETE /api/models/{id}        # Delete model

POST   /api/evaluations        # Run evaluation
GET    /api/evaluations/{id}   # Get evaluation status
GET    /api/results            # List results with filtering
GET    /api/results/{id}       # Get result details

GET    /api/error-analysis     # Get error analysis
GET    /api/cost-tracking      # Get cost information
GET    /api/performance        # Get performance metrics
```

### Error Handling
- Comprehensive error logging
- Graceful degradation for API failures
- Proper HTTP status codes
- User-friendly error messages
- Retry logic for transient failures

### Security
- API key validation
- Rate limiting
- Input validation with Pydantic
- SQL injection prevention
- CORS configuration

## Testing Strategy

### Unit Tests (>90% coverage)
- Test all API endpoints
- Test database operations
- Test OpenRouter integration
- Test evaluation engine
- Test error analysis methods

### Integration Tests
- Test complete evaluation workflow
- Test error handling scenarios
- Test cost tracking accuracy
- Test performance monitoring

### Performance Tests
- Load testing for API endpoints
- Database query performance
- OpenRouter API response times
- Memory usage monitoring

## Deployment Considerations

### Development Environment
- Local SQLite database
- Environment variables for configuration
- Hot reload for development
- Comprehensive logging

### Production Environment
- Database connection pooling
- Proper error handling and logging
- Performance monitoring
- Security hardening

## Dependencies

### Python Packages
```
fastapi>=0.104.0
sqlalchemy>=2.0.0
pydantic>=2.0.0
uvicorn>=0.24.0
alembic>=1.12.0
httpx>=0.25.0
pytest>=7.4.0
pytest-asyncio>=0.21.0
ruff>=0.1.0
mypy>=1.6.0
```

### External Services
- OpenRouter API access
- Environment variables for configuration
- Logging and monitoring infrastructure

## Success Criteria

### Functional Requirements
- [ ] All API endpoints working correctly
- [ ] Database operations with proper constraints
- [ ] OpenRouter integration with cost tracking
- [ ] Evaluation engine for classification and generation
- [ ] Error analysis with hallucination detection
- [ ] Cost tracking within 1% accuracy

### Non-Functional Requirements
- [ ] API response time <500ms (95th percentile)
- [ ] Test coverage >90% line, >80% branch
- [ ] Proper error handling and logging
- [ ] Security measures implemented
- [ ] Performance monitoring active

## Risk Mitigation

### Technical Risks
- **OpenRouter API Limits**: Implement exponential backoff and retry logic
- **Database Performance**: Monitor query performance, plan PostgreSQL migration
- **Cost Overruns**: Implement spending limits and alerts
- **Integration Failures**: Comprehensive testing and error handling

### Implementation Risks
- **Scope Creep**: Stick to MVP requirements
- **Testing Delays**: Write tests alongside implementation
- **Performance Issues**: Monitor and optimize early

## Next Steps

1. **Immediate**: Set up development environment and core FastAPI structure
2. **Phase 1**: Implement database models and basic API endpoints
3. **Phase 2**: Add OpenRouter integration and evaluation engine
4. **Phase 3**: Implement error analysis and cost tracking
5. **Final**: Comprehensive testing and deployment preparation
