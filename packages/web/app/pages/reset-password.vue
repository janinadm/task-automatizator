<!--
  Reset Password Page (Página de restablecimiento de contraseña)
  Route: /reset-password
  
  Placeholder — full implementation in Phase 7 (with email delivery)
  (Placeholder — implementación completa en Fase 7 con entrega de email)
-->
<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const supabase = useSupabaseClient()
const email = ref('')
const sent = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)

async function handleReset() {
  if (!email.value) return
  isLoading.value = true
  error.value = null
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.value, {
    redirectTo: `${window.location.origin}/confirm`,
  })
  if (resetError) {
    error.value = resetError.message
  } else {
    sent.value = true
  }
  isLoading.value = false
}
</script>

<template>
  <UiGlassCard padding="lg">
    <h2 class="text-2xl font-bold text-white mb-2">Reset password</h2>
    <p class="text-white/60 text-sm mb-8">
      Enter your email and we'll send you a reset link.
    </p>

    <div v-if="sent" class="text-center animate-fade-in">
      <div class="w-14 h-14 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
        <svg class="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <p class="text-white font-semibold mb-1">Check your inbox</p>
      <p class="text-white/50 text-sm">We sent a reset link to <strong>{{ email }}</strong></p>
      <NuxtLink to="/login" class="block mt-5 text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
        ← Back to Login
      </NuxtLink>
    </div>

    <form v-else class="space-y-4" @submit.prevent="handleReset">
      <div>
        <label class="block text-sm text-white/70 mb-1.5">Email address</label>
        <input v-model="email" type="email" placeholder="you@company.com" class="input-glass" :disabled="isLoading" />
      </div>
      <div v-if="error" class="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
        {{ error }}
      </div>
      <button type="submit" :disabled="isLoading || !email" class="btn-primary w-full flex items-center justify-center gap-2">
        <svg v-if="isLoading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {{ isLoading ? 'Sending...' : 'Send reset link' }}
      </button>
      <NuxtLink to="/login" class="block text-center text-white/40 hover:text-white/60 text-sm transition-colors">
        ← Back to Login
      </NuxtLink>
    </form>
  </UiGlassCard>
</template>
