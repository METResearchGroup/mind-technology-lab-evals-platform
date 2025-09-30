import { loadTasks, loadModels, loadResults, calculatePassRate, calculateTotalCost } from '@/lib/data'

// Mock fetch
global.fetch = jest.fn()

describe('Data utilities', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  describe('loadTasks', () => {
    it('loads tasks successfully', async () => {
      const mockTasks = [
        { id: 1, name: 'Test Task', task_type: 'classification' }
      ]
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasks,
      })
      
      const result = await loadTasks()
      
      expect(fetch).toHaveBeenCalledWith('/data/tasks.json')
      expect(result).toEqual(mockTasks)
    })

    it('handles fetch errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))
      
      await expect(loadTasks()).rejects.toThrow('Failed to load tasks')
    })
  })

  describe('calculatePassRate', () => {
    it('calculates pass rate correctly', () => {
      const results = [
        { passed: true },
        { passed: true },
        { passed: false },
        { passed: true },
      ]
      
      expect(calculatePassRate(results)).toBe(0.75)
    })

    it('returns 0 for empty results', () => {
      expect(calculatePassRate([])).toBe(0)
    })
  })

  describe('calculateTotalCost', () => {
    it('calculates total cost correctly', () => {
      const results = [
        { cost_usd: 0.1 },
        { cost_usd: 0.2 },
        { cost_usd: 0.05 },
      ]
      
      expect(calculateTotalCost(results)).toBe(0.35)
    })

    it('returns 0 for empty results', () => {
      expect(calculateTotalCost([])).toBe(0)
    })
  })
})
