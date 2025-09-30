# Evals Harness Platform - Frontend

A comprehensive LLM evaluation dashboard built with Next.js 14, TypeScript, and Tailwind CSS v3.

## 🚀 Features

- **5 Core Tabs**: Evaluate, Add Task, View Tasks, Add Model, Review Performance
- **Real-time Dashboard**: Live metrics and performance monitoring
- **Task Management**: Create, edit, and manage evaluation tasks
- **Model Configuration**: Add and configure LLM models with different providers
- **Performance Analytics**: Detailed performance analysis and error categorization
- **Responsive Design**: Mobile-first approach with full responsive support
- **Accessibility**: WCAG 2.1 AA compliance
- **Error Boundaries**: Comprehensive error handling and recovery

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3 with custom design tokens
- **UI Components**: shadcn/ui with Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Query for server state
- **Icons**: Lucide React
- **Testing**: Jest, React Testing Library, Playwright

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run end-to-end tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

## 🎨 Design System

### Color Palette
- **Success**: Green for pass/success states
- **Error**: Red for fail/error states  
- **Warning**: Yellow for warnings
- **Info**: Blue for informational content

### Typography
- **Primary Font**: Geist Sans
- **Monospace Font**: Geist Mono

### Components
All components follow the shadcn/ui design system with custom evaluation platform styling.

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── globals.css        # Global styles and design tokens
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main dashboard page
├── components/            # React components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   ├── tabs/             # Tab components
│   ├── tables/           # Table components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility functions
│   ├── data.ts           # Data loading utilities
│   └── utils.ts          # General utilities
└── types/                 # TypeScript type definitions
    └── index.ts           # Main type definitions
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Tailwind Configuration
The project uses Tailwind CSS v4 with inline theme configuration in `globals.css`.

## 📊 Data Flow

1. **Dummy Data**: Currently uses static JSON files in `public/data/`
2. **Data Loading**: Async functions in `lib/data.ts` simulate API calls
3. **State Management**: React Query for server state, React hooks for local state
4. **Form Handling**: React Hook Form with Zod validation schemas

## 🚀 Deployment

The application is ready for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

## 🧩 Key Components

### DashboardLayout
- Header with platform branding
- Metrics overview cards
- Responsive navigation
- Error boundary integration

### TaskForm
- Comprehensive task creation form
- Real-time validation
- Tag management
- Dynamic field visibility

### EvaluateTab
- Task and model selection
- Evaluation execution simulation
- Progress tracking
- Recent results display

### ViewTasksTab
- Task listing with filtering
- Search functionality
- Bulk operations
- Summary statistics

### ReviewPerformanceTab
- Performance analytics
- Model comparison
- Error analysis
- Export functionality

## 🔍 Testing Strategy

- **Unit Tests**: Component and utility function testing
- **Integration Tests**: Form submission and data flow
- **E2E Tests**: Full user journey testing with Playwright
- **Coverage Target**: >90% line coverage

## 🎯 Performance

- **Bundle Size**: Optimized with Next.js automatic code splitting
- **Loading**: Simulated network delays for realistic testing
- **Responsive**: Mobile-first design with breakpoint optimization
- **Accessibility**: Full keyboard navigation and screen reader support

## 🔒 Security

- **Input Validation**: Zod schemas for all form inputs
- **Error Handling**: Comprehensive error boundaries
- **API Security**: Prepared for secure API integration
- **Content Security**: XSS protection with React's built-in sanitization

## 📈 Future Enhancements

- [ ] Real API integration
- [ ] User authentication
- [ ] Real-time evaluation execution
- [ ] Advanced analytics dashboard
- [ ] Export functionality
- [ ] Dark mode support
- [ ] Internationalization

## 🤝 Contributing

1. Follow the existing code style
2. Write tests for new features
3. Ensure accessibility compliance
4. Update documentation as needed

## 📄 License

This project is part of the Evals Harness Platform.