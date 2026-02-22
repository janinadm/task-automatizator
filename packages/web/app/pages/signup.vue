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
const route = useRoute()

// --- Invite token handling ---
const inviteToken = computed(() => String(route.query.invite ?? ''))
const inviteData = ref<{ email: string; role: string; orgName: string; invitedBy: string } | null>(null)
const inviteError = ref<string | null>(null)

// If there's an invite token in URL, validate it
if (inviteToken.value) {
  try {
    const res = await $fetch<{ data: typeof inviteData.value }>(`/api/auth/invite?token=${inviteToken.value}`)
    inviteData.value = res.data
  } catch (e: any) {
    inviteError.value = e?.data?.message ?? 'Invalid invitation link'
  }
}

// --- Form State ---
const fullName = ref('')
const organizationName = ref(inviteData.value?.orgName ?? '')
const email = ref(inviteData.value?.email ?? '')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

// Password strength
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
  return colors[passwordStrength.value] ?? ''
})

/**
 * Main signup handler — handles both regular signup and invite-based signup
 */
async function handleSignup() {
  error.value = null
  successMessage.value = null

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }

  // For invite flow, we only need email, password, fullName (org is from the invite)
  const validationData = {
    fullName: fullName.value,
    organizationName: inviteData.value ? inviteData.value.orgName : organizationName.value,
    email: inviteData.value ? inviteData.value.email : email.value,
    password: password.value,
  }

  const result = SignUpSchema.safeParse(validationData)
  if (!result.success) {
    error.value = result.error.errors[0]?.message ?? 'Validation error'
    return
  }

  isLoading.value = true

  try {
    // STEP 1: Create Supabase Auth account
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
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

    if (!authData.user) {
      successMessage.value = '✉️ Check your email to confirm your account before logging in.'
      return
    }

    // STEP 2: Create Prisma records — different path for invites vs new orgs
    if (inviteData.value && inviteToken.value) {
      // Accept invite: join existing org
      const setupResponse = await $fetch<{ success: boolean }>('/api/auth/accept-invite', {
        method: 'POST',
        body: {
          userId: authData.user.id,
          email: result.data.email,
          fullName: result.data.fullName,
          token: inviteToken.value,
        },
      })

      if (!setupResponse.success) {
        throw new Error('Failed to accept invitation.')
      }
    } else {
      // Regular signup: create new org
      const setupResponse = await $fetch<{ success: boolean }>('/api/auth/setup', {
        method: 'POST',
        body: {
          userId: authData.user.id,
          email: result.data.email,
          fullName: result.data.fullName,
          organizationName: result.data.organizationName,
        },
      })

      if (!setupResponse.success) {
        throw new Error('Failed to set up your account.')
      }
    }

    // STEP 3: Navigate to dashboard
    await router.push('/dashboard')
  } catch (e: any) {
    error.value = e?.data?.message ?? e?.message ?? 'An unexpected error occurred.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h2 class="text-2xl font-extrabold text-white">
        {{ inviteData ? 'Join your team' : 'Create your workspace' }}
      </h2>
      <p class="text-white/50 text-sm mt-2">
        {{ inviteData ? `You've been invited to join ${inviteData.orgName}` : 'Set up your agency\'s AI-powered support hub' }}
      </p>
    </div>

    <!-- Invite error -->
    <div
      v-if="inviteError"
      class="mb-6 p-4 bg-red-500/[0.08] border border-red-500/15 rounded-2xl text-red-300 text-sm text-center animate-fade-in"
    >
      {{ inviteError }}
      <NuxtLink to="/signup" class="block mt-3 text-white font-semibold underline">
        Sign up without invitation
      </NuxtLink>
    </div>

    <!-- Invite banner -->
    <div
      v-if="inviteData && !inviteError"
      class="mb-6 p-4 bg-indigo-500/[0.08] border border-indigo-500/15 rounded-2xl animate-fade-in"
    >
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <p class="text-indigo-300 text-sm font-medium">Joining {{ inviteData.orgName }}</p>
          <p class="text-white/40 text-xs">Invited by {{ inviteData.invitedBy }} as {{ inviteData.role }}</p>
        </div>
      </div>
    </div>

    <!-- Success message — shown when email confirmation needed -->
    <div
      v-if="successMessage"
      class="p-5 bg-emerald-500/[0.08] border border-emerald-500/15 rounded-2xl text-emerald-300 text-sm text-center animate-fade-in"
    >
      {{ successMessage }}
      <NuxtLink to="/login" class="block mt-4 text-white font-semibold underline">
        Back to Login
      </NuxtLink>
    </div>

    <!-- Form (only shown when no success message) -->
    <form
      v-else
      class="space-y-5"
      @submit.prevent="handleSignup"
    >
      <!-- Org + Full Name -->
      <div class="grid grid-cols-1 gap-4">
        <div v-if="!inviteData">
          <label class="block text-sm text-white/60 mb-2 font-medium">Agency / Company name</label>
          <input
            v-model="organizationName"
            type="text"
            placeholder="Stellar Marketing Agency"
            class="input-glass"
            :disabled="isLoading"
          />
        </div>
        <div>
          <label class="block text-sm text-white/60 mb-2 font-medium">Your full name</label>
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
        <label class="block text-sm text-white/60 mb-2 font-medium">Work email</label>
        <input
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="you@company.com"
          class="input-glass"
          :disabled="isLoading || !!inviteData"
          :class="{ 'opacity-60': inviteData }"
        />
      </div>

      <!-- Password with strength meter -->
      <div>
        <label class="block text-sm text-white/60 mb-2 font-medium">Password</label>
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
            class="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            @click="showPassword = !showPassword"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                :d="showPassword
                  ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21'
                  : 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'"
              />
            </svg>
          </button>
        </div>

        <!-- Password strength bar -->
        <div v-if="password" class="mt-2.5">
          <div class="flex gap-1">
            <div
              v-for="i in 4"
              :key="i"
              class="h-1 flex-1 rounded-full transition-all duration-300"
              :class="i <= passwordStrength ? strengthColor : 'bg-white/[0.06]'"
            />
          </div>
          <p class="text-xs mt-1.5 text-white/40">{{ strengthLabel }}</p>
        </div>
      </div>

      <div>
        <label class="block text-sm text-white/60 mb-2 font-medium">Confirm password</label>
        <input
          v-model="confirmPassword"
          type="password"
          autocomplete="new-password"
          placeholder="••••••••"
          class="input-glass"
          :disabled="isLoading"
        />
      </div>

      <!-- Error -->
      <div v-if="error" class="flex items-start gap-2.5 p-3.5 bg-red-500/[0.08] border border-red-500/15 rounded-xl text-red-300 text-sm animate-fade-in">
        <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ error }}
      </div>

      <!-- Terms -->
      <p class="text-white/30 text-xs leading-relaxed">
        By creating an account you agree to our Terms of Service and Privacy Policy.
      </p>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="isLoading || !email || !password || !fullName || (!inviteData && !organizationName)"
        class="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-indigo-500/25 flex items-center justify-center gap-2"
      >
        <svg v-if="isLoading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {{ isLoading ? 'Setting up workspace...' : (inviteData ? 'Join team' : 'Create free workspace') }}
      </button>
    </form>

    <!-- Login link -->
    <p class="text-center text-white/40 text-sm mt-8">
      Already have an account?
      <NuxtLink to="/login" class="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors ml-1">
        Sign in
      </NuxtLink>
    </p>
  </div>
</template>
