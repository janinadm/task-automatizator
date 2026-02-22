<!--
  Ticket Detail Page (Página de detalle de ticket)
  Route: /dashboard/tickets/[id]
  Layout: dashboard

  This is the most information-dense page of the app:
  - Left: Message thread (conversation between customer/agent/AI)
  - Right: Ticket metadata panel + AI suggestions + status controls

  TWO-PANEL LAYOUT PATTERN:
  This is a very common enterprise SaaS pattern (like Gmail, Zendesk, Linear).
  The left panel shows the conversation history; the right panel shows actions.
  On mobile, they stack vertically.

  (DOS PANELES:
   Panel izquierdo: hilo de mensajes (conversación cliente/agente/IA)
   Panel derecho: metadatos + sugerencias de IA + controles de estado)
-->
<script setup lang="ts">
import { useTicketsStore } from '~/stores/tickets'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const ticketsStore = useTicketsStore()
const authStore = useAuthStore()

// useRoute().params.id is the dynamic segment from [id].vue
// (useRoute().params.id es el segmento dinámico de [id].vue)
const ticketId = computed(() => String(route.params.id))

// Fetch on mount — re-fetches if the ID changes (e.g., user navigates between tickets)
// (Obtener al montar — vuelve a obtener si el ID cambia)
onMounted(() => ticketsStore.fetchTicket(ticketId.value))
watch(ticketId, (newId) => ticketsStore.fetchTicket(newId))

const ticket = computed(() => ticketsStore.currentTicket)

// --- STATUS UPDATE ---
// When the agent clicks a new status, call PATCH and update optimistically
// (Cuando el agente hace clic en un nuevo estado, llamar a PATCH y actualizar optimistamente)
const isUpdatingStatus = ref(false)
async function updateStatus(newStatus: string) {
  if (ticket.value?.status === newStatus) return
  isUpdatingStatus.value = true
  try {
    await ticketsStore.updateTicket(ticketId.value, { status: newStatus as any })
  } finally {
    isUpdatingStatus.value = false
  }
}

// --- REPLY FORM ---
const replyText = ref('')
const isSendingReply = ref(false)

async function sendReply() {
  if (!replyText.value.trim()) return
  isSendingReply.value = true
  try {
    await $fetch(`/api/tickets/${ticketId.value}/messages`, {
      method: 'POST',
      body: { content: replyText.value, senderType: 'AGENT' },
    })
    replyText.value = ''
    // Refresh ticket to get the new message (Actualizar ticket para obtener el nuevo mensaje)
    await ticketsStore.fetchTicket(ticketId.value)
  } catch (e: any) {
    console.error('Failed to send reply:', e)
  } finally {
    isSendingReply.value = false
  }
}

// --- DISPLAY HELPERS ---
const statusOptions = [
  { value: 'OPEN', label: '📬 Open', class: 'text-blue-400' },
  { value: 'IN_PROGRESS', label: '⚙️ In Progress', class: 'text-amber-400' },
  { value: 'RESOLVED', label: '✅ Resolved', class: 'text-green-400' },
  { value: 'CLOSED', label: '🔒 Closed', class: 'text-white/40' },
]

const priorityConfig: Record<string, { label: string; dot: string; text: string }> = {
  URGENT: { label: 'Urgent', dot: 'bg-red-500', text: 'text-red-400' },
  HIGH: { label: 'High', dot: 'bg-orange-400', text: 'text-orange-400' },
  MEDIUM: { label: 'Medium', dot: 'bg-amber-400', text: 'text-amber-400' },
  LOW: { label: 'Low', dot: 'bg-green-400', text: 'text-green-400' },
}

const sentimentConfig: Record<string, { emoji: string; text: string }> = {
  POSITIVE: { emoji: '😊', text: 'text-green-400' },
  NEUTRAL: { emoji: '😐', text: 'text-white/60' },
  NEGATIVE: { emoji: '😡', text: 'text-red-400' },
}

function formatDate(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function timeAgo(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const h = Math.floor(mins / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// SLA status — based on isBreachingSla flag returned by the API
// (Estado de SLA — basado en el flag isBreachingSla retornado por la API)
const slaStatus = computed(() => {
  if (!ticket.value) return null
  if (ticket.value.isBreachingSla) {
    return { label: 'Breached', class: 'text-red-400', bgClass: 'bg-red-500/10 border-red-500/20' }
  }
  if (ticket.value.priority === 'URGENT' && ['OPEN', 'IN_PROGRESS'].includes(ticket.value.status)) {
    return { label: 'At risk', class: 'text-amber-400', bgClass: 'bg-amber-500/10 border-amber-500/20' }
  }
  return null
})
</script>

<template>
  <div class="animate-fade-in">
    <!-- Back link + title (Enlace de vuelta + título) -->
    <div class="flex items-center gap-3 mb-5">
      <NuxtLink
        to="/dashboard/tickets"
        class="text-white/40 hover:text-white/70 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <h2 class="text-lg font-semibold text-white truncate">
        {{ ticketsStore.isLoadingDetail ? 'Loading ticket...' : (ticket?.subject ?? 'Ticket not found') }}
      </h2>
    </div>

    <!-- Loading skeleton (Skeleton de carga) -->
    <div v-if="ticketsStore.isLoadingDetail" class="grid lg:grid-cols-3 gap-5">
      <div class="lg:col-span-2 space-y-3">
        <div v-for="i in 4" :key="i" class="h-20 rounded-xl bg-white/5 animate-pulse" />
      </div>
      <div class="space-y-4">
        <div class="h-40 rounded-xl bg-white/5 animate-pulse" />
        <div class="h-32 rounded-xl bg-white/5 animate-pulse" />
      </div>
    </div>

    <!-- Error / Not found (Error / No encontrado) -->
    <div v-else-if="!ticket" class="py-16 text-center">
      <p class="text-white/40">Ticket not found or you don't have access.</p>
      <NuxtLink to="/dashboard/tickets" class="block mt-3 text-indigo-400 hover:text-indigo-300 transition-colors text-sm">
        ← Back to tickets
      </NuxtLink>
    </div>

    <!-- Two-panel layout (Diseño de dos paneles) -->
    <div v-else class="grid lg:grid-cols-3 gap-5">
      <!-- LEFT: Conversation thread (Hilo de conversación) -->
      <div class="lg:col-span-2 flex flex-col gap-4">
        <!-- Messages (Mensajes) -->
        <UiGlassCard padding="none">
          <div class="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <h3 class="text-white font-semibold text-sm">Conversation</h3>
            <span class="text-white/40 text-xs">{{ ticket.messages?.length ?? 0 }} messages</span>
          </div>

          <!-- Message list (Lista de mensajes) -->
          <div class="divide-y divide-white/5 max-h-[512px] overflow-y-auto">
            <!-- Empty (Sin mensajes) -->
            <div v-if="!ticket.messages?.length" class="py-10 text-center text-white/30 text-sm">
              No messages yet — the conversation starts here.
            </div>

            <!-- Each message (Cada mensaje) -->
            <div
              v-for="msg in ticket.messages"
              :key="msg.id"
              class="px-5 py-4"
              :class="{
                'bg-indigo-500/5': msg.senderType === 'AGENT',
                'bg-purple-500/5': msg.senderType === 'AI',
              }"
            >
              <div class="flex items-start gap-3">
                <!-- Sender avatar (Avatar del remitente) -->
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  :class="{
                    'bg-gradient-to-br from-indigo-400 to-purple-500 text-white': msg.senderType === 'AGENT',
                    'bg-gradient-to-br from-purple-500 to-pink-500 text-white': msg.senderType === 'AI',
                    'bg-white/10 text-white/60': msg.senderType === 'CUSTOMER',
                  }"
                >
                  <svg v-if="msg.senderType === 'AI'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span v-else>{{ (msg.sender?.fullName ?? 'C').charAt(0).toUpperCase() }}</span>
                </div>

                <!-- Message content (Contenido del mensaje) -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-white text-sm font-medium">
                      {{ msg.senderType === 'AI' ? '⚡ AI Assistant' : (msg.sender?.fullName ?? 'Customer') }}
                    </span>
                    <span
                      v-if="msg.senderType !== 'CUSTOMER'"
                      class="text-xs px-1.5 py-0.5 rounded-full"
                      :class="msg.senderType === 'AI' ? 'bg-purple-500/20 text-purple-300' : 'bg-indigo-500/20 text-indigo-300'"
                    >
                      {{ msg.senderType === 'AI' ? 'AI' : msg.sender?.role?.toLowerCase() }}
                    </span>
                    <span class="text-white/30 text-xs ml-auto">{{ timeAgo(msg.createdAt) }}</span>
                  </div>
                  <!-- Message body (Cuerpo del mensaje) -->
                  <!-- whitespace-pre-wrap preserves line breaks in the message -->
                  <!-- (whitespace-pre-wrap preserva los saltos de línea del mensaje) -->
                  <p class="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{{ msg.body }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Reply form (Formulario de respuesta) -->
          <div class="px-5 py-4 border-t border-white/10">
            <textarea
              v-model="replyText"
              rows="3"
              placeholder="Type your reply... (press Shift+Enter for new line)"
              class="input-glass w-full resize-none text-sm"
              @keydown.enter.exact.prevent="sendReply"
            />
            <div class="flex items-center justify-between mt-3">
              <p class="text-white/30 text-xs">Press Enter to send · Shift+Enter for new line</p>
              <button
                class="btn-primary text-sm flex items-center gap-2"
                :disabled="!replyText.trim() || isSendingReply"
                @click="sendReply"
              >
                <svg v-if="isSendingReply" class="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {{ isSendingReply ? 'Sending...' : 'Send Reply' }}
              </button>
            </div>
          </div>
        </UiGlassCard>

        <!-- AI Suggestions Panel (Panel de sugerencias de IA) -->
        <UiGlassCard v-if="ticket.aiSuggestions?.length" padding="md">
          <h3 class="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Suggested Replies
          </h3>
          <div class="space-y-3">
            <div
              v-for="suggestion in ticket.aiSuggestions"
              :key="suggestion.id"
              class="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20"
            >
              <div class="flex items-start justify-between gap-2 mb-2">
                <p class="text-white/80 text-sm leading-relaxed">{{ suggestion.suggestedReply }}</p>
                <button
                  class="flex-shrink-0 text-purple-400 hover:text-purple-300 transition-colors text-xs border border-purple-500/30 rounded-lg px-2 py-1 hover:bg-purple-500/10"
                  @click="replyText = suggestion.suggestedReply ?? ''"
                >
                  Use
                </button>
              </div>
              <div class="flex items-center gap-3 text-xs text-white/30">
                <span v-if="suggestion.confidence != null">
                  Confidence: {{ Math.round(suggestion.confidence * 100) }}%
                </span>
                <span v-if="suggestion.category">Category: {{ suggestion.category }}</span>
              </div>
            </div>
          </div>
        </UiGlassCard>
      </div>

      <!-- RIGHT: Metadata panel (Panel de metadatos) -->
      <div class="space-y-4">
        <!-- Status control (Control de estado) -->
        <UiGlassCard padding="md">
          <h3 class="text-white/60 text-xs font-medium uppercase tracking-wider mb-3">Status</h3>
          <div class="space-y-1.5">
            <button
              v-for="opt in statusOptions"
              :key="opt.value"
              class="w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200"
              :class="ticket.status === opt.value
                ? 'bg-white/10 text-white font-medium border border-white/20'
                : 'text-white/50 hover:bg-white/5 hover:text-white/80'"
              :disabled="isUpdatingStatus"
              @click="updateStatus(opt.value)"
            >
              {{ opt.label }}
              <span v-if="ticket.status === opt.value && isUpdatingStatus" class="float-right">
                <svg class="animate-spin w-3.5 h-3.5 inline" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </span>
            </button>
          </div>
        </UiGlassCard>

        <!-- Ticket Details (Detalles del ticket) -->
        <UiGlassCard padding="md">
          <h3 class="text-white/60 text-xs font-medium uppercase tracking-wider mb-3">Details</h3>
          <dl class="space-y-3">
            <!-- Priority (Prioridad) -->
            <div class="flex items-center justify-between">
              <dt class="text-white/40 text-xs">Priority</dt>
              <dd class="flex items-center gap-1.5">
                <div class="w-2 h-2 rounded-full" :class="priorityConfig[ticket.priority]?.dot" />
                <span class="text-sm" :class="priorityConfig[ticket.priority]?.text">
                  {{ priorityConfig[ticket.priority]?.label }}
                </span>
              </dd>
            </div>

            <!-- Sentiment (Sentimiento) -->
            <div v-if="ticket.sentiment" class="flex items-center justify-between">
              <dt class="text-white/40 text-xs">Sentiment</dt>
              <dd class="flex items-center gap-1.5 text-sm" :class="sentimentConfig[ticket.sentiment]?.text">
                {{ sentimentConfig[ticket.sentiment]?.emoji }} {{ ticket.sentiment?.toLowerCase() }}
              </dd>
            </div>

            <!-- Channel (Canal) -->
            <div class="flex items-center justify-between">
              <dt class="text-white/40 text-xs">Channel</dt>
              <dd class="text-white/70 text-sm">{{ ticket.channel?.toLowerCase() }}</dd>
            </div>

            <!-- Category (Categoría) -->
            <div v-if="ticket.category" class="flex items-center justify-between">
              <dt class="text-white/40 text-xs">Category</dt>
              <dd class="text-white/70 text-sm">{{ ticket.category }}</dd>
            </div>

            <!-- Language (Idioma) -->
            <div v-if="ticket.language" class="flex items-center justify-between">
              <dt class="text-white/40 text-xs">Language</dt>
              <dd class="text-white/70 text-sm uppercase">{{ ticket.language }}</dd>
            </div>

            <!-- SLA Deadline (Fecha límite SLA) -->
            <div v-if="slaStatus" class="flex items-center justify-between">
              <dt class="text-white/40 text-xs">SLA</dt>
              <dd>
                <span class="px-2 py-0.5 rounded-full text-xs border" :class="slaStatus.bgClass + ' ' + slaStatus.class">
                  {{ slaStatus.label }}
                </span>
              </dd>
            </div>

            <!-- Created (Creado) -->
            <div class="flex items-center justify-between">
              <dt class="text-white/40 text-xs">Created</dt>
              <dd class="text-white/60 text-xs">{{ formatDate(ticket.createdAt) }}</dd>
            </div>

            <!-- Resolved (Resuelto) -->
            <div v-if="ticket.resolvedAt" class="flex items-center justify-between">
              <dt class="text-white/40 text-xs">Resolved</dt>
              <dd class="text-white/60 text-xs">{{ formatDate(ticket.resolvedAt) }}</dd>
            </div>
          </dl>
        </UiGlassCard>

        <!-- Assigned Agent (Agente asignado) -->
        <UiGlassCard padding="md">
          <h3 class="text-white/60 text-xs font-medium uppercase tracking-wider mb-3">Assigned Agent</h3>
          <div v-if="ticket.assignedTo" class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
              {{ ticket.assignedTo.fullName.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="text-white text-sm font-medium">{{ ticket.assignedTo.fullName }}</p>
              <p class="text-white/40 text-xs">Agent</p>
            </div>
          </div>
          <div v-else class="text-white/40 text-sm text-center py-3">
            Unassigned
          </div>
        </UiGlassCard>

        <!-- AI Summary (Resumen de IA) — Phase 6 will populate this -->
        <UiGlassCard v-if="ticket.summary" padding="md">
          <h3 class="text-white/60 text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Summary
          </h3>
          <p class="text-white/70 text-sm leading-relaxed">{{ ticket.summary }}</p>
        </UiGlassCard>
      </div>
    </div>
  </div>
</template>
