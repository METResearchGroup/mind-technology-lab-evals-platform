# Ticket 1: Create Basic Stateless UI with Dummy Data

## Context & Motivation
This ticket establishes the foundation for the evals harness platform by creating a working Next.js frontend with dummy data. This allows immediate testing of UI components and user flows before backend integration, enabling rapid iteration on the interface design.

## Detailed Description & Requirements

#### Functional Requirements:
- Create Next.js 14 project with TypeScript and Tailwind CSS v3
- Implement 5 core tabs: Evaluate, Add Task, View Tasks, Add Model, Review Performance
- Load dummy data from JSON files (clearly marked as dummy data)
- Implement responsive design for desktop and mobile
- Add form validation and error handling

#### Non-Functional Requirements:
- Performance: Page load <2 seconds
- Accessibility: WCAG 2.1 AA compliance
- Browser support: Chrome, Firefox, Safari latest versions

#### Validation & Error Handling:
- Form validation with clear error messages
- Loading states for all async operations
- Error boundaries for component failures

## Success Criteria
- All 5 tabs render correctly with dummy data
- Forms accept input and show validation feedback
- UI is responsive across different screen sizes
- Dummy data is clearly marked and easily replaceable
- Code is reviewed and follows TypeScript best practices

## Test Plan

### Unit Tests
- `test_tab_navigation`: All tabs load without errors
  - **Input**: Click on each tab
  - **Expected Result**: Tab content renders correctly, no console errors
  - **Test Type**: Component unit test
  - **Coverage Target**: 100% of tab navigation logic

- `test_form_validation`: Forms show appropriate validation messages
  - **Input**: Submit forms with invalid data (empty fields, invalid formats)
  - **Expected Result**: Clear error messages displayed, form submission blocked
  - **Test Type**: Component unit test with React Testing Library
  - **Coverage Target**: 100% of validation logic

- `test_dummy_data_loading`: JSON data loads correctly
  - **Input**: Load dummy data from `public/data/` directory
  - **Expected Result**: Data renders in UI components without errors
  - **Test Type**: Component unit test
  - **Coverage Target**: 100% of data loading logic

### Integration Tests
- `test_responsive_design`: UI works on mobile and desktop
  - **Input**: Render components at different screen sizes (320px, 768px, 1024px, 1920px)
  - **Expected Result**: Layout adapts correctly, no horizontal scroll, text remains readable
  - **Test Type**: Integration test with Playwright (headless)
  - **Coverage Target**: All responsive breakpoints

- `test_error_boundaries`: Error boundaries catch component failures
  - **Input**: Simulate component errors (throw error in child component)
  - **Expected Result**: Error boundary displays fallback UI, error logged
  - **Test Type**: Integration test
  - **Coverage Target**: All error boundary implementations

### End-to-End Tests (Headless)
- `test_complete_user_flow`: Full user journey through all tabs
  - **Input**: Navigate through all 5 tabs, interact with forms
  - **Expected Result**: All interactions work, no JavaScript errors
  - **Test Type**: E2E test with Playwright (headless mode)
  - **Coverage Target**: Critical user paths

### CI/CD Compatibility Requirements
- **No Browser Dependencies**: All tests must run in headless mode
- **No GUI Access**: Tests must not require desktop environment
- **Build Verification**: `npm run build` must pass without errors
- **Linting**: Prettier formatting and ESLint checks must pass
- **TypeScript**: All TypeScript compilation errors must be resolved

### Test Coverage Requirements
- **Line Coverage**: >90% for all components
- **Branch Coverage**: >80% for conditional logic
- **Function Coverage**: 100% for all exported functions
- **Component Coverage**: 100% for all React components

### Test File Structure
```
__tests__/
├── components/
│   ├── ui/
│   │   ├── TabNavigation.test.tsx
│   │   └── ErrorBoundary.test.tsx
│   ├── forms/
│   │   ├── TaskForm.test.tsx
│   │   └── ModelForm.test.tsx
│   └── tables/
│       └── ResultsTable.test.tsx
├── pages/
│   ├── Evaluate.test.tsx
│   ├── AddTask.test.tsx
│   ├── ViewTasks.test.tsx
│   ├── AddModel.test.tsx
│   └── ReviewPerformance.test.tsx
├── integration/
│   ├── responsive-design.test.ts
│   └── error-boundaries.test.ts
└── e2e/
    └── user-flow.test.ts
```

### Pre-commit Hook Setup
- **Prettier**: Automatic code formatting
- **ESLint**: Code quality and style enforcement
- **TypeScript**: Compilation error checking
- **Build Check**: `npm run build` must pass
- **Test Suite**: All tests must pass before commit

### Expected Results Validation
- **Tab Navigation**: Each tab should render its specific content without errors
- **Form Validation**: Error messages should be clear and actionable
- **Responsive Design**: Layout should adapt smoothly across all breakpoints
- **Dummy Data**: All sample data should load and display correctly
- **Error Handling**: Graceful degradation when components fail

## Dependencies
- Requires: Node.js 18+, npm/yarn
- Requires: Next.js 14, TypeScript, Tailwind CSS v3
- Requires: React Hook Form, Zod validation
- Requires: React Testing Library, Playwright (headless), Jest
- Requires: Prettier, ESLint for code quality

## Suggested Implementation Plan
- Initialize Next.js project with TypeScript template
- Install and configure Tailwind CSS v3
- Create component structure: `components/ui/`, `components/forms/`, `components/tables/`
- Implement tab navigation with React state
- Create dummy JSON files in `public/data/` directory
- Implement form components with validation
- Add responsive design with Tailwind utilities

## Effort Estimate
- Estimated effort: **3 hours**
- Assumes familiarity with Next.js and TypeScript
- Includes setup, component creation, and basic styling

## Priority & Impact
- Priority: **High**
- Rationale: Foundation for all other development work

## Acceptance Checklist
- [ ] Next.js project initialized with TypeScript
- [ ] Tailwind CSS v3 configured
- [ ] All 5 tabs implemented and functional
- [ ] Dummy data loaded from JSON files
- [ ] Forms have validation and error handling
- [ ] Responsive design implemented
- [ ] Pre-commit hooks configured (Prettier, ESLint, build check)
- [ ] Test coverage >90% line coverage, >80% branch coverage
- [ ] All tests pass in CI environment (headless)
- [ ] `npm run build` passes without errors
- [ ] Code reviewed and follows TypeScript best practices
- [ ] Playwright E2E tests implemented and passing

## Links & References
- Specification: `/spec.md`
- UI Requirements: Frontend Stack section in spec
- Dummy Data Structure: See data model in spec
