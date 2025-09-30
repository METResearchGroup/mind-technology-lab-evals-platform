/**
 * API Integration Tests
 * Tests that components correctly integrate with the API through React Query
 */

import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ViewTasksTab } from '@/components/tabs/ViewTasksTab';
import { ViewModelsTab } from '@/components/tabs/ViewModelsTab';

// Create a new QueryClient for each test to ensure clean state
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries in tests
    },
  },
});

describe('API Integration Tests', () => {
  describe('ViewTasksTab', () => {
    it('fetches and displays tasks from API', async () => {
      const queryClient = createTestQueryClient();

      render(
        <QueryClientProvider client={queryClient}>
          <ViewTasksTab />
        </QueryClientProvider>
      );

      // Should show loading state initially
      expect(screen.getByText(/loading tasks/i)).toBeInTheDocument();

      // Wait for tasks to load
      await waitFor(() => {
        expect(screen.getByText('Test Classification Task')).toBeInTheDocument();
      });

      // Verify task details are displayed
      expect(screen.getByText(/test task for classification/i)).toBeInTheDocument();
      expect(screen.getByText('math')).toBeInTheDocument();
      expect(screen.getByText('test')).toBeInTheDocument();
    });

    it('handles API errors gracefully', async () => {
      const queryClient = createTestQueryClient();

      // Import server to modify handlers
      const { server } = await import('@/mocks/server');
      const { http, HttpResponse } = await import('msw');

      // Override handler to return error
      server.use(
        http.get('*/api/tasks', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      render(
        <QueryClientProvider client={queryClient}>
          <ViewTasksTab />
        </QueryClientProvider>
      );

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText(/failed to load tasks/i)).toBeInTheDocument();
      });
    });
  });

  describe('ViewModelsTab', () => {
    it('fetches and displays models from API', async () => {
      const queryClient = createTestQueryClient();

      render(
        <QueryClientProvider client={queryClient}>
          <ViewModelsTab />
        </QueryClientProvider>
      );

      // Should show loading state initially
      expect(screen.getByText(/loading models/i)).toBeInTheDocument();

      // Wait for models to load
      await waitFor(() => {
        expect(screen.getByText('openai/gpt-4o-mini')).toBeInTheDocument();
      });

      // Verify model details are displayed
      expect(screen.getByText('openrouter')).toBeInTheDocument();
    });

    it('handles empty models list', async () => {
      const queryClient = createTestQueryClient();

      // Import server to modify handlers
      const { server } = await import('@/mocks/server');
      const { http, HttpResponse } = await import('msw');

      // Override handler to return empty array
      server.use(
        http.get('*/api/models', () => {
          return HttpResponse.json([]);
        })
      );

      render(
        <QueryClientProvider client={queryClient}>
          <ViewModelsTab />
        </QueryClientProvider>
      );

      // Should show empty state after loading
      await waitFor(() => {
        expect(screen.getByText(/models \(0\)/i)).toBeInTheDocument();
      });
    });
  });
});
