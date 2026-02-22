<!--
  Signup Page (Página de registro)
  Route: /signup
  Layout: auth

  HOW SIGNUP WORKS IN A SUPABASE + PRISMA APP:
  Because our database has a User table in Prisma (linked to Supabase Auth by UUID),
  we need TWO operations on sign up:
  1. Create the Supabase Auth account → this gives us the UUID (the "auth" user)
  2. Create our own records in Prisma: Organization + User → this stores business data

  WHY TWO STEPS?
  - Supabase Auth handles: JWT tokens, session management, OAuth, email verification
  - Prisma/PostgreSQL handles: business logic, relations, our custom fields (role, org, etc.)
  The UUID from step 1 is used as the primary key in our User table, linking them together.

  (CÓMO FUNCIONA EL REGISTRO EN SUPABASE + PRISMA:
   Necesitamos DOS operaciones al registrarse:
   1. Crear la cuenta de Supabase Auth → nos da el UUID (el usuario "auth")
   2. Crear nuestros registros en Prisma: Organization + User → guarda datos de negocio
   
   ¿POR QUÉ DOS PASOS?
   - Supabase Auth maneja: tokens JWT, sesiones, OAuth, verificación de email
   - Prisma/PostgreSQL maneja: lógica de negocio, relaciones, campos personalizados
   El UUID del paso 1 se usa como clave primaria en nuestra tabla User, vinculándolos.)
-->
<script setup lang="ts">
import { SignUpSchema } from '@ata/shared'

definePageMeta({
  layout: 'auth',
})

const supabase = useSupabaseClient()
const router = useRouter()

// --- Form State (Estado del formulario) ---
const fullName = ref('')
const organizationName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

// Password strength indicator (Indicador de fortaleza de contraseña)
// computed() is like a formula that auto-recalculates when its dependencies change
// (computed() es como una fórmula que se recalcula automáticamente cuando sus dependencias cambian)
const passwordStrength = computed(() => {
  if (!password.value) return 0
  let score = 0
  if (password.value.length >= 8) score++
  if (/[A-Z]/.test(password.value)) score++
  if (/[0-9]/.test(password.value)) score++
  if (/[^A-Za-z0-9]/.test(password.value)) score++
  return score
})

const strengthLabel = computed(() => {
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  return labels[passwordStrength.value]
})

const strengthColor = computed(() => {
  const colors = ['', 'bg-red-500', 'bg-amber-500', 'bg-indigo-500', 'bg-green-500']
  // ?? '' ensures we always return a string (never undefined)
  // (??  '' asegura que siempre retornamos un string)
  return colors[passwordStrength.value] ?? ''
})

/**
 * Main signup handler (Manejador principal de registro)
 * 
 * Step 1: Validate form data with Zod
 * Step 2: Create Supabase Auth account
 * Step 3: Call our API /api/auth/setup to create Prisma Organization + User records
 * Step 4: Redirect to /dashboard (or show "check your email" if email verification enabled)
 *
 * (Paso 1: Validar datos del formulario con Zod
 *  Paso 2: Crear cuenta de Supabase Auth
 *  Paso 3: Llamar a nuestra API /api/auth/setup para crear registros Prisma
 *  Paso 4: Redirigir a /dashboard)
 */
async function handleSignup() {
  error.value = null
  successMessage.value = null

  // Passwords must match (Las contraseñas deben coincidir)
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match. (Las contraseñas no coinciden.)'
    return
  }

  // Validate with Zod schema (Validar con esquema Zod)
  const result = SignUpSchema.safeParse({
    fullName: fullName.value,
    organizationName: organizationName.value,
    email: email.value,
    password: password.value,
  })

  if (!result.success) {
    error.value = result.error.errors[0]?.message ?? 'Validation error'
    return
  }

  isLoading.value = true

  try {
    // --- STEP 1: Create Supabase Auth account (PASO 1: Crear cuenta Supabase Auth) ---
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        // Store extra data in Supabase's auth.users metadata column
        // (Guardar datos extra en la columna de metadatos de auth.users de Supabase)
        data: {
          full_name: result.data.fullName,
          organization_name: result.data.organizationName,
        },
      },
    })

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        error.value = 'This email is already registered. Try logging in instead.'
      } else {
        error.value = signUpError.message
      }
      return
    }

    // If no user returned, email confirmation is required
    // (Si no se devuelve usuario, se requiere confirmación de email)
    if (!authData.user) {
      successMessage.value = '✉️ Check your email to confirm your account before logging in.'
      return
    }

    // --- STEP 2: Create Prisma records (PASO 2: Crear registros Prisma) ---
    // We call our server API to create: Organization + User in PostgreSQL
    // ($fetch is Nuxt's built-in HTTP client — auto-handles CSRF and base URL)
    // (Llamamos a nuestra API de servidor para crear: Organization + User en PostgreSQL)
    // ($fetch es el cliente HTTP integrado de Nuxt — maneja CSRF y URL base automáticamente)
    const setupResponse = await $fetch('/api/auth/setup', {
      method: 'POST',
      body: {
        userId: authData.user.id,
        email: result.data.email,
        fullName: result.data.fullName,
        organizationName: result.data.organizationName,
      },
    })

    if (!setupResponse.success) {
      throw new Error('Failed to set up your account. Please contact support.')
    }

    // --- STEP 3: Navigate to dashboard (PASO 3: Navegar al dashboard) ---
    await router.push('/dashboard')
  } catch (e: any) {
    // $fetch throws an error if the server returns a non-2xx status
    // ($fetch lanza un error si el servidor devuelve un estado no-2xx)
    error.value = e?.data?.message ?? e?.message ?? 'An unexpected error occurred.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <UiGlassCard padding="lg">
    <h2 class="text-2xl font-bold text-white mb-2">
      Create your workspace
    </h2>
    <p class="text-white/60 text-sm mb-8">
      Set up your agency's AI-powered support hub
    </p>

    <!-- Success message (Mensaje de éxito) — shown when email confirmation needed -->
    <div
      v-if="successMessage"
      class="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-300 text-sm text-center animate-fade-in"
    >
      {{ successMessage }}
      <NuxtLink
        to="/login"
        class="block mt-3 text-white font-medium underline"
      >
        Back to Login
      </NuxtLink>
    </div>

    <!-- Form (only shown when no success message) -->
    <!-- (Formulario — solo se muestra cuando no hay mensaje de éxito) -->
    <form
      v-else
      class="space-y-4"
      @submit.prevent="handleSignup"
    >
      <!-- Org Name & Full Name side by side on desktop -->
      <!-- (Nombre de org y nombre completo lado a lado en escritorio) -->
      <div class="grid grid-cols-1 gap-4">
        <div>
          <label class="block text-sm text-white/70 mb-1.5">
            Agency / Company name
          </label>
          <input
            v-model="organizationName"
            type="text"
            placeholder="Stellar Marketing Agency"
            class="input-glass"
            :disabled="isLoading"
          />
        </div>
        <div>
          <label class="block text-sm text-white/70 mb-1.5">
            Your full name
          </label>
          <input
            v-model="fullName"
            type="text"
            placeholder="María García"
            class="input-glass"
            :disabled="isLoading"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm text-white/70 mb-1.5">
          Work email
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

      <!-- Password with strength meter (Contraseña con medidor de fortaleza) -->
      <div>
        <label class="block text-sm text-white/70 mb-1.5">Password</label>
        <div class="relative">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Min. 8 characters"
            class="input-glass pr-10"
            :disabled="isLoading"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
            @click="showPassword = !showPassword"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                :d="showPassword
                  ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21'
                  : 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'"
              />
            </svg>
          </button>
        </div>

        <!-- Password strength bar (Barra de fortaleza de contraseña) -->
        <div
          v-if="password"
          class="mt-2"
        >
          <div class="flex gap-1">
            <div
              v-for="i in 4"
              :key="i"
              class="h-1 flex-1 rounded-full transition-all duration-300"
              :class="i <= passwordStrength ? strengthColor : 'bg-white/10'"
            />
          </div>
          <p class="text-xs mt-1 transition-colors" :class="`text-${strengthColor.replace('bg-', '').replace('-500', '')}-400`">
            {{ strengthLabel }}
          </p>
        </div>
      </div>

      <div>
        <label class="block text-sm text-white/70 mb-1.5">
          Confirm password
        </label>
        <input
          v-model="confirmPassword"
          type="password"
          autocomplete="new-password"
          placeholder="••••••••"
          class="input-glass"
          :disabled="isLoading"
        />
      </div>

      <!-- Error message (Mensaje de error) -->
      <div
        v-if="error"
        class="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm"
      >
        <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ error }}
      </div>

      <!-- Terms note (Nota de términos) -->
      <p class="text-white/40 text-xs leading-relaxed">
        By creating an account you agree to our Terms of Service and Privacy Policy.
      </p>

      <!-- Submit button (Botón de envío) -->
      <button
        type="submit"
        :disabled="isLoading || !email || !password || !fullName || !organizationName"
        class="btn-primary w-full flex items-center justify-center gap-2"
      >
        <svg
          v-if="isLoading"
          class="animate-spin w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {{ isLoading ? 'Setting up workspace...' : 'Create free workspace' }}
      </button>
    </form>

    <!-- Login link (Enlace de login) -->
    <p class="text-center text-white/50 text-sm mt-6">
      Already have an account?
      <NuxtLink
        to="/login"
        class="text-indigo-400 hover:text-indigo-300 font-medium transition-colors ml-1"
      >
        Sign in
      </NuxtLink>
    </p>
  </UiGlassCard>
</template>
