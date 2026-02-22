/**
 * Server-side Auth Middleware (Middleware de autenticación del lado del servidor)
 * File: server/middleware/auth.ts
 * 
 * Nitro server middleware runs on EVERY request to the server (all /api/* routes).
 * Unlike client-side middleware (which guards page navigation), this guards API routes.
 * 
 * WHAT IT DOES:
 * 1. Reads the Supabase session cookie from the request
 * 2. Validates it with Supabase (to prevent forged tokens)
 * 3. Injects the verified user into event.context.user
 * 4. API handlers can then access event.context.user without re-verifying each time
 * 
 * IMPORTANT: This middleware does NOT block unauthorized requests — it just enriches
 * the context. Individual API handlers are responsible for checking event.context.user
 * and throwing 401 errors if the user is not authenticated.
 * 
 * (El middleware de servidor Nitro corre en CADA solicitud al servidor (/api/* routes).
 *  A diferencia del middleware del lado del cliente (que guarda la navegación de páginas),
 *  este guarda las rutas API.
 *  
 *  QUÉ HACE:
 *  1. Lee la cookie de sesión de Supabase de la solicitud
 *  2. La valida con Supabase (para prevenir tokens falsificados)
 *  3. Inyecta el usuario verificado en event.context.user
 *  4. Los manejadores de API pueden acceder a event.context.user sin re-verificar)
 */

import { createClient } from '@supabase/supabase-js'

// TypeScript declaration merging: tell Nuxt/H3 about our custom context property
// (Combinación de declaración TypeScript: informar a Nuxt/H3 sobre nuestra prop de contexto)
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
  // Skip auth injection for public routes (Omitir inyección de auth para rutas públicas)
  const url = getRequestURL(event)
  const publicRoutes = ['/api/auth/setup', '/api/health']

  if (publicRoutes.some(route => url.pathname.startsWith(route))) {
    return // Skip middleware for these routes (Omitir middleware para estas rutas)
  }

  // Only process /api/* routes (Solo procesar rutas /api/*)
  if (!url.pathname.startsWith('/api/')) {
    return
  }

  const config = useRuntimeConfig()

  // getCookie reads the HTTP cookie from the incoming request
  // Supabase stores the session as 'sb-<project_ref>-auth-token'
  // @nuxtjs/supabase handles setting this cookie on the client side
  // (getCookie lee la cookie HTTP de la solicitud entrante)
  // (Supabase guarda la sesión como 'sb-<project_ref>-auth-token')
  const cookieString = getHeader(event, 'cookie') || ''

  if (!cookieString) {
    return // No cookie, no user — but don't block yet
  }

  try {
    // Create an admin/server-only Supabase client
    // (Crear un cliente Supabase solo para admin/servidor)
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Parse access token from the Supabase auth cookie
    // The cookie name follows this pattern: sb-{project_ref}-auth-token
    // (Parsear token de acceso de la cookie de auth de Supabase)
    const supabaseCookiePattern = /sb-[^-]+-auth-token=([^;]+)/
    const match = cookieString.match(supabaseCookiePattern)

    if (!match) return

    let tokenData: any
    try {
      // The cookie value is URL-encoded base64 JSON
      // (El valor de la cookie es JSON base64 codificado en URL)
      tokenData = JSON.parse(decodeURIComponent(match[1]))
    } catch {
      // Try alternative: some versions store it differently
      // (Intentar alternativa: algunas versiones lo almacenan diferente)
      return
    }

    const accessToken = tokenData?.access_token
    if (!accessToken) return

    // Verify the JWT token with Supabase (Verificar el token JWT con Supabase)
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (!error && user) {
      // Inject the verified user into the event context
      // Now ANY subsequent handler in this request can access event.context.user
      // (Inyectar el usuario verificado en el contexto del evento)
      // (Ahora CUALQUIER manejador subsiguiente puede acceder a event.context.user)
      event.context.user = {
        id: user.id,
        email: user.email!,
        ...user.user_metadata,
      }
    }
  } catch (error) {
    // Authentication errors here are non-fatal — we just don't inject the user
    // The API route will throw 401 if it requires authentication
    // (Los errores de autenticación aquí no son fatales — simplemente no inyectamos el usuario)
    console.warn('[server/middleware/auth] Could not verify session:', error)
  }
})
