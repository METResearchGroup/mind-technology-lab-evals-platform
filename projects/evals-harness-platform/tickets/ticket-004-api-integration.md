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

## Links & References
- React Query Documentation: https://tanstack.com/query/latest
- API Integration: See API design in specification
- Related tickets: Ticket 1 (UI), Ticket 3 (Backend)
- Specification: `/spec.md` (API Design section)
