import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mocks/server'

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Reset handlers after each test (critical for test isolation)
afterEach(() => server.resetHandlers())

// Clean up server after all tests
afterAll(() => server.close())
