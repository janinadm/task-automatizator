<!--
  New Ticket Page — Create a support ticket
  Route: /dashboard/tickets/new
  Layout: dashboard

  This form lets agents create tickets on behalf of customers.
  After submission, the ticket is analyzed by AI in the background.
-->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const router = useRouter()
const toast = useToast()

const form = reactive({
  subject: '',
  body: '',
  channel: 'WEB' as string,
  customerName: '',
  customerEmail: '',
})

const isSubmitting = ref(false)
const error = ref<string | null>(null)

const channels = [
  { value: 'WEB', label: '🌐 Web', description: 'Web form or chat' },
  { value: 'EMAIL', label: '✉️ Email', description: 'Email message' },
  { value: 'WHATSAPP', label: '💬 WhatsApp', description: 'WhatsApp message' },
  { value: 'SLACK', label: '⚡ Slack', description: 'Slack message' },
]

async function handleSubmit() {
  error.value = null

  if (!form.subject.trim() || !form.body.trim()) {
    error.value = 'Subject and message body are required.'
    return
  }

  isSubmitting.value = true
  try {
    const ticket = await $fetch<{ data: { id: string } }>('/api/tickets', {
      method: 'POST',
      body: {
        subject: form.subject,
        body: form.body,
        channel: form.channel,
        customerName: form.customerName || undefined,
        customerEmail: form.customerEmail || undefined,
      },
    })

    toast.success('Ticket created! AI is analyzing it in the background.')
    await router.push(`/dashboard/tickets/${ticket.data.id}`)
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Failed to create ticket. Please try again.'
    toast.error(error.value!)
  } finally {
    isSubmitting.value = false
  }
}

const isFormValid = computed(
  () => form.subject.trim().length > 0 && form.body.trim().length > 0
)
</script>

<template>
  <div class="max-w-3xl mx-auto animate-fade-in">
    <!-- Back + Title -->
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink
        to="/dashboard/tickets"
        class="text-white/40 hover:text-white/70 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <h2 class="text-xl font-bold text-white">Create New Ticket</h2>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-5">
      <!-- Subject -->
      <UiGlassCard padding="md">
        <h3 class="text-white font-semibold text-sm mb-4 flex items-center gap-2">
          <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          Ticket Details
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm text-white/70 mb-1.5">Subject *</label>
            <input
              v-model="form.subject"
              type="text"
              placeholder="Brief description of the issue..."
              class="input-glass"
              maxlength="200"
              :disabled="isSubmitting"
            />
            <p class="text-white/30 text-xs mt-1">{{ form.subject.length }}/200</p>
          </div>

          <div>
            <label class="block text-sm text-white/70 mb-1.5">Message Body *</label>
            <textarea
              v-model="form.body"
              rows="6"
              placeholder="Full description of the customer's issue, request, or question..."
              class="input-glass resize-none"
              maxlength="5000"
              :disabled="isSubmitting"
            />
            <p class="text-white/30 text-xs mt-1">{{ form.body.length }}/5000</p>
          </div>
        </div>
      </UiGlassCard>

      <!-- Channel -->
      <UiGlassCard padding="md">
        <h3 class="text-white font-semibold text-sm mb-4 flex items-center gap-2">
          <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Channel
        </h3>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            v-for="ch in channels"
            :key="ch.value"
            type="button"
            class="p-3 rounded-xl text-center transition-all duration-200 text-sm"
            :class="form.channel === ch.value
              ? 'bg-indigo-500/20 border border-indigo-500/40 text-white'
              : 'bg-white/[0.04] border border-white/[0.06] text-white/60 hover:bg-white/[0.08]'"
            @click="form.channel = ch.value"
          >
            <span class="text-lg block mb-1">{{ ch.label.split(' ')[0] }}</span>
            <span class="text-xs">{{ ch.label.split(' ').slice(1).join(' ') }}</span>
          </button>
        </div>
      </UiGlassCard>

      <!-- Customer Info -->
      <UiGlassCard padding="md">
        <h3 class="text-white font-semibold text-sm mb-4 flex items-center gap-2">
          <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Customer Information
          <span class="text-white/30 font-normal">(optional)</span>
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-white/70 mb-1.5">Customer Name</label>
            <input
              v-model="form.customerName"
              type="text"
              placeholder="John Doe"
              class="input-glass"
              :disabled="isSubmitting"
            />
          </div>
          <div>
            <label class="block text-sm text-white/70 mb-1.5">Customer Email</label>
            <input
              v-model="form.customerEmail"
              type="email"
              placeholder="john@example.com"
              class="input-glass"
              :disabled="isSubmitting"
            />
          </div>
        </div>
      </UiGlassCard>

      <!-- Error -->
      <div v-if="error" class="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm flex items-start gap-2">
        <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ error }}
      </div>

      <!-- AI Notice -->
      <div class="flex items-start gap-3 p-4 bg-purple-500/[0.06] border border-purple-500/20 rounded-xl">
        <svg class="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <div>
          <p class="text-purple-300 text-sm font-medium">AI will automatically analyze this ticket</p>
          <p class="text-white/40 text-xs mt-1">Sentiment, priority, category, and a suggested reply will be generated in the background.</p>
        </div>
      </div>

      <!-- Submit -->
      <div class="flex items-center justify-end gap-3">
        <NuxtLink to="/dashboard/tickets" class="btn-ghost text-sm">
          Cancel
        </NuxtLink>
        <button
          type="submit"
          :disabled="isSubmitting || !isFormValid"
          class="btn-primary flex items-center gap-2"
        >
          <svg v-if="isSubmitting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ isSubmitting ? 'Creating...' : 'Create Ticket' }}
        </button>
      </div>
    </form>
  </div>
</template>
