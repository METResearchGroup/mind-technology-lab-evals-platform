# Ticket 4: Integrate Frontend with Backend API

## Context & Motivation
This ticket connects the stateless Next.js frontend with the FastAPI backend, replacing dummy data with real API calls. This enables full end-to-end functionality and completes the MVP platform.

## Detailed Description & Requirements

#### Functional Requirements:
- Replace dummy JSON data with API calls to FastAPI backend
- Implement React Query for API state management
- Add loading states and error handling for all API operations
- Implement form submission for task and model creation
- Add real-time evaluation execution with progress tracking
- Implement results filtering and analysis features

#### Non-Functional Requirements:
- Performance: API calls complete within 2 seconds
- User Experience: Smooth loading states and error feedback
- Reliability: Graceful handling of API failures
- Security: Secure API key storage and transmission

#### Validation & Error Handling:
- Form validation with Zod schemas
- API error handling with user-friendly messages
- Network error retry logic
- Loading state management

## Success Criteria
- All dummy data replaced with real API calls
- Forms successfully create tasks and models
- Evaluation execution works end-to-end
- Results display and filtering functional
- Error handling provides clear user feedback
- Performance meets requirements

## Test Plan

### Unit Tests
- `test_api_integration`: All API calls work correctly
  - **Input**: Mock API responses, test all API service methods
  - **Expected Result**: Correct data transformation, proper error handling
  - **Test Type**: Unit test with mocked API responses
  - **Coverage Target**: 100% of API service methods

- `test_form_submission`: Task and model creation works
  - **Input**: Submit forms with valid/invalid data
  - **Expected Result**: Successful API calls, proper validation, error handling
  - **Test Type**: Component unit test with React Testing Library
  - **Coverage Target**: 100% of form submission logic

- `test_loading_states`: Loading indicators work correctly
  - **Input**: Trigger API calls, test loading state transitions
  - **Expected Result**: Loading states display correctly, transitions smooth
  - **Test Type**: Component unit test
  - **Coverage Target**: 100% of loading state logic

### Integration Tests
- `test_evaluation_execution`: End-to-end evaluation works
  - **Input**: Start evaluation with real backend API
  - **Expected Result**: Evaluation completes successfully, progress updates, results display
  - **Test Type**: Integration test with real backend
  - **Coverage Target**: Complete evaluation workflow

- `test_error_handling`: API errors are handled gracefully
  - **Input**: Simulate API failures, network errors, validation errors
  - **Expected Result**: User-friendly error messages, graceful degradation
  - **Test Type**: Integration test
  - **Coverage Target**: All error handling paths

- `test_results_filtering`: Results can be filtered and analyzed
  - **Input**: Apply various filters to results data
  - **Expected Result**: Correct filtering, sorting, analysis features work
  - **Test Type**: Integration test
  - **Coverage Target**: All filtering and analysis features

### End-to-End Tests (Headless)
- `test_complete_workflow`: Full user journey with real API
  - **Input**: Create task, add model, run evaluation, view results
  - **Expected Result**: Complete workflow functions without errors
  - **Test Type**: E2E test with Playwright (headless)
  - **Coverage Target**: Critical user paths

### Performance Tests
- `test_api_performance`: API calls complete within requirements
  - **Input**: Measure API call response times
  - **Expected Result**: All API calls complete within 2 seconds
  - **Test Type**: Performance test
  - **Coverage Target**: All API endpoints

### CI/CD Compatibility Requirements
- **No Browser Dependencies**: All tests must run in headless mode
- **No GUI Access**: Tests must not require desktop environment
- **Build Verification**: `npm run build` must pass with API integration
- **Mock Backend**: Tests must work with mocked backend responses

### Test Coverage Requirements
- **Line Coverage**: >90% for all API integration code
- **Branch Coverage**: >80% for conditional logic
- **Component Coverage**: 100% for all React components
- **API Coverage**: 100% for all API service methods

### Test File Structure
```
__tests__/
├── api/
│   ├── api-client.test.ts
│   ├── task-service.test.ts
│   ├── model-service.test.ts
│   └── evaluation-service.test.ts
├── integration/
│   ├── api-integration.test.ts
│   ├── form-submission.test.ts
│   └── evaluation-workflow.test.ts
├── e2e/
│   ├── complete-workflow.test.ts
│   └── error-scenarios.test.ts
└── performance/
    └── api-performance.test.ts
```

### Pre-commit Hook Requirements
- **Build Check**: `npm run build` must pass with API integration
- **Linting**: Prettier and ESLint must pass
- **TypeScript**: No compilation errors
- **Test Suite**: All tests must pass before commit
- **API Mocking**: Tests must not require running backend

### Expected Results Validation
- **API Integration**: All API calls work correctly with proper data transformation
- **Form Submission**: Tasks and models are created successfully via API
- **Evaluation Execution**: End-to-end evaluation workflow functions correctly
- **Error Handling**: API errors are handled gracefully with user-friendly messages
- **Loading States**: Loading indicators work smoothly throughout the application
- **Results Filtering**: Results can be filtered, sorted, and analyzed correctly

## Dependencies
- Depends on: Ticket 1 (Basic Stateless UI)
- Depends on: Ticket 3 (FastAPI Backend)
- Requires: React Query for API state management
- Requires: Zod for form validation
- Requires: Playwright (headless) for E2E testing
- Requires: MSW (Mock Service Worker) for API mocking

## Suggested Implementation Plan
- Install React Query and configure API client
- Create API service layer with TypeScript interfaces
- Replace dummy data loading with API calls
- Implement form submission handlers
- Add loading states and error handling
- Implement evaluation execution with progress tracking
- Add results filtering and analysis features
- Test end-to-end functionality
- Update error boundaries and loading states

## Effort Estimate
- Estimated effort: **3 hours**
- Assumes both frontend and backend are complete
- Includes integration, testing, and error handling

## Priority & Impact
- Priority: **High**
- Rationale: Completes MVP functionality and enables full platform usage

## Acceptance Checklist
- [ ] All dummy data replaced with API calls
- [ ] React Query configured for API state management
- [ ] Form submission works for tasks and models
- [ ] Evaluation execution works end-to-end
- [ ] Results filtering and analysis functional
- [ ] Error handling provides clear feedback
- [ ] Loading states implemented throughout
- [ ] Test coverage >90% line coverage, >80% branch coverage
- [ ] All tests pass in CI environment (headless)
- [ ] `npm run build` passes with API integration
- [ ] Pre-commit hooks configured (build check, linting)
- [ ] Integration tests written and passing

## Proposed File Structure
```
frontend/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/             # React components
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Table.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── forms/              # Form components
│   │   │   ├── TaskForm.tsx
│   │   │   ├── ModelForm.tsx
│   │   │   └── EvaluationForm.tsx
│   │   ├── tables/             # Table components
│   │   │   ├── TasksTable.tsx
│   │   │   ├── ModelsTable.tsx
│   │   │   └── ResultsTable.tsx
│   │   └── layout/             # Layout components
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── TabNavigation.tsx
│   ├── pages/                  # Page components
│   │   ├── Evaluate.tsx
│   │   ├── AddTask.tsx
│   │   ├── ViewTasks.tsx
│   │   ├── AddModel.tsx
│   │   └── ReviewPerformance.tsx
│   ├── services/               # API service layer
│   │   ├── api-client.ts
│   │   ├── task-service.ts
│   │   ├── model-service.ts
│   │   ├── evaluation-service.ts
│   │   └── result-service.ts
│   ├── hooks/                  # Custom React hooks
│   │   ├── useTasks.ts
│   │   ├── useModels.ts
│   │   ├── useEvaluations.ts
│   │   └── useResults.ts
│   ├── types/                  # TypeScript type definitions
│   │   ├── api.ts
│   │   ├── task.ts
│   │   ├── model.ts
│   │   └── evaluation.ts
│   ├── utils/                  # Utility functions
│   │   ├── validation.ts
│   │   ├── formatting.ts
│   │   └── constants.ts
│   └── lib/                    # Third-party library configurations
│       ├── query-client.ts
│       └── api-mocks.ts
├── public/                     # Static assets
│   ├── data/                   # Dummy data (to be replaced)
│   │   ├── tasks.json
│   │   ├── models.json
│   │   └── results.json
│   └── icons/
├── __tests__/                  # Test files (as defined above)
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## End-to-End Verification Checklist

### Setup Prerequisites
- [ ] **Backend Running Locally**: `cd backend && uvicorn app.main:app --reload --port 8000`
  - Verify: http://localhost:8000/docs should show API documentation
  - Database: SQLite database at `backend/evals.db` should exist
  - Environment: `.env` file with `OPENROUTER_API_KEY` set

- [ ] **Frontend Running Locally**: `cd frontend && npm run dev`
  - Verify: http://localhost:3000 should load the application
  - API URL: `NEXT_PUBLIC_API_URL=http://localhost:8000/api` in `.env.local`

### E2E Test 1: Task CRUD Operations
**Objective**: Verify complete task lifecycle from creation to deletion

- [ ] **E2E-1.1: Create New Task**
  - **Frontend Action**: Navigate to "Add Task" tab, fill form with:
    - Name: "Test Classification Task"
    - Type: "classification"
    - Input: "Classify this sentiment: I love this product!"
    - Expected Output: "positive"
    - Grading Criteria: "exact_match"
    - Project: "test-project"
    - Tags: ["test", "classification"]
  - **Backend Processing**:
    - POST `/api/tasks` receives request
    - Validates schema with TaskCreate
    - Tags converted to JSON string
    - Inserts into `eval_tasks` table
    - Returns TaskResponse with auto-generated ID
  - **Verify**:
    - Response status: 201 Created
    - Response body contains all submitted fields
    - `id`, `created_at`, `updated_at` are populated
    - Database contains new row in `eval_tasks` table
    - Frontend shows success message
    - Task appears in "View Tasks" tab immediately

- [ ] **E2E-1.2: List All Tasks**
  - **Frontend Action**: Navigate to "View Tasks" tab
  - **Backend Processing**:
    - GET `/api/tasks` retrieves all tasks
    - Queries `eval_tasks` table
    - Converts JSON tags back to arrays
    - Returns list of TaskResponse objects
  - **Verify**:
    - Response status: 200 OK
    - Response contains array of tasks
    - Previously created task is in the list
    - All fields are correctly deserialized
    - Frontend renders table with all tasks

- [ ] **E2E-1.3: Get Single Task**
  - **Frontend Action**: Click on a task to view details
  - **Backend Processing**:
    - GET `/api/tasks/{task_id}` retrieves specific task
    - Queries by ID in `eval_tasks` table
    - Returns TaskResponse or 404 if not found
  - **Verify**:
    - Response status: 200 OK
    - Response contains correct task data
    - All fields match what was created
    - Frontend displays task details correctly

- [ ] **E2E-1.4: Update Task**
  - **Frontend Action**: Edit task, change description to "Updated description"
  - **Backend Processing**:
    - PUT `/api/tasks/{task_id}` receives update
    - Validates with TaskUpdate schema
    - Updates only provided fields (exclude_unset=True)
    - Updates `updated_at` timestamp
    - Returns updated TaskResponse
  - **Verify**:
    - Response status: 200 OK
    - `updated_at` timestamp is newer than `created_at`
    - Only updated fields changed, others unchanged
    - Database row reflects changes
    - Frontend updates immediately (cache invalidation)

- [ ] **E2E-1.5: Filter Tasks**
  - **Frontend Action**: Apply filters (task_type, project, tags)
  - **Backend Processing**:
    - GET `/api/tasks?task_type=classification&project=test-project&tags=test`
    - Applies WHERE clauses for each filter
    - Tags filter uses LIKE operator
    - Returns filtered results
  - **Verify**:
    - Response only contains matching tasks
    - Multiple tag filters work (AND logic)
    - Empty filters return all tasks
    - Frontend updates table with filtered results

- [ ] **E2E-1.6: Delete Task**
  - **Frontend Action**: Click delete button, confirm deletion
  - **Backend Processing**:
    - DELETE `/api/tasks/{task_id}` removes task
    - Checks task exists (404 if not)
    - Deletes from database
    - Returns 204 No Content
  - **Verify**:
    - Response status: 204 No Content
    - Task removed from database
    - Frontend removes task from list immediately
    - Subsequent GET returns 404

### E2E Test 2: Model CRUD Operations
**Objective**: Verify complete model lifecycle and API key handling

- [ ] **E2E-2.1: Create New Model**
  - **Frontend Action**: Navigate to "Add Model" tab, fill form with:
    - Model Name: "openai/gpt-4o-mini"
    - Display Name: "GPT-4o Mini"
    - Provider: "openai"
    - Config: `{"temperature": 0.7, "max_tokens": 1000}`
  - **Backend Processing**:
    - POST `/api/models` receives request
    - Validates ModelCreate schema
    - Config dict converted to JSON string
    - Inserts into `models` table
    - Returns ModelResponse with ID
  - **Verify**:
    - Response status: 201 Created
    - Config is properly serialized
    - All fields present in response
    - Database contains new model
    - Frontend shows success and displays in list

- [ ] **E2E-2.2: List All Models**
  - **Frontend Action**: View models in "Evaluate" or "Add Model" tab
  - **Backend Processing**:
    - GET `/api/models` retrieves all models
    - Queries `models` table
    - Deserializes config JSON to dict
    - Returns ModelResponse list
  - **Verify**:
    - Response status: 200 OK
    - All models returned with correct fields
    - Config properly deserialized as JSON object
    - Frontend renders model dropdown/table

- [ ] **E2E-2.3: Update Model Config**
  - **Frontend Action**: Edit model, change temperature to 0.5
  - **Backend Processing**:
    - PUT `/api/models/{model_id}` receives update
    - Validates ModelUpdate schema
    - Re-serializes config to JSON string
    - Updates database row
    - Returns updated ModelResponse
  - **Verify**:
    - Response status: 200 OK
    - Config correctly updated in database
    - `updated_at` timestamp updated
    - Frontend reflects changes immediately

- [ ] **E2E-2.4: Get Single Model**
  - **Frontend Action**: Select model to view details
  - **Backend Processing**:
    - GET `/api/models/{model_id}` retrieves model
    - Returns ModelResponse or 404
  - **Verify**:
    - Response status: 200 OK
    - Model data correct and complete
    - Config properly deserialized

### E2E Test 3: Evaluation Execution Flow
**Objective**: Verify end-to-end evaluation workflow with real LLM calls

- [ ] **E2E-3.1: Start Evaluation Run**
  - **Frontend Action**: Navigate to "Evaluate" tab, select:
    - Tasks: [task_id_1, task_id_2]
    - Models: [model_id_1, model_id_2]
    - Name: "Test Run"
    - Description: "Testing evaluation execution"
    - Click "Run Evaluation"
  - **Backend Processing**:
    - POST `/api/evaluate` receives EvaluationRequest
    - Validates task_ids exist in database
    - Validates model_ids exist in database
    - Generates UUID for run_id
    - Creates EvalRun record with status="running"
    - Iterates through task×model combinations (4 total)
    - For each combination:
      - Calls OpenRouter API with model config
      - Measures latency
      - Evaluates response with grading criteria
      - Saves EvalResult to database
      - Increments completed_tasks counter
    - Updates EvalRun status to "completed" or "failed"
    - Sets completed_at timestamp
    - Returns RunStatusResponse
  - **Verify**:
    - Response status: 202 Accepted
    - Response contains run_id (UUID format)
    - Response has status="running" or "completed"
    - Database has EvalRun record
    - Database has 4 EvalResult records (2 tasks × 2 models)
    - Each result has:
      - `model_output` (LLM response text)
      - `passed` (boolean)
      - `score` (0.0-1.0)
      - `metrics` (JSON string)
      - `latency_ms` (positive integer)
      - `cost_usd` (positive decimal)
      - `evaluated_at` timestamp
    - Frontend shows "Evaluation started" message

- [ ] **E2E-3.2: Poll Run Status**
  - **Frontend Action**: After starting evaluation, frontend polls status
  - **Backend Processing**:
    - GET `/api/evaluate/{run_id}` every 2 seconds
    - Returns RunStatusResponse with current status
    - Includes total_tasks, completed_tasks, failed_tasks
  - **Verify**:
    - Response status: 200 OK
    - Status progresses: "running" → "completed"
    - `completed_tasks` increments from 0 to total_tasks
    - `completed_at` set when status="completed"
    - Frontend shows progress bar updating
    - Frontend stops polling when status="completed"

- [ ] **E2E-3.3: View Run Results**
  - **Frontend Action**: Navigate to "Review Performance" tab, select run
  - **Backend Processing**:
    - GET `/api/results?run_id={run_id}` fetches results
    - Queries EvalResult table filtered by run_id
    - Orders by evaluated_at DESC
    - Returns list of EvalResultResponse
  - **Verify**:
    - Response status: 200 OK
    - Returns all results for the run (4 results)
    - Each result has complete data
    - Metrics deserialized correctly
    - Frontend displays results table
    - Pass/fail indicators shown correctly

### E2E Test 4: Error Handling & Edge Cases
**Objective**: Verify graceful error handling across the stack

- [ ] **E2E-4.1: Create Task with Invalid Data**
  - **Frontend Action**: Submit task form with missing required field (empty name)
  - **Backend Processing**:
    - POST `/api/tasks` receives invalid data
    - Pydantic validation fails
    - Returns 422 Unprocessable Entity
  - **Verify**:
    - Response status: 422
    - Response contains validation error details
    - Frontend displays user-friendly error message
    - Form highlights invalid fields
    - No database record created

- [ ] **E2E-4.2: Get Non-Existent Task**
  - **Frontend Action**: Request task with ID 999999
  - **Backend Processing**:
    - GET `/api/tasks/999999` queries database
    - No record found
    - Raises TaskNotFoundError
    - Error handler returns 404
  - **Verify**:
    - Response status: 404 Not Found
    - Response contains error message
    - Frontend shows "Task not found" message
    - Application remains stable

- [ ] **E2E-4.3: Update Non-Existent Task**
  - **Frontend Action**: Attempt to update task ID 999999
  - **Backend Processing**:
    - PUT `/api/tasks/999999` queries database
    - No record found
    - Raises TaskNotFoundError
    - Returns 404
  - **Verify**:
    - Response status: 404 Not Found
    - Error message clear and actionable
    - Frontend handles error gracefully

- [ ] **E2E-4.4: Delete Non-Existent Task**
  - **Frontend Action**: Attempt to delete task ID 999999
  - **Backend Processing**:
    - DELETE `/api/tasks/999999` queries database
    - No record found
    - Raises TaskNotFoundError
    - Returns 404
  - **Verify**:
    - Response status: 404 Not Found
    - Frontend shows appropriate error

- [ ] **E2E-4.5: Start Evaluation with Invalid Task ID**
  - **Frontend Action**: Start evaluation with non-existent task_ids
  - **Backend Processing**:
    - POST `/api/evaluate` validates task existence
    - Query returns fewer tasks than requested
    - Raises TaskNotFoundError
    - Returns 404
  - **Verify**:
    - Response status: 404 Not Found
    - Error message: "One or more tasks not found"
    - No EvalRun created in database
    - Frontend displays error to user

- [ ] **E2E-4.6: Start Evaluation with Invalid Model ID**
  - **Frontend Action**: Start evaluation with non-existent model_ids
  - **Backend Processing**:
    - POST `/api/evaluate` validates model existence
    - Query returns fewer models than requested
    - Raises ModelNotFoundError
    - Returns 404
  - **Verify**:
    - Response status: 404 Not Found
    - Error message: "One or more models not found"
    - No EvalRun created in database
    - Frontend displays error to user

- [ ] **E2E-4.7: Handle OpenRouter API Failure**
  - **Frontend Action**: Start evaluation (with invalid/expired API key)
  - **Backend Processing**:
    - POST `/api/evaluate` starts run
    - OpenRouter API call fails with 401/403
    - Exception caught in try/except block
    - failed_tasks incremented
    - Run status set to "failed"
  - **Verify**:
    - Run created but status="failed"
    - failed_tasks > 0
    - Error logged but doesn't crash backend
    - Frontend shows evaluation failed
    - Partial results (if any) still saved

- [ ] **E2E-4.8: Network Timeout Handling**
  - **Frontend Action**: Start evaluation while backend is slow/unresponsive
  - **Backend Processing**: N/A (testing frontend resilience)
  - **Verify**:
    - Frontend shows loading state for reasonable time
    - After timeout, shows error message
    - User can retry operation
    - Application doesn't crash or hang

### E2E Test 5: Results Filtering & Analysis
**Objective**: Verify results can be queried with various filters

- [ ] **E2E-5.1: Filter Results by Run ID**
  - **Frontend Action**: Select specific run in results view
  - **Backend Processing**:
    - GET `/api/results?run_id={run_id}` queries database
    - Filters EvalResult WHERE run_id = {run_id}
    - Orders by evaluated_at DESC
    - Returns filtered results
  - **Verify**:
    - Response status: 200 OK
    - Only results from specified run returned
    - Results ordered by timestamp (newest first)
    - Frontend displays correct results

- [ ] **E2E-5.2: Filter Results by Task ID**
  - **Frontend Action**: Filter results by specific task
  - **Backend Processing**:
    - GET `/api/results?task_id={task_id}` queries database
    - Filters WHERE task_id = {task_id}
    - Returns all results for that task across runs
  - **Verify**:
    - Response status: 200 OK
    - Only results for specified task returned
    - Results may span multiple runs
    - Frontend shows filtered results

- [ ] **E2E-5.3: Filter Results by Model ID**
  - **Frontend Action**: Filter results by specific model
  - **Backend Processing**:
    - GET `/api/results?model_id={model_id}` queries database
    - Filters WHERE model_id = {model_id}
    - Returns all results for that model
  - **Verify**:
    - Response status: 200 OK
    - Only results for specified model returned
    - Correct model performance shown

- [ ] **E2E-5.4: Filter Results by Pass/Fail Status**
  - **Frontend Action**: Toggle to show only passed or only failed results
  - **Backend Processing**:
    - GET `/api/results?passed=true` queries database
    - Filters WHERE passed = true/false
    - Returns filtered results
  - **Verify**:
    - Response status: 200 OK
    - Only passed (or failed) results returned
    - Boolean filter works correctly
    - Frontend shows correct subset

- [ ] **E2E-5.5: Combine Multiple Filters**
  - **Frontend Action**: Apply multiple filters simultaneously
  - **Backend Processing**:
    - GET `/api/results?run_id={run_id}&task_id={task_id}&passed=true`
    - Applies all WHERE clauses (AND logic)
    - Returns results matching ALL filters
  - **Verify**:
    - Response status: 200 OK
    - Results match all filter criteria
    - Empty results if no matches
    - Frontend handles empty state gracefully

- [ ] **E2E-5.6: Respect Result Limit**
  - **Frontend Action**: Request results with limit=10
  - **Backend Processing**:
    - GET `/api/results?limit=10` queries database
    - Applies LIMIT clause (max 1000)
    - Returns limited results
  - **Verify**:
    - Response contains at most 10 results
    - Limit cannot exceed 1000
    - Frontend implements pagination if needed

### E2E Test 6: Data Consistency & Integrity
**Objective**: Verify data remains consistent across operations

- [ ] **E2E-6.1: Task-Result Referential Integrity**
  - **Frontend Action**: Create task, run evaluation, then attempt to delete task
  - **Backend Processing**:
    - Task has associated results in database
    - DELETE may fail or cascade depending on constraints
  - **Verify**:
    - Database constraints honored
    - Orphaned results handled appropriately
    - Frontend shows appropriate message
    - Data integrity maintained

- [ ] **E2E-6.2: Model-Result Referential Integrity**
  - **Frontend Action**: Create model, run evaluation, then attempt to delete model
  - **Backend Processing**:
    - Model has associated results in database
    - DELETE may fail or cascade
  - **Verify**:
    - Database constraints honored
    - Orphaned results handled appropriately
    - Frontend shows appropriate message

- [ ] **E2E-6.3: Concurrent Task Creation**
  - **Frontend Action**: Rapidly create 5 tasks in succession
  - **Backend Processing**:
    - Multiple POST `/api/tasks` requests
    - Each gets own database transaction
    - IDs auto-increment correctly
  - **Verify**:
    - All 5 tasks created successfully
    - Unique IDs assigned
    - No race conditions or conflicts
    - All appear in frontend list

### E2E Test 7: React Query Cache Management
**Objective**: Verify cache invalidation and optimistic updates

- [ ] **E2E-7.1: Optimistic Task Creation**
  - **Frontend Action**: Create new task via form
  - **Frontend Processing**:
    - useMutation executes taskService.createTask
    - onSuccess adds task to cache immediately
    - Invalidates ["tasks"] query
  - **Verify**:
    - Task appears in list before API response completes
    - If API fails, task removed from cache
    - Cache and server stay in sync

- [ ] **E2E-7.2: Cache Invalidation on Update**
  - **Frontend Action**: Update a task
  - **Frontend Processing**:
    - useMutation executes taskService.updateTask
    - onSuccess invalidates ["tasks"] query
    - Updates ["tasks", id] specific cache
  - **Verify**:
    - Changes reflected immediately in UI
    - Both list and detail views updated
    - No stale data shown

- [ ] **E2E-7.3: Cache Invalidation on Delete**
  - **Frontend Action**: Delete a task
  - **Frontend Processing**:
    - useMutation executes taskService.deleteTask
    - onSuccess removes from cache
    - Invalidates ["tasks"] query
  - **Verify**:
    - Task disappears from list immediately
    - Cache filters out deleted task
    - Subsequent refetch confirms deletion

- [ ] **E2E-7.4: Multi-Tab Cache Sync**
  - **Frontend Action**: Open app in two browser tabs, create task in tab 1
  - **Frontend Processing**:
    - Tab 1: Creates task, invalidates cache
    - Tab 2: Cache should refetch on window focus
  - **Verify**:
    - Tab 2 eventually shows new task
    - React Query refetch on window focus works
    - Both tabs stay synchronized

### E2E Test 8: Loading States & UX
**Objective**: Verify smooth user experience during async operations

- [ ] **E2E-8.1: Task List Loading State**
  - **Frontend Action**: Navigate to "View Tasks" tab
  - **Frontend Processing**:
    - useTasks() hook returns { isLoading: true }
    - Renders loading spinner/skeleton
    - Data arrives, isLoading becomes false
  - **Verify**:
    - Loading indicator displays immediately
    - No flash of empty state
    - Smooth transition to data display
    - No layout shift when data loads

- [ ] **E2E-8.2: Task Creation Loading State**
  - **Frontend Action**: Submit task form
  - **Frontend Processing**:
    - useCreateTask().mutate() called
    - isPending becomes true
    - Submit button disabled
    - Success: form cleared, success message
  - **Verify**:
    - Submit button shows loading state
    - Button disabled during submission
    - User cannot double-submit
    - Success state handled smoothly

- [ ] **E2E-8.3: Evaluation Running Progress**
  - **Frontend Action**: Start evaluation, watch progress
  - **Frontend Processing**:
    - useRunStatus() polls every 2 seconds
    - Progress bar updates with completed_tasks/total_tasks
    - Polling stops when status="completed"
  - **Verify**:
    - Progress updates in real-time
    - Percentage calculation correct
    - Polling stops when complete
    - Final state shows all tasks completed

- [ ] **E2E-8.4: Error State Display**
  - **Frontend Action**: Trigger an API error (e.g., invalid data)
  - **Frontend Processing**:
    - Mutation fails
    - isError becomes true
    - Error message extracted from response
  - **Verify**:
    - Error message displayed to user
    - Message is human-readable
    - User can dismiss error
    - Form remains filled (not cleared on error)

### E2E Test 9: Performance & Scalability
**Objective**: Verify performance meets requirements

- [ ] **E2E-9.1: Task List Performance**
  - **Frontend Action**: Load tasks list with 50+ tasks
  - **Backend Processing**:
    - GET `/api/tasks` queries database
    - No pagination (loads all tasks)
  - **Verify**:
    - Response time < 2 seconds
    - Frontend renders without lag
    - Virtual scrolling if needed
    - No memory leaks

- [ ] **E2E-9.2: Results List Performance**
  - **Frontend Action**: Load results with limit=100
  - **Backend Processing**:
    - GET `/api/results?limit=100` queries database
    - Applies LIMIT clause
  - **Verify**:
    - Response time < 2 seconds
    - Large result sets handled efficiently
    - Frontend pagination works

- [ ] **E2E-9.3: Evaluation Execution Performance**
  - **Frontend Action**: Run evaluation with 2 tasks × 2 models = 4 calls
  - **Backend Processing**:
    - Each OpenRouter API call sequential
    - Total time = sum of individual call times
  - **Verify**:
    - Each LLM API call completes within reasonable time
    - Total evaluation time acceptable
    - Progress updates smooth
    - No timeout errors

### E2E Test 10: CORS & Security
**Objective**: Verify security configurations work correctly

- [ ] **E2E-10.1: CORS Headers**
  - **Frontend Action**: Make any API call from http://localhost:3000
  - **Backend Processing**:
    - CORS middleware adds headers
    - Allows origin from CORS_ORIGINS config
  - **Verify**:
    - Response includes Access-Control-Allow-Origin header
    - Preflight OPTIONS requests succeed
    - Frontend can make requests without CORS errors

- [ ] **E2E-10.2: API Key Not Exposed**
  - **Frontend Action**: View evaluation results
  - **Backend Processing**:
    - Returns results without exposing API keys
    - OPENROUTER_API_KEY never in responses
  - **Verify**:
    - No API keys in response bodies
    - No API keys in frontend code/console
    - API key only used server-side

- [ ] **E2E-10.3: Input Sanitization**
  - **Frontend Action**: Submit task with special characters in fields
  - **Backend Processing**:
    - Validates with Pydantic
    - Uses parameterized queries (SQLAlchemy ORM)
    - No SQL injection possible
  - **Verify**:
    - Special characters handled correctly
    - No SQL injection vulnerabilities
    - XSS prevented in frontend display

### E2E Test 11: Database Operations
**Objective**: Verify database transactions and data persistence

- [ ] **E2E-11.1: Transaction Commit on Success**
  - **Frontend Action**: Create task successfully
  - **Backend Processing**:
    - db.add(task)
    - db.commit()
    - db.refresh(task)
  - **Verify**:
    - Task persisted to database
    - Query in new session returns task
    - Auto-generated fields populated (id, timestamps)

- [ ] **E2E-11.2: Transaction Rollback on Error**
  - **Frontend Action**: Create task that fails validation after DB insert
  - **Backend Processing**:
    - Exception occurs after db.add()
    - Transaction should rollback
  - **Verify**:
    - No partial data in database
    - Database remains consistent
    - Error returned to frontend

- [ ] **E2E-11.3: Timestamp Auto-Population**
  - **Frontend Action**: Create task, wait 2 seconds, update task
  - **Backend Processing**:
    - created_at set on insert (server_default=func.now())
    - updated_at set on update (onupdate=func.now())
  - **Verify**:
    - created_at matches insertion time
    - updated_at > created_at after update
    - Timestamps in UTC
    - Frontend displays timestamps correctly

### E2E Test 12: Type Safety & Data Serialization
**Objective**: Verify TypeScript/Python type contracts

- [ ] **E2E-12.1: Task Schema Validation**
  - **Frontend Action**: Submit TaskCreate with all fields
  - **Backend Processing**:
    - Pydantic validates against TaskCreate schema
    - All required fields present
    - Types match (str, int, list, etc.)
  - **Verify**:
    - Valid data passes validation
    - Invalid types rejected with 422
    - Error messages indicate which field failed

- [ ] **E2E-12.2: Model Config Serialization**
  - **Frontend Action**: Create model with config object
  - **Backend Processing**:
    - Config dict → JSON string for storage
    - JSON string → dict for responses
  - **Verify**:
    - Config round-trips correctly (dict → JSON → dict)
    - No data loss in serialization
    - Frontend receives proper JSON object

- [ ] **E2E-12.3: Tags Array Serialization**
  - **Frontend Action**: Create task with tags: ["tag1", "tag2", "tag3"]
  - **Backend Processing**:
    - List → JSON string for storage
    - JSON string → list for responses
  - **Verify**:
    - Tags array round-trips correctly
    - Tag order preserved
    - Empty array handled correctly
    - Null vs empty array handled correctly

- [ ] **E2E-12.4: Metrics JSON Serialization**
  - **Frontend Action**: View evaluation results with metrics
  - **Backend Processing**:
    - Metrics dict → JSON string in database
    - JSON string → dict in EvalResultResponse
  - **Verify**:
    - Metrics deserialized correctly
    - Nested objects preserved
    - Frontend can access metric fields

### E2E Test 13: Full User Journey
**Objective**: Verify complete workflow from setup to results

- [ ] **E2E-13.1: Complete Workflow - Happy Path**
  1. **Create Task**:
     - Frontend: Fill task form, submit
     - Backend: POST /api/tasks, returns 201
     - Verify: Task created with ID=1

  2. **Create Model**:
     - Frontend: Fill model form, submit
     - Backend: POST /api/models, returns 201
     - Verify: Model created with ID=1

  3. **View Created Resources**:
     - Frontend: Navigate to View Tasks tab
     - Backend: GET /api/tasks, returns array
     - Verify: Created task visible in list

  4. **Run Evaluation**:
     - Frontend: Select task ID=1, model ID=1, start evaluation
     - Backend: POST /api/evaluate, creates run, executes
     - Verify: Run status="running", then "completed"

  5. **View Results**:
     - Frontend: Navigate to Review Performance tab
     - Backend: GET /api/results?run_id={run_id}
     - Verify: Results displayed with pass/fail, score, metrics

  6. **Filter Results**:
     - Frontend: Apply filters to narrow results
     - Backend: GET /api/results with query params
     - Verify: Filtered results correct

  7. **Update Task**:
     - Frontend: Edit task, change input text
     - Backend: PUT /api/tasks/{task_id}
     - Verify: Task updated, changes visible

  8. **Re-run Evaluation**:
     - Frontend: Run evaluation again with updated task
     - Backend: POST /api/evaluate, new run_id
     - Verify: New run created, new results stored

  9. **Compare Results**:
     - Frontend: View results from both runs
     - Backend: GET /api/results for each run_id
     - Verify: Results correctly separated by run_id

  10. **Cleanup**:
      - Frontend: Delete task, delete model
      - Backend: DELETE endpoints called
      - Verify: Resources removed from database

  **Overall Verification**:
  - [ ] Entire workflow completes without errors
  - [ ] All data persisted correctly
  - [ ] Frontend state synchronized with backend
  - [ ] No memory leaks or performance degradation
  - [ ] All timestamps, IDs, and metadata correct

### E2E Test 14: Evaluation Engine Logic
**Objective**: Verify grading criteria work correctly

- [ ] **E2E-14.1: Exact Match Grading**
  - **Frontend Action**: Create task with grading_criteria="exact_match"
    - Expected output: "positive"
  - **Backend Processing**:
    - Runs evaluation, model returns "positive"
    - EvaluationEngine.evaluate() compares strings
    - passed=True, score=1.0
  - **Verify**:
    - Exact match: passed=True, score=1.0
    - Case-sensitive comparison
    - Whitespace matters
    - Result saved correctly

- [ ] **E2E-14.2: Exact Match Failure**
  - **Frontend Action**: Same task, model returns "negative"
  - **Backend Processing**:
    - Evaluation engine compares "negative" != "positive"
    - passed=False, score=0.0
  - **Verify**:
    - Mismatch: passed=False, score=0.0
    - Error category populated (if applicable)
    - Result saved with failure state

- [ ] **E2E-14.3: Contains Grading**
  - **Frontend Action**: Create task with grading_criteria="contains"
    - Expected output: "positive"
  - **Backend Processing**:
    - Model returns "The sentiment is positive overall"
    - Engine checks if "positive" in output
    - passed=True, score=1.0
  - **Verify**:
    - Substring match works
    - Case sensitivity handled correctly
    - Partial matches count as pass

- [ ] **E2E-14.4: Custom Grading Logic**
  - **Frontend Action**: Create task with custom grading criteria
  - **Backend Processing**:
    - Evaluation engine uses custom logic
    - Calculates score based on criteria
  - **Verify**:
    - Custom logic executes correctly
    - Score calculated accurately
    - Metrics captured in results

### E2E Test 15: Cost & Latency Tracking
**Objective**: Verify metrics are tracked correctly

- [ ] **E2E-15.1: Latency Measurement**
  - **Frontend Action**: Run evaluation
  - **Backend Processing**:
    - start_time = time.time() before API call
    - latency_ms = (time.time() - start_time) * 1000
    - Saves to EvalResult.latency_ms
  - **Verify**:
    - latency_ms is positive integer
    - Reasonable value (typically 500-5000ms)
    - Saved in database
    - Frontend displays latency

- [ ] **E2E-15.2: Cost Tracking**
  - **Frontend Action**: Run evaluation with GPT-4
  - **Backend Processing**:
    - OpenRouter returns cost_usd in response
    - Saves to EvalResult.cost_usd
  - **Verify**:
    - cost_usd is positive decimal
    - Reflects actual API pricing
    - Saved in database
    - Frontend displays cost

- [ ] **E2E-15.3: Aggregated Metrics**
  - **Frontend Action**: View dashboard/analytics
  - **Backend Processing**:
    - Queries aggregate cost, latency across results
    - Calculates averages, totals
  - **Verify**:
    - Total cost sum correct
    - Average latency calculated correctly
    - Frontend displays aggregated metrics

### E2E Test 16: Edge Cases & Boundary Conditions
**Objective**: Verify handling of edge cases

- [ ] **E2E-16.1: Empty Database State**
  - **Frontend Action**: Load app with empty database
  - **Backend Processing**:
    - GET /api/tasks returns []
    - GET /api/models returns []
    - GET /api/results returns []
  - **Verify**:
    - Frontend shows empty state messages
    - No errors or crashes
    - User prompted to create first task/model

- [ ] **E2E-16.2: Very Long Task Input**
  - **Frontend Action**: Create task with 5000+ character input
  - **Backend Processing**:
    - Validates and stores long text
    - Database TEXT field handles it
  - **Verify**:
    - Long text stored correctly
    - No truncation
    - Frontend displays correctly (maybe truncated in list)

- [ ] **E2E-16.3: Special Characters in Fields**
  - **Frontend Action**: Create task with unicode, emojis, quotes
    - Name: "Task with 'quotes' and "smart quotes""
    - Input: "Text with emoji 🚀 and unicode é"
  - **Backend Processing**:
    - Stores UTF-8 encoded text
    - Returns correctly serialized
  - **Verify**:
    - Special characters preserved
    - No encoding issues
    - Frontend displays correctly

- [ ] **E2E-16.4: Maximum Pagination Limit**
  - **Frontend Action**: Request results with limit=1001
  - **Backend Processing**:
    - Limit validation (le=1000)
    - Rejects or clamps to 1000
  - **Verify**:
    - Response status: 422 (validation error)
    - Or limit clamped to 1000
    - Frontend handles gracefully

- [ ] **E2E-16.5: Null vs Empty Values**
  - **Frontend Action**: Create task with optional fields null vs empty
  - **Backend Processing**:
    - Optional fields default to None
    - Empty strings vs null handled differently
  - **Verify**:
    - Null fields stored as NULL in DB
    - Empty strings stored as ""
    - Frontend distinguishes correctly

### E2E Test 17: API Response Format Compliance
**Objective**: Verify API responses match OpenAPI specification

- [ ] **E2E-17.1: TaskResponse Schema Compliance**
  - **Frontend Action**: Create and fetch task
  - **Backend Processing**: Returns TaskResponse
  - **Verify**:
    - Response matches TaskResponse schema exactly
    - All required fields present
    - Types match TypeScript interfaces
    - ISO 8601 datetime format for timestamps

- [ ] **E2E-17.2: ModelResponse Schema Compliance**
  - **Frontend Action**: Create and fetch model
  - **Backend Processing**: Returns ModelResponse
  - **Verify**:
    - Response matches ModelResponse schema
    - Config deserialized as object (not string)
    - All fields properly typed

- [ ] **E2E-17.3: EvalResultResponse Schema Compliance**
  - **Frontend Action**: Fetch evaluation results
  - **Backend Processing**: Returns list[EvalResultResponse]
  - **Verify**:
    - Each result matches schema
    - Metrics deserialized as object
    - Decimals have correct precision
    - Boolean fields are boolean (not 0/1)

- [ ] **E2E-17.4: Error Response Format**
  - **Frontend Action**: Trigger validation error
  - **Backend Processing**: Returns FastAPI error response
  - **Verify**:
    - Status code correct (4xx/5xx)
    - Error format consistent
    - Detail message present
    - Frontend can parse and display error

### E2E Test 18: State Management Consistency
**Objective**: Verify React Query state stays consistent

- [ ] **E2E-18.1: Refetch After Mutation**
  - **Frontend Action**: Create task, immediately view list
  - **Frontend Processing**:
    - Mutation invalidates ["tasks"] query
    - Query automatically refetches
    - New task appears in list
  - **Verify**:
    - Refetch triggered automatically
    - List includes newly created task
    - No manual refresh needed

- [ ] **E2E-18.2: Stale Time Handling**
  - **Frontend Action**: View dashboard, wait 30+ seconds, view again
  - **Frontend Processing**:
    - Dashboard stats have staleTime: 30s
    - After 30s, next access triggers refetch
  - **Verify**:
    - Data refetches after stale time
    - Fresh data displayed
    - No unnecessary refetches within stale time

- [ ] **E2E-18.3: Enabled/Disabled Queries**
  - **Frontend Action**: useTask(null) called before ID known
  - **Frontend Processing**:
    - Query has enabled: !!id
    - Query doesn't execute if id is null
  - **Verify**:
    - No API call made when disabled
    - Query executes when ID becomes available
    - No errors from undefined parameters

### E2E Test 19: Build & Deployment Verification
**Objective**: Verify production build works correctly

- [ ] **E2E-19.1: Frontend Production Build**
  - **Action**: Run `npm run build` in frontend/
  - **Processing**: Next.js builds static/SSR pages
  - **Verify**:
    - Build completes without errors
    - No TypeScript errors
    - No ESLint errors
    - API calls work in production build
    - Environment variables loaded correctly

- [ ] **E2E-19.2: Backend Production Mode**
  - **Action**: Run backend with `DEBUG=false`
  - **Processing**: Production configuration loaded
  - **Verify**:
    - API endpoints function correctly
    - Logging configured appropriately
    - CORS configured for production origins
    - Database URL configurable via env var

### E2E Test 20: Regression Prevention
**Objective**: Verify no regressions from API integration

- [ ] **E2E-20.1: All Original Features Work**
  - **Frontend Action**: Test all tabs and navigation
  - **Verify**:
    - All tabs load correctly
    - Navigation works smoothly
    - UI components render correctly
    - No console errors

- [ ] **E2E-20.2: Backward Compatibility**
  - **Frontend Action**: Use app with existing database data
  - **Backend Processing**: Reads existing records
  - **Verify**:
    - Old data compatible with new schemas
    - Migrations applied correctly
    - No data corruption

### E2E Test 21: Monitoring & Observability
**Objective**: Verify platform telemetry and debugging capabilities

- [ ] **E2E-21.1: API Request Logging**
  - **Frontend Action**: Make various API calls (tasks, models, evaluations)
  - **Backend Processing**:
    - Logs each request with correlation ID
    - Captures request/response metadata
    - Logs to structured format (JSON)
  - **Verify**:
    - All API calls logged with timestamps
    - Correlation IDs present and consistent
    - Log levels appropriate (INFO for success, ERROR for failures)
    - No sensitive data (API keys, PII) in logs
    - Logs queryable by time range, endpoint, status code
    - Check backend console/log files for structured output

- [ ] **E2E-21.2: Evaluation Run Audit Trail**
  - **Frontend Action**: Run evaluation, view results
  - **Backend Processing**:
    - Records complete audit trail in database
    - Tracks: who ran eval, when, with what config
  - **Verify**:
    - Can reconstruct exactly what happened in eval run
    - All parameters captured (task_ids, model_ids, config)
    - Timestamps for start, end, each step
    - Can answer: "Who ran this eval? When? With what settings?"
    - EvalRun table contains comprehensive metadata

- [ ] **E2E-21.3: Cost Tracking Accuracy**
  - **Frontend Action**: Run evaluation with known model (e.g., GPT-4o-mini)
  - **Backend Processing**:
    - OpenRouter returns cost_usd per call
    - Backend aggregates costs
  - **Verify**:
    - Cost per evaluation accurate (within 1%)
    - Total cost = sum of individual costs
    - Cost stored with precision (6 decimal places)
    - Dashboard displays cost metrics correctly
    - Can calculate total cost for run, by model, by task
    - Reasonable values (e.g., GPT-4o-mini ~$0.0001-0.001 per call)

- [ ] **E2E-21.4: Health Check Endpoints**
  - **Action**: Call `/health` endpoint (if implemented)
  - **Backend Processing**:
    - Checks database connectivity
    - Checks basic system status
    - Returns status and version info
  - **Verify**:
    - Returns 200 OK when healthy
    - Response includes: status, version info
    - Response time < 500ms
    - NOTE: If not implemented, document as future enhancement
    - FUTURE: Add `/health` endpoint for monitoring

### E2E Test 22: Provider Abstraction & Resilience
**Objective**: Verify LLM provider abstraction and failure handling

- [ ] **E2E-22.1: OpenRouter Rate Limit Handling**
  - **Frontend Action**: Trigger evaluation (may need to simulate rate limit)
  - **Backend Processing**:
    - If OpenRouter returns 429 Too Many Requests
    - Backend should handle gracefully
  - **Verify**:
    - Current implementation: Error logged, evaluation fails
    - Error captured in EvalResult or run logs
    - User sees clear error message
    - Evaluation doesn't crash entire run
    - FUTURE: Implement exponential backoff retry (1s, 2s, 4s, 8s, 16s)
    - ROADMAP: Add retry logic to OpenRouterClient

- [ ] **E2E-22.2: Provider Response Validation**
  - **Frontend Action**: Run evaluation
  - **Backend Processing**:
    - Validates OpenRouter response format
    - Checks for required fields (content, cost_usd)
    - Handles missing/malformed responses
  - **Verify**:
    - Valid responses processed correctly
    - Check backend code for validation logic
    - Missing fields handled (e.g., cost_usd defaults or errors)
    - Malformed JSON responses cause controlled failure
    - Error details captured for debugging
    - Evaluation continues with other tasks

- [ ] **E2E-22.3: Timeout Handling**
  - **Frontend Action**: Run evaluation (monitor for long-running calls)
  - **Backend Processing**:
    - Monitor if very slow API calls timeout
    - Current: May hang indefinitely
  - **Verify**:
    - CURRENT: Document if timeouts are configured
    - Check OpenRouterClient for timeout settings
    - FUTURE: Set timeout for OpenRouter calls (e.g., 60s)
    - FUTURE: If timeout exceeded, mark as failed
    - ROADMAP: Add timeout configuration to prevent hangs

### E2E Test 23: Database Operations Under Load
**Objective**: Verify database handles concurrent operations

- [ ] **E2E-23.1: Connection Pool Handling**
  - **Frontend Action**: Rapidly create 10 tasks in quick succession
  - **Backend Processing**:
    - Each request gets connection from pool
    - Connections returned after use
  - **Verify**:
    - All 10 tasks created successfully
    - No "connection pool exhausted" errors
    - Check database connection pool configuration
    - Connections properly closed (no leaks)
    - Subsequent operations work normally

- [ ] **E2E-23.2: Transaction Isolation**
  - **Frontend Action**: Create task and model simultaneously (simulate 2 concurrent users)
  - **Backend Processing**:
    - Each operation in own transaction
    - Transactions isolated from each other
  - **Verify**:
    - Both operations succeed
    - No race conditions
    - Auto-increment IDs unique and sequential
    - No data corruption
    - Both records in database with correct data

- [ ] **E2E-23.3: Long-Running Evaluation Transaction**
  - **Frontend Action**: Start evaluation with multiple tasks × models
  - **Backend Processing**:
    - Evaluation runs for several minutes
    - Database operations during execution
  - **Verify**:
    - Transaction doesn't timeout
    - Results committed to database progressively
    - Database doesn't lock up
    - Other operations (viewing tasks, etc.) work during evaluation
    - If backend crashes mid-eval, database remains consistent

### E2E Test 24: Evaluation Reproducibility & Versioning
**Objective**: Verify evaluations are reproducible and properly versioned

- [ ] **E2E-24.1: Eval Run Reproducibility**
  - **Frontend Action**: Run evaluation with specific task + model
  - **Backend Processing**:
    - Records task ID, model ID, config
    - Saves complete eval context
  - **Verify**:
    - Result metadata includes:
      - Task ID (can look up task details)
      - Model ID (can look up model config)
      - Timestamp (evaluated_at)
      - Grading criteria used (from task)
      - Model output captured
    - Can understand what was evaluated from result alone
    - Re-running with same task + model uses same grading logic
    - NOTE: LLM output may vary (non-deterministic)
    - NOTE: Grading outcome deterministic for same output

- [ ] **E2E-24.2: Task Versioning Limitations**
  - **Frontend Action**: Update task's expected_output, then re-run evaluation
  - **Backend Processing**:
    - Task updated in place (current implementation)
    - updated_at timestamp changes
  - **Verify**:
    - Task successfully updated
    - updated_at timestamp reflects change
    - Old evaluation results still reference same task_id
    - LIMITATION: Cannot distinguish which task version was used
    - DOCUMENT: Task history not preserved (current limitation)
    - ROADMAP: Add task versioning for reproducibility
    - RECOMMENDATION: Manual backup before major task changes

- [ ] **E2E-24.3: Evaluation Context Capture**
  - **Frontend Action**: View past evaluation result
  - **Backend Processing**:
    - EvalResult stores context fields
  - **Verify**:
    - Result includes:
      - task_id (can look up task details)
      - model_id (can look up model config)
      - model_output (LLM response - full text)
      - passed (boolean outcome)
      - score (numeric score 0.0-1.0)
      - metrics (JSON with grading details)
      - latency_ms (performance metric)
      - cost_usd (cost metric)
      - evaluated_at (timestamp)
    - Sufficient context to understand result
    - FUTURE: Store task input snapshot in result
    - FUTURE: Store expected output snapshot in result

### E2E Test 25: Grading Criteria Validation
**Objective**: Verify evaluation logic produces correct scores

- [ ] **E2E-25.1: Exact Match - Case Sensitivity**
  - **Frontend Action**: Create task with:
    - Expected Output: "positive"
    - Grading Criteria: "exact_match"
    - Run with model that returns various outputs
  - **Backend Processing**:
    - EvaluationEngine.evaluate() compares strings
  - **Verify**:
    - "positive" → passed=True, score=1.0 ✓
    - "Positive" → Check actual behavior (case-sensitive?)
    - "positive " (trailing space) → Check behavior
    - " positive" (leading space) → Check behavior
    - "POSITIVE" → Check behavior
    - Test with model or mock responses
    - DOCUMENT: Exact behavior of exact_match grading
    - DOCUMENT: Is it case-sensitive? Whitespace-sensitive?

- [ ] **E2E-25.2: Contains Match - Substring Logic**
  - **Frontend Action**: Create task with:
    - Expected Output: "positive"
    - Grading Criteria: "contains"
  - **Backend Processing**:
    - Check if expected substring in output
  - **Verify**:
    - "The sentiment is positive" → passed=True
    - "Positive outlook" → Check behavior (case-sensitive?)
    - "This is great" → passed=False (no "positive")
    - "positively wonderful" → Check behavior (substring match?)
    - DOCUMENT: Contains grading behavior
    - DOCUMENT: Case sensitivity, partial word matching

- [ ] **E2E-25.3: Empty/Null Output Handling**
  - **Frontend Action**: Simulate evaluation where model returns empty/null
  - **Backend Processing**:
    - Model returns: "" or null/None
    - Grading engine handles gracefully
  - **Verify**:
    - Empty string "" → Check behavior, should fail
    - Null/None → Check behavior, should fail
    - Error logged if unexpected response
    - Evaluation doesn't crash
    - Result marked appropriately (passed=False)
    - Error category set if applicable

- [ ] **E2E-25.4: Numeric Score Accuracy**
  - **Frontend Action**: Run evaluation, examine scores
  - **Backend Processing**:
    - Grading returns score between 0.0-1.0
    - Score stored in database
  - **Verify**:
    - Binary pass/fail: score is exactly 0.0 or 1.0
    - Score stored as FLOAT/DECIMAL type
    - Score precision preserved (e.g., 0.75 not rounded)
    - Frontend displays score with 2-3 decimal places
    - Score range validation: always in [0.0, 1.0]
    - No negative scores or scores > 1.0

- [ ] **E2E-25.5: Metrics JSON Structure**
  - **Frontend Action**: Run evaluation, examine metrics field
  - **Backend Processing**:
    - EvaluationEngine populates metrics dict
    - Serialized to JSON string in database
  - **Verify**:
    - Metrics field populated (not null)
    - Valid JSON structure
    - Consistent structure across evaluations
    - Example metrics content documented
    - Frontend can parse and display metrics
    - Metrics useful for debugging (e.g., shows why failed)
    - DOCUMENT: Standard metrics schema

### E2E Test 26: Error Analysis Support
**Objective**: Verify platform supports debugging and error analysis

- [ ] **E2E-26.1: Failed Evaluation Details**
  - **Frontend Action**: Run evaluation that fails (expected ≠ actual)
  - **Backend Processing**:
    - Grading returns passed=False
    - Captures detailed failure info
  - **Verify**:
    - Result includes:
      - Full model output (model_output field)
      - Expected output (from task)
      - passed=False
      - score=0.0 (or partial)
      - metrics explain why failed
    - Frontend displays failure clearly
    - Can see both expected and actual output
    - Can export failed cases for analysis
    - FUTURE: Show diff view (expected vs actual)

- [ ] **E2E-26.2: Error Categorization**
  - **Frontend Action**: Run evaluations, check error_category field
  - **Backend Processing**:
    - EvaluationEngine can set error_category
    - Optional field in EvalResult
  - **Verify**:
    - error_category field exists in schema
    - Can store categories like: "hallucination", "format_error", "refusal"
    - Null for passed evaluations
    - Populated for failed evaluations (if logic implemented)
    - Can filter results by error category
    - CURRENT: May be null/unused
    - FUTURE: Implement error categorization logic
    - ROADMAP: Add error category taxonomy

- [ ] **E2E-26.3: Comparison Mode**
  - **Frontend Action**: Run two evaluations, compare results
  - **Backend Processing**:
    - Fetch results for both runs
    - Frontend compares
  - **Verify**:
    - Can view results from two different runs
    - Can identify which tasks have different outcomes
    - CURRENT: Manual comparison by viewing separately
    - FUTURE: Built-in comparison view
    - FUTURE: Highlight regressions (was passing, now failing)
    - FUTURE: Highlight improvements (was failing, now passing)
    - ROADMAP: Add comparison dashboard feature

### E2E Test 27: Evaluation Dataset Quality
**Objective**: Verify platform supports high-quality evaluation datasets

- [ ] **E2E-27.1: Task Metadata Richness**
  - **Frontend Action**: Create task with metadata fields
  - **Backend Processing**:
    - Task includes: name, task_type, project, tags
    - Metadata supports categorization
  - **Verify**:
    - All metadata fields stored correctly
    - Can filter tasks by: task_type, project, tags
    - Tags support multiple values (array)
    - Project field enables grouping
    - FUTURE: Add difficulty, source, category fields
    - FUTURE: Support custom metadata (JSONB field)

- [ ] **E2E-27.2: Bulk Task Import**
  - **Frontend Action**: Import multiple tasks efficiently
  - **Backend Processing**:
    - Current: Create tasks one-by-one via API
  - **Verify**:
    - Can create multiple tasks via repeated API calls
    - Each task validated individually
    - CURRENT: No bulk import endpoint
    - FUTURE: POST /api/tasks/bulk endpoint
    - FUTURE: Accept JSON array of tasks
    - FUTURE: Atomic operation (all succeed or all fail)
    - ROADMAP: Add bulk import feature

- [ ] **E2E-27.3: Task Duplication Detection**
  - **Frontend Action**: Create task with similar/duplicate content
  - **Backend Processing**:
    - Current: No duplication check
  - **Verify**:
    - Tasks can have duplicate names (allowed)
    - Tasks can have duplicate inputs (allowed)
    - No automatic duplicate detection
    - CURRENT: User responsible for avoiding duplicates
    - FUTURE: Warn on duplicate detection
    - FUTURE: Check: "Similar task exists: ID=123"
    - ROADMAP: Add optional duplicate detection

---

## Enhancements to Existing Tests

### Enhancement to E2E-3.1: Document Synchronous Execution
Add to existing verification:
```markdown
- **Verify** (Additional):
  - Evaluation runs synchronously (blocking)
  - Response (202 Accepted) returns after evaluation completes
  - For small evaluations (<5 min), synchronous is acceptable
  - NOTE: Current implementation is synchronous
  - LIMITATION: Long evaluations may timeout
  - FUTURE: Implement async queue for scale (Celery/RQ/BullMQ)
  - ROADMAP: Add async evaluation for >10 tasks or >5 models
```

### Enhancement to E2E-10.2: Strengthen API Key Security
Add to existing verification:
```markdown
- **Verify** (Additional):
  - Check browser DevTools Network tab: no API key in requests
  - Check frontend source/bundle: no API key in compiled JS
  - Verify API key only in backend .env file
  - Test: Invalid API key returns error, key not exposed in message
  - Frontend never receives or handles API key
  - All LLM calls proxied through backend
```

### Enhancement to E2E-14.1: Document Grading Criteria Details
Expand exact_match test:
```markdown
- **Verify** (Enhanced):
  - Exact match: "positive" == "positive" → passed=True, score=1.0
  - Case sensitivity test: "Positive" vs "positive" → Document behavior
  - Whitespace test: "positive " vs "positive" → Document behavior
  - Special characters test: "café" vs "cafe" → Document behavior
  - DOCUMENT: exact_match is strict (specify case + whitespace rules)
  - DOCUMENT: How unicode/special characters handled
  - Add test cases for edge cases
```

### Enhancement to E2E-13.1: Add Evaluation Validation Step
Insert between step 4 and 5:
```markdown
  4.5. **Validate Evaluation Logic**:
       - Backend: Evaluation completed successfully
       - Frontend: View results
       - Manual spot-check: Review a few results
       - Verify: Model output looks reasonable
       - Verify: Grading outcome (passed/failed) makes sense
       - Verify: Score reflects actual match quality
       - CRITICAL: Validates eval methodology, not just API
       - Check: Does a passed evaluation actually look correct?
       - Check: Does a failed evaluation actually look wrong?
```

### Enhancement to E2E-15.1: Add Latency Bounds Validation
Expand latency verification:
```markdown
- **Verify** (Enhanced):
  - Latency > 0 ms (sanity check - positive integer)
  - Latency < 60,000 ms (should timeout before this)
  - Latency reasonable for model:
    - GPT-4: typically 2-10 seconds
    - GPT-4o-mini: typically 0.5-3 seconds
    - Claude: typically 1-5 seconds
  - Outliers investigation: latency > 30s needs debugging
  - FUTURE: Track latency percentiles (p50, p95, p99)
  - FUTURE: Alert on latency regressions
```

---

## Test Execution Instructions

### Running the Verification Checklist

1. **Start Backend**:
   ```bash
   cd backend
   source .env  # Or load environment variables
   uvicorn app.main:app --reload --port 8000
   ```

2. **Start Frontend** (in new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Verify Setup**:
   - Backend: http://localhost:8000/docs
   - Frontend: http://localhost:3000

4. **Execute Each Test**:
   - Work through checklist sequentially
   - Mark each item as you verify it passes
   - Document any failures with details
   - Re-test after fixing issues

5. **Automated Test Coverage**:
   - After manual verification, write automated tests for critical paths
   - Unit tests: Mock API responses, test hooks in isolation
   - Integration tests: Test actual API calls against running backend
   - E2E tests: Playwright headless tests for complete workflows

### Test Data Cleanup

After each test session, reset the database:
```bash
cd backend
rm evals.db  # Delete database
python -c "from app.database import Base, engine; Base.metadata.create_all(bind=engine)"  # Recreate
python scripts/seed_data.py  # Optional: Add seed data
```

---

## Test Suite Summary

### Test Categories Overview

**Original Tests (1-20): API Integration Fundamentals**
- Tests 1-6: CRUD operations and basic API functionality
- Tests 7-10: State management, UX, performance, security
- Tests 11-18: Database, type safety, state consistency, schemas
- Tests 19-20: Build verification and regression prevention

**New Tests (21-27): Platform Architecture & Eval Methodology**
- **Test 21**: Monitoring & Observability (logging, audit trails, cost tracking, health checks)
- **Test 22**: Provider Abstraction & Resilience (rate limits, timeouts, error handling)
- **Test 23**: Database Operations Under Load (connection pooling, transactions, concurrency)
- **Test 24**: Evaluation Reproducibility & Versioning (context capture, versioning strategy)
- **Test 25**: Grading Criteria Validation (exact match, contains, edge cases, metrics)
- **Test 26**: Error Analysis Support (failure details, error categories, comparison mode)
- **Test 27**: Evaluation Dataset Quality (metadata, bulk import, duplication detection)

### Priority Levels

**🔴 CRITICAL (Must Pass for MVP)**
- Tests 1-3: CRUD operations
- Test 4: Error handling
- Test 13: Complete user journey
- Test 21.3: Cost tracking accuracy
- Test 24.1: Eval reproducibility
- Test 25: Grading criteria validation

**🟡 HIGH (Important for Production)**
- Test 5: Results filtering
- Test 9: Performance
- Test 10: Security
- Test 21.1-21.2: Logging and audit trails
- Test 22: Provider resilience
- Test 26: Error analysis support

**🟢 MEDIUM (Quality of Life)**
- Test 6-8: Data integrity, cache management, loading states
- Test 23: Database under load
- Test 27: Dataset quality

**⚪ LOW (Future Enhancements)**
- Test 19-20: Build and regression (defer to deployment)
- Tests marked with "FUTURE" or "ROADMAP" (document for next iteration)

### Test Execution Strategy

1. **Phase 1: Core Functionality** (Tests 1-4, 13)
   - Verify CRUD works end-to-end
   - Run complete user journey
   - Validate error handling
   - **Estimated time**: 2-3 hours

2. **Phase 2: Evaluation Logic** (Tests 14, 21.3, 24, 25, 26)
   - Validate grading criteria behavior
   - Verify reproducibility
   - Test cost tracking
   - Ensure error analysis capability
   - **Estimated time**: 1-2 hours

3. **Phase 3: Platform Robustness** (Tests 5-12, 15-18, 21-23)
   - Performance testing
   - Security validation
   - Monitoring verification
   - Database operations
   - **Estimated time**: 2-3 hours

4. **Phase 4: Advanced Features** (Tests 27, enhancements)
   - Dataset quality features
   - Apply all enhancements
   - Document limitations and roadmap
   - **Estimated time**: 1 hour

### Documentation Requirements

For each test, document:
- ✅ **PASS**: Test passed, system behaves as expected
- ⚠️ **PASS WITH NOTES**: Test passed, but document limitations or future improvements
- ❌ **FAIL**: Test failed, needs fixing before production
- 📋 **NOT IMPLEMENTED**: Feature not yet built, documented in roadmap

### Expert Review Notes

**From LLM Evaluation Platform Architect:**
- Added Tests 21-23 to ensure platform reliability, monitoring, and scalability
- Focus on production-readiness: logging, cost tracking, resilience
- Documents current limitations and future architecture improvements

**From AI Evals Methodology Expert:**
- Added Tests 24-27 to ensure evaluation quality and reproducibility
- Emphasis on grading criteria validation and error analysis
- Follows Hamel's principles: real data, reproducibility, error analysis first
- Documents evaluation methodology gaps for future iteration

### Success Criteria for Ticket Completion

- [ ] All CRITICAL tests pass (Tests 1-4, 13, 21.3, 24.1, 25)
- [ ] All HIGH priority tests pass or documented as future work
- [ ] Evaluation logic validated (grading criteria work correctly)
- [ ] Cost tracking accurate (within 1%)
- [ ] Error handling comprehensive (no crashes, clear error messages)
- [ ] Documentation complete (current behavior + roadmap)
- [ ] Platform supports error analysis workflow
- [ ] Results are reproducible (can re-run and understand outcomes)

---

## Links & References
- React Query Documentation: https://tanstack.com/query/latest
- API Integration: See API design in specification
- Related tickets: Ticket 1 (UI), Ticket 3 (Backend)
- Specification: `/spec.md` (API Design section)
- FastAPI Testing: https://fastapi.tiangolo.com/tutorial/testing/
- Hamel's Evals Guide: Referenced in evaluation methodology tests
- Platform Architecture Best Practices: Referenced in monitoring/observability tests
