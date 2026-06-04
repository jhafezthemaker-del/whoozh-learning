import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/auth/session', () => {
    // By default return a logged-out state
    return HttpResponse.json({ session: null })
  }),
]
