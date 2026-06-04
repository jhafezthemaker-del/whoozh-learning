import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Header from '@/components/header'
import { http, HttpResponse } from 'msw'
import { server } from './mocks/server'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    prefetch: vi.fn(),
    replace: vi.fn(),
  }),
}))

// Mock logoutAction
vi.mock('@/app/actions/auth', () => ({
  logoutAction: vi.fn(),
}))

import { logoutAction } from '@/app/actions/auth'

describe('Header Integration Test', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render Sign in and Sign up buttons when user is logged out (session is null)', async () => {
    server.use(
      http.get('/api/auth/session', () => {
        return HttpResponse.json({ session: null })
      })
    )

    render(<Header />)

    // Wait for the UI state to update after fetch resolves
    await waitFor(() => {
      expect(screen.getByText('Sign in')).toBeInTheDocument()
      expect(screen.getByText('Sign up')).toBeInTheDocument()
    })

    expect(screen.queryByText('Logout')).not.toBeInTheDocument()
  })

  it('should render user profile info and logout button when user is logged in', async () => {
    const mockSession = {
      user_id: 'user-123',
      email: 'john@example.com',
      name: 'John Doe',
      image: null,
    }

    server.use(
      http.get('/api/auth/session', () => {
        return HttpResponse.json({ session: mockSession })
      })
    )

    render(<Header />)

    // Wait for session data to load and display the user's name
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })

    // Guest buttons should not be present
    expect(screen.queryByText('Sign in')).not.toBeInTheDocument()
    expect(screen.queryByText('Sign up')).not.toBeInTheDocument()
  })

  it('should call logoutAction and redirect to login page when logout is clicked', async () => {
    const mockSession = {
      user_id: 'user-123',
      email: 'john@example.com',
      name: 'John Doe',
      image: null,
    }

    server.use(
      http.get('/api/auth/session', () => {
        return HttpResponse.json({ session: mockSession })
      })
    )

    vi.mocked(logoutAction).mockResolvedValue()

    render(<Header />)

    // Wait for the user profile to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    // Find and click the logout button using its title
    const logoutBtn = screen.getByTitle('Logout')
    expect(logoutBtn).toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(logoutBtn)

    // Verify logoutAction was called
    expect(logoutAction).toHaveBeenCalledTimes(1)

    // Verify redirection to /auth/login
    expect(mockPush).toHaveBeenCalledWith('/auth/login')
  })
})
