import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskForm } from '@/components/forms/TaskForm'

const mockOnSubmit = jest.fn()

describe('TaskForm', () => {
  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it('renders all form fields', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />)
    
    expect(screen.getByLabelText(/task name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/project/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/input/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/expected output/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/ground truth/i)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<TaskForm onSubmit={mockOnSubmit} />)
    
    const submitButton = screen.getByRole('button', { name: /save task/i })
    await user.click(submitButton)
    
    expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    expect(screen.getByText(/input is required/i)).toBeInTheDocument()
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    render(<TaskForm onSubmit={mockOnSubmit} />)
    
    await user.type(screen.getByLabelText(/task name/i), 'Test Task')
    await user.type(screen.getByLabelText(/input/i), 'Test input')
    
    const submitButton = screen.getByRole('button', { name: /save task/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Task',
          input: 'Test input',
        })
      )
    })
  })

  it('allows adding and removing tags', async () => {
    const user = userEvent.setup()
    render(<TaskForm onSubmit={mockOnSubmit} />)
    
    const tagInput = screen.getByPlaceholderText(/add tag/i)
    await user.type(tagInput, 'test-tag')
    await user.keyboard('{Enter}')
    
    expect(screen.getByText('test-tag')).toBeInTheDocument()
    
    const removeButton = screen.getByRole('button', { name: /remove test-tag/i })
    await user.click(removeButton)
    
    expect(screen.queryByText('test-tag')).not.toBeInTheDocument()
  })
})
