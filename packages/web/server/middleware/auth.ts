/**
 * Server-side Auth Middleware
 * Uses @nuxtjs/supabase serverSupabaseUser() to read the session from cookies.
 * This handles chunked cookies automatically (modern Supabase SDKs split
 * large session tokens across multiple cookies like sb-xxx-auth-token.0, .1, etc.)
 */

import { serverSupabaseUser } from '#supabase/server'

declare module 'h3' {
  interface H3EventContext {
    user?: {
      id: string
      email: string
      [key: string]: any
    }
  }
}

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const publicRoutes = ['/api/auth/setup', '/api/health']

  if (publicRoutes.some(route => url.pathname.startsWith(route))) {
    return
  }

  if (!url.pathname.startsWith('/api/')) {
    return
  }

  try {
    const user = await serverSupabaseUser(event)

    if (user) {
      event.context.user = {
        id: user.id,
        email: user.email!,
        ...user.user_metadata,
      }
    }
  } catch (error: any) {
    // "Auth session missing!" is expected for unauthenticated requests — suppress it
    const msg = error?.cause?.statusMessage ?? error?.message ?? ''
    if (!msg.includes('Auth session missing')) {
      console.warn('[server/middleware/auth] Could not verify session:', error)
    }
  }
})

