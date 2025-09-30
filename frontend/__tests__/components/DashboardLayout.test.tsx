import { render, screen } from '@testing-library/react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

const mockMetrics = {
  overall_pass_rate: 0.85,
  pass_rate_trend: 0.05,
  critical_failures: 2,
  cost_today: 12.50,
  cost_budget: 50.00,
}

describe('DashboardLayout', () => {
  it('renders the dashboard header', () => {
    render(
      <DashboardLayout metrics={mockMetrics}>
        <div>Test content</div>
      </DashboardLayout>
    )
    
    expect(screen.getByText('Evals Harness Platform')).toBeInTheDocument()
    expect(screen.getByText('LLM Evaluation Dashboard')).toBeInTheDocument()
    expect(screen.getByText('DUMMY DATA')).toBeInTheDocument()
  })

  it('displays metrics correctly', () => {
    render(
      <DashboardLayout metrics={mockMetrics}>
        <div>Test content</div>
      </DashboardLayout>
    )
    
    expect(screen.getByText('85.0%')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('$12.50')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(
      <DashboardLayout metrics={mockMetrics}>
        <div data-testid="test-content">Test content</div>
      </DashboardLayout>
    )
    
    expect(screen.getByTestId('test-content')).toBeInTheDocument()
  })
})
