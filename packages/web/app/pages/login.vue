<!--
  Login Page (Página de inicio de sesión)
  Route: /login
  Layout: auth (the gradient background)

  Supports two authentication methods:
  1. Email + Password (most common)
  2. Google OAuth (one-click login via Supabase)

  HOW SUPABASE AUTH WORKS:
  - For email/password: Supabase validates credentials and returns a JWT token
    stored in a cookie (automatic, handled by @nuxtjs/supabase module).
  - For Google OAuth: Supabase redirects to Google's auth page, user approves,
    Google redirects back to our /confirm page, Supabase exchanges the code for a
    session token. Then our /confirm page redirects to /dashboard.

  (Soporta dos métodos de autenticación:
   1. Email + Contraseña (el más común)
   2. Google OAuth (login en un clic vía Supabase)
   
   CÓMO FUNCIONA SUPABASE AUTH:
   - Para email/contraseña: Supabase valida credenciales y devuelve un token JWT
     guardado en una cookie (automático, gestionado por el módulo @nuxtjs/supabase).
   - Para Google OAuth: Supabase redirige a Google, el usuario aprueba,
     Google redirige a nuestra página /confirm, Supabase intercambia el código
     por un token de sesión. Luego /confirm redirige a /dashboard.)
-->
<script setup lang="ts">
import { LoginSchema } from '@ata/shared'

// definePageMeta: Nuxt metadata for this specific page
// (definePageMeta: metadatos de Nuxt para esta página específica)
definePageMeta({
  layout: 'auth', // Use the auth layout (gradient background)
})

const supabase = useSupabaseClient()
const router = useRouter()

// --- Form State (Estado del formulario) ---
// ref() creates a reactive variable — when it changes, the UI updates automatically
// (ref() crea una variable reactiva — cuando cambia, la UI se actualiza automáticamente)
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)
const showPassword = ref(false)

/**
 * Handle email/password login (Gestionar inicio de sesión con email/contraseña)
 * 
 * Flow: validate inputs → call Supabase → on success, redirect to /dashboard
 * (Flujo: validar inputs → llamar a Supabase → en éxito, redirigir a /dashboard)
 */
async function handleLogin() {
  error.value = null

  // Client-side validation with Zod (Validación del lado del cliente con Zod)
  const result = LoginSchema.safeParse({ email: email.value, password: password.value })
  if (!result.success) {
    error.value = result.error.errors[0].message
    return
  }

  isLoading.value = true

  try {
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    })

    if (authError) {
      // Map Supabase error messages to user-friendly text
      // (Mapear mensajes de error de Supabase a texto amigable)
      if (authError.message.includes('Invalid login credentials')) {
        error.value = 'Incorrect email or password. (Email o contraseña incorrectos.)'
      } else {
        error.value = authError.message
      }
      return
    }

    // Success — navigate to dashboard
    // (Éxito — navegar al dashboard)
    await router.push('/dashboard')
  } catch (e) {
    error.value = 'An unexpected error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
}

/**
 * Handle Google OAuth login (Gestionar inicio de sesión con Google OAuth)
 * 
 * This triggers the OAuth flow:
 * 1. Opens Google's auth page
 * 2. User approves
 * 3. Google redirects to SUPABASE_URL/auth/v1/callback
 * 4. Supabase redirects to our /confirm page
 * 5. /confirm redirects to /dashboard
 * 
 * (Activa el flujo OAuth:
 *  1. Abre la página de auth de Google
 *  2. El usuario aprueba
 *  3. Google redirige a SUPABASE_URL/auth/v1/callback
 *  4. Supabase redirige a nuestra página /confirm
 *  5. /confirm redirige a /dashboard)
 */
async function handleGoogleLogin() {
  error.value = null
  isLoading.value = true

  try {
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // redirectTo must match what you configured in Supabase Dashboard
        // (redirectTo debe coincidir con lo configurado en el Panel de Supabase)
        redirectTo: `${window.location.origin}/confirm`,
      },
    })

    if (authError) {
      error.value = authError.message
    }
    // No redirect here — browser will be redirected automatically by Supabase OAuth flow
    // (No redirigir aquí — el navegador será redirigido automáticamente por el flujo OAuth)
  } catch (e) {
    error.value = 'Failed to connect with Google. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <UiGlassCard padding="lg">
    <h2 class="text-2xl font-bold text-white mb-2">
      Welcome back
    </h2>
    <p class="text-white/60 text-sm mb-8">
      Sign in to your agency dashboard
    </p>

    <!-- Google OAuth Button (Botón de Google OAuth) -->
    <!-- This is the "social login" — one click, no password needed -->
    <!-- (Este es el "login social" — un clic, sin necesidad de contraseña) -->
    <button
      :disabled="isLoading"
      class="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
      @click="handleGoogleLogin"
    >
      <!-- Google logo SVG (Logo SVG de Google) -->
      <svg class="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Continue with Google
    </button>

    <!-- Divider (Divisor) -->
    <div class="relative flex items-center mb-6">
      <div class="flex-grow border-t border-white/10" />
      <span class="px-3 text-white/40 text-xs">or continue with email</span>
      <div class="flex-grow border-t border-white/10" />
    </div>

    <!-- Email/Password Form (Formulario de Email/Contraseña) -->
    <form
      class="space-y-4"
      @submit.prevent="handleLogin"
    >
      <!-- Email Input -->
      <div>
        <label class="block text-sm text-white/70 mb-1.5">
          Email address
        </label>
        <input
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="you@company.com"
          class="input-glass"
          :disabled="isLoading"
        />
      </div>

      <!-- Password Input with toggle visibility (Input de contraseña con toggle de visibilidad) -->
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <label class="text-sm text-white/70">Password</label>
          <NuxtLink
            to="/reset-password"
            class="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Forgot password?
          </NuxtLink>
        </div>
        <div class="relative">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="••••••••"
            class="input-glass pr-10"
            :disabled="isLoading"
          />
          <!-- Toggle password visibility (Toggle de visibilidad de contraseña) -->
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
            @click="showPassword = !showPassword"
          >
            <svg
              v-if="!showPassword"
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <svg
              v-else
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Error Message (Mensaje de error) -->
      <!-- v-if: this element only renders when error has a value -->
      <!-- (v-if: este elemento solo se renderiza cuando error tiene un valor) -->
      <div
        v-if="error"
        class="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm"
      >
        <svg
          class="w-4 h-4 mt-0.5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {{ error }}
      </div>

      <!-- Submit Button (Botón de envío) -->
      <button
        type="submit"
        :disabled="isLoading || !email || !password"
        class="btn-primary w-full flex items-center justify-center gap-2"
      >
        <!-- Loading spinner (Spinner de carga) -->
        <svg
          v-if="isLoading"
          class="animate-spin w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        {{ isLoading ? 'Signing in...' : 'Sign in' }}
      </button>
    </form>

    <!-- Sign up link (Enlace de registro) -->
    <p class="text-center text-white/50 text-sm mt-6">
      Don't have an account?
      <NuxtLink
        to="/signup"
        class="text-indigo-400 hover:text-indigo-300 font-medium transition-colors ml-1"
      >
        Create one for free
      </NuxtLink>
    </p>
  </UiGlassCard>
</template>
