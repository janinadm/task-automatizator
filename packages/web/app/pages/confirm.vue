<!--
  OAuth Callback / Email Confirm Page (Página de confirmación de OAuth / Email)
  Route: /confirm
  Layout: auth

  This page handles TWO different scenarios:
  1. Google OAuth callback: After user approves Google, they're sent here.
     Supabase has already exchanged the OAuth code for a session token.
     We just need to check if this is a new user and create Prisma records if so.
  
  2. Email confirmation: If Supabase email verification is enabled, the user
     clicks the link in their email and lands here.
     The URL will contain a token that Supabase processes automatically.

  HOW SUPABASE HANDLES THE CALLBACK:
  The @nuxtjs/supabase module listens for URL hash changes and auth state events.
  When the user arrives here after OAuth, Supabase fires `SIGNED_IN` event with
  the new session. We listen for it and redirect to /dashboard.

  (Esta página maneja DOS escenarios:
   1. Callback de Google OAuth: Después de que el usuario aprueba Google.
      Supabase ya intercambió el código OAuth por un token de sesión.
      Solo necesitamos verificar si es un usuario nuevo y crear registros Prisma.
   2. Confirmación de email: El usuario hace clic en el enlace de su email.
      La URL contiene un token que Supabase procesa automáticamente.)
-->
<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const supabase = useSupabaseClient()
const router = useRouter()
const route = useRoute()

const status = ref<'loading' | 'success' | 'error'>('loading')
const message = ref('Verifying your account...')

/**
 * Check if a user already has Prisma records (organization + user row).
 * If not (new OAuth signup), we create them via /api/auth/setup.
 * 
 * (Verifica si un usuario ya tiene registros Prisma (org + user row).
 *  Si no (nuevo registro OAuth), los creamos vía /api/auth/setup.)
 */
async function ensurePrismaUserExists(authUser: any) {
  try {
    // Try to verify the user exists in our DB — if not, create records
    // (Intentar verificar que el usuario existe en nuestra BD — si no, crear registros)
    const { data: existingUser } = await $fetch(`/api/users/me`, {
      method: 'GET',
    }).catch(() => ({ data: null }))

    // User doesn't exist in Prisma — this is their first OAuth login
    // (El usuario no existe en Prisma — este es su primer login OAuth)
    if (!existingUser) {
      const fullName = authUser.user_metadata?.full_name
        || authUser.user_metadata?.name
        || authUser.email?.split('@')[0]
        || 'New User'

      // Generate an org name from their Google name or email
      // (Generar un nombre de org de su nombre de Google o email)
      const orgName = authUser.user_metadata?.organization_name
        || `${fullName}'s Agency`

      await $fetch('/api/auth/setup', {
        method: 'POST',
        body: {
          userId: authUser.id,
          email: authUser.email,
          fullName,
          organizationName: orgName,
        },
      })
    }
  } catch (e) {
    // Non-critical error: user can still proceed; records may already exist
    // (Error no crítico: el usuario puede continuar; los registros pueden ya existir)
    console.warn('[confirm] Could not verify/create Prisma user:', e)
  }
}

// onMounted runs once the component is in the DOM — good for auth checks
// (onMounted se ejecuta una vez que el componente está en el DOM — bueno para verificaciones de auth)
onMounted(async () => {
  // Check if there's an error from Supabase in the URL query params
  // (Verificar si hay un error de Supabase en los parámetros de la URL)
  if (route.query.error) {
    status.value = 'error'
    message.value = String(route.query.error_description || 'Authentication failed. Please try again.')
    return
  }

  // Listen for Supabase auth state changes
  // onAuthStateChange is an event listener that fires when the session changes
  // In OAuth flow: fires when Supabase exchanges the URL code for a session
  // (Escuchar cambios de estado de auth de Supabase)
  // (onAuthStateChange es un listener de eventos que se dispara cuando cambia la sesión)
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      message.value = 'Setting up your workspace...'
      await ensurePrismaUserExists(session.user)
      status.value = 'success'
      message.value = 'All set! Redirecting to your dashboard...'

      // Wait a brief moment so user can see the success message
      // (Esperar un momento breve para que el usuario vea el mensaje de éxito)
      setTimeout(async () => {
        await router.push('/dashboard')
      }, 1200)
    }

    // Email verified flow (flujo de verificación de email)
    if (event === 'USER_UPDATED' && session?.user) {
      status.value = 'success'
      message.value = 'Email confirmed! Redirecting to your dashboard...'
      setTimeout(async () => {
        await router.push('/dashboard')
      }, 1200)
    }
  })

  // Check if user is already logged in (e.g., page refresh)
  // (Verificar si el usuario ya está logueado — por ejemplo, actualización de página)
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    await ensurePrismaUserExists(session.user)
    status.value = 'success'
    message.value = 'Welcome back! Redirecting...'
    setTimeout(async () => {
      await router.push('/dashboard')
    }, 800)
  }

  // If no session and no auth event after 10s, something went wrong
  // (Si no hay sesión y no hay evento de auth después de 10s, algo salió mal)
  setTimeout(() => {
    if (status.value === 'loading') {
      status.value = 'error'
      message.value = 'Verification timed out. Please try logging in again.'
      // subscription.unsubscribe() — clean up the listener
      subscription.unsubscribe()
    }
  }, 10000)
})
</script>

<template>
  <UiGlassCard padding="lg" class="text-center">
    <!-- Loading state (Estado de carga) -->
    <div v-if="status === 'loading'" class="animate-fade-in">
      <div class="w-16 h-16 mx-auto mb-6 relative">
        <!-- Animated spinner ring (Anillo giratorio animado) -->
        <div class="absolute inset-0 rounded-full border-4 border-white/10" />
        <div class="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
        <!-- Inner icon (Ícono interior) -->
        <div class="absolute inset-2 rounded-full bg-indigo-500/20 flex items-center justify-center">
          <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      </div>
      <h2 class="text-xl font-bold text-white mb-2">Authenticating</h2>
      <p class="text-white/60 text-sm">{{ message }}</p>
    </div>

    <!-- Success state (Estado de éxito) -->
    <div v-else-if="status === 'success'" class="animate-fade-in">
      <div class="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
        <svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 class="text-xl font-bold text-white mb-2">You're in!</h2>
      <p class="text-white/60 text-sm">{{ message }}</p>
    </div>

    <!-- Error state (Estado de error) -->
    <div v-else class="animate-fade-in">
      <div class="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
        <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h2 class="text-xl font-bold text-white mb-2">Something went wrong</h2>
      <p class="text-white/60 text-sm mb-6">{{ message }}</p>
      <NuxtLink to="/login" class="btn-primary inline-flex">
        Back to Login
      </NuxtLink>
    </div>
  </UiGlassCard>
</template>
