import { cn } from '@/lib/utils'
import { createBlock } from '@/lib/blocks'

describe('cn utility', () => {
  it('should merge tailwind classes correctly', () => {
    expect(cn('px-2 py-2', 'p-4')).toBe('p-4')
  })

  it('should handle conditional classes', () => {
    expect(cn('px-2', true && 'py-2', false && 'm-2')).toBe('px-2 py-2')
  })
})

describe('createBlock utility', () => {
  it('should create a block with default values', () => {
    const block = createBlock()
    expect(block.type).toBe('text')
    expect(block.content).toBe('')
    expect(block.checked).toBe(false)
    expect(block.id).toBeDefined()
    expect(typeof block.id).toBe('string')
    expect(block.id.length).toBeGreaterThan(0)
  })

  it('should create a block with custom type and content', () => {
    const block = createBlock('heading', 'Hello World')
    expect(block.type).toBe('heading')
    expect(block.content).toBe('Hello World')
  })

  it('should use provided id if available', () => {
    const customId = 'custom-id-123'
    const block = createBlock('text', '', customId)
    expect(block.id).toBe(customId)
  })
})
