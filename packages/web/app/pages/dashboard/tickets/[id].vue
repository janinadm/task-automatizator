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

// ── Realtime subscriptions (Suscripciones en tiempo real) ──────────────────
// Two channels here:
//   1. ticket_messages → live chat (new messages appear instantly)
//   2. tickets        → ticket metadata changes (status, priority, assignment)
//
// The message channel is fine-grained: filtered to THIS ticket's ID only.
// The ticket channel comes from useRealtimeTickets (watches the whole org).
//
// (Dos canales aquí:
//  1. ticket_messages → chat en vivo (los nuevos mensajes aparecen al instante)
//  2. tickets → cambios de metadatos (estado, prioridad, asignación)
//  El canal de mensajes es de grano fino: filtrado solo al ID de ESTE ticket.)
const { subscribe: subscribeMessages } = useRealtimeMessages()
const { subscribe: subscribeTickets } = useRealtimeTickets()
const supabase = useSupabaseClient()

let msgChannel: ReturnType<typeof supabase.channel> | null = null
let ticketChannel: ReturnType<typeof supabase.channel> | null = null

// Fetch on mount — re-fetches if the ID changes (e.g., user navigates between tickets)
// (Obtener al montar — vuelve a obtener si el ID cambia)
onMounted(async () => {
  await ticketsStore.fetchTicket(ticketId.value)
  await fetchSlaForTicket()

  // Start SLA timer (tick every minute)
  slaTimer.value = setInterval(() => {
    slaElapsed.value++
  }, 60000)

  // Subscribe to messages for THIS ticket
  // (Suscribirse a mensajes de ESTE ticket)
  msgChannel = subscribeMessages(ticketId.value)

  // Also subscribe to ticket-level changes (status, priority) for the whole org
  // (También suscribirse a cambios a nivel de ticket para toda la org)
  const orgId = authStore.currentUser?.orgId
  if (orgId) {
    ticketChannel = subscribeTickets(orgId)
  }
})

// When the user navigates to a different ticket in the same page:
// tear down old subscriptions, fetch new data, and re-subscribe.
// (Cuando el usuario navega a un ticket diferente en la misma página:
//  eliminar las suscripciones antiguas, obtener nuevos datos y volver a suscribirse.)
watch(ticketId, async (newId) => {
  // Clean up previous message subscription (Limpiar suscripción de mensajes anterior)
  if (msgChannel) {
    supabase.removeChannel(msgChannel)
    msgChannel = null
  }

  await ticketsStore.fetchTicket(newId)
  msgChannel = subscribeMessages(newId)
})

// Cleanup on page exit (Limpieza al salir de la página)
onUnmounted(() => {
  if (msgChannel) {
    supabase.removeChannel(msgChannel)
    msgChannel = null
  }
  if (ticketChannel) {
    supabase.removeChannel(ticketChannel)
    ticketChannel = null
  }
  if (slaTimer.value) {
    clearInterval(slaTimer.value)
    slaTimer.value = null
  }
})

const ticket = computed(() => ticketsStore.currentTicket)

// --- CANNED RESPONSES ---
const showCannedPicker = ref(false)
const cannedResponses = ref<any[]>([])
const cannedSearch = ref('')

async function fetchCannedResponses() {
  try {
    const res = await $fetch<{ data: any[] }>('/api/canned-responses')
    cannedResponses.value = res.data.filter((r: any) => r.isActive)
  } catch { /* ignore */ }
}

const filteredCanned = computed(() => {
  const q = cannedSearch.value.toLowerCase()
  if (!q) return cannedResponses.value
  return cannedResponses.value.filter((r: any) =>
    r.title.toLowerCase().includes(q) ||
    r.shortcut?.toLowerCase().includes(q) ||
    r.category?.toLowerCase().includes(q)
  )
})

function useCannedResponse(response: any) {
  // Replace template variables
  let body = response.body
  if (ticket.value) {
    body = body.replace(/\{\{ticket\.customerName\}\}/g, ticket.value.customerName ?? 'Customer')
    body = body.replace(/\{\{ticket\.subject\}\}/g, ticket.value.subject ?? '')
  }
  replyText.value = body
  showCannedPicker.value = false
  cannedSearch.value = ''
  // Track usage
  $fetch(`/api/canned-responses/${response.id}/use`, { method: 'POST' }).catch(() => {})
}

onMounted(() => fetchCannedResponses())

// --- TAGS ---
const allTags = ref<any[]>([])
const ticketTags = computed(() => ticket.value?.tags?.map((tt: any) => tt.tag ?? tt) ?? [])
const showTagPicker = ref(false)
const availableTags = computed(() =>
  allTags.value.filter((t) => !ticketTags.value.some((tt: any) => tt.id === t.id))
)

async function fetchTags() {
  try {
    const res = await $fetch<{ data: any[] }>('/api/tags')
    allTags.value = res.data
  } catch { /* ignore */ }
}

async function addTagToTicket(tagId: string) {
  try {
    await $fetch(`/api/tickets/${ticketId.value}/tags`, {
      method: 'POST',
      body: { tagId },
    })
    await ticketsStore.fetchTicket(ticketId.value)
    showTagPicker.value = false
  } catch { /* ignore */ }
}

async function removeTagFromTicket(tagId: string) {
  try {
    await $fetch(`/api/tickets/${ticketId.value}/tags/${tagId}`, { method: 'DELETE' })
    await ticketsStore.fetchTicket(ticketId.value)
  } catch { /* ignore */ }
}

onMounted(() => fetchTags())

// --- INTERNAL NOTES ---
const showNoteForm = ref(false)
const noteText = ref('')
const isSendingNote = ref(false)

async function sendInternalNote() {
  if (!noteText.value.trim()) return
  isSendingNote.value = true
  try {
    await $fetch(`/api/tickets/${ticketId.value}/notes`, {
      method: 'POST',
      body: { body: noteText.value },
    })
    noteText.value = ''
    showNoteForm.value = false
    await ticketsStore.fetchTicket(ticketId.value)
  } catch (e: any) {
    console.error('Failed to send note:', e)
  } finally {
    isSendingNote.value = false
  }
}

// --- SLA TIMER ---
const slaData = ref<any>(null)
const slaTimer = ref<ReturnType<typeof setInterval> | null>(null)
const slaElapsed = ref(0)

async function fetchSlaForTicket() {
  if (!ticket.value) return
  try {
    const res = await $fetch<{ data: { statuses: any[] } }>('/api/tickets/sla-status')
    const found = res.data.statuses.find((s: any) => s.ticketId === ticketId.value)
    slaData.value = found ?? null
    if (found) slaElapsed.value = found.minutesElapsed
  } catch { /* ignore */ }
}

const slaCountdown = computed(() => {
  if (!slaData.value || slaData.value.maxResponseMinutes === null) return null
  if (slaData.value.firstResponseAt) return { responded: true }
  const remaining = slaData.value.maxResponseMinutes - slaElapsed.value
  const absRemaining = Math.abs(remaining)
  const hours = Math.floor(absRemaining / 60)
  const mins = absRemaining % 60
  return {
    responded: false,
    remaining,
    display: remaining < 0
      ? `-${hours}h ${mins}m overdue`
      : `${hours}h ${mins}m remaining`,
    severity: slaData.value.breachSeverity,
  }
})

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
      body: { body: replyText.value, senderType: 'AGENT' },
    })
    replyText.value = ''
    // Don't manually re-fetch — the Realtime subscription will pick up the
    // new message and re-fetch for us via useRealtimeMessages
    // (No re-obtener manualmente — la suscripción Realtime reconocerá el nuevo mensaje
    //  y re-obtendrá por nosotros vía useRealtimeMessages)
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

// --- AI ANALYSIS ---
// On-demand AI analysis: classifies sentiment, priority, category + generates a suggested reply
// (Análisis de IA bajo demanda: clasifica sentimiento, prioridad, categoría + genera respuesta sugerida)
const isAnalyzing = ref(false)
const analysisError = ref<string | null>(null)
const toast = useToast()

async function analyzeWithAI() {
  if (!ticketId.value) return
  isAnalyzing.value = true
  analysisError.value = null
  try {
    await $fetch(`/api/tickets/${ticketId.value}/analyze`, { method: 'POST' })
    // Re-fetch the ticket to get the updated fields + new AI suggestion
    // (Re-obtener el ticket para obtener los campos actualizados + nueva sugerencia IA)
    await ticketsStore.fetchTicket(ticketId.value)
    toast.success('AI analysis complete')
  } catch (e: any) {
    analysisError.value = e?.data?.message ?? 'AI analysis failed'
    toast.error(analysisError.value!)
  } finally {
    isAnalyzing.value = false
  }
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
                'bg-indigo-500/5': msg.senderType === 'AGENT' && !msg.isInternal,
                'bg-purple-500/5': msg.senderType === 'AI',
                'bg-amber-500/5 border-l-2 border-amber-500/40': msg.isInternal,
              }"
            >
              <div class="flex items-start gap-3">
                <!-- Sender avatar (Avatar del remitente) -->
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  :class="{
                    'bg-gradient-to-br from-amber-400 to-orange-500 text-white': msg.isInternal,
                    'bg-gradient-to-br from-indigo-400 to-purple-500 text-white': msg.senderType === 'AGENT' && !msg.isInternal,
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
                      {{ msg.isInternal ? '🔒 ' : '' }}{{ msg.senderType === 'AI' ? '⚡ AI Assistant' : (msg.sender?.fullName ?? 'Customer') }}
                    </span>
                    <span
                      v-if="msg.isInternal"
                      class="text-xs px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300"
                    >
                      internal note
                    </span>
                    <span
                      v-else-if="msg.senderType !== 'CUSTOMER'"
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
              <div class="flex items-center gap-2">
                <p class="text-white/30 text-xs">Enter to send · Shift+Enter for new line</p>
                <!-- Canned response picker trigger -->
                <div class="relative">
                  <button
                    class="text-white/40 hover:text-indigo-400 transition-colors text-xs flex items-center gap-1 border border-white/10 rounded-lg px-2 py-1 hover:border-indigo-500/30 hover:bg-indigo-500/5"
                    @click="showCannedPicker = !showCannedPicker"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Templates
                  </button>

                  <!-- Canned responses dropdown -->
                  <Transition name="fade">
                    <div
                      v-if="showCannedPicker"
                      class="absolute left-0 bottom-full mb-2 w-80 max-h-72 bg-[#12101f] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      <div class="px-3 py-2 border-b border-white/[0.06]">
                        <input
                          v-model="cannedSearch"
                          type="text"
                          placeholder="Search templates..."
                          class="input-glass w-full text-xs py-1.5"
                        />
                      </div>
                      <div class="overflow-y-auto max-h-52 divide-y divide-white/[0.04]">
                        <button
                          v-for="cr in filteredCanned"
                          :key="cr.id"
                          class="w-full text-left px-3 py-2.5 hover:bg-white/[0.04] transition-colors"
                          @click="useCannedResponse(cr)"
                        >
                          <div class="flex items-center gap-2">
                            <span class="text-white/80 text-sm font-medium truncate">{{ cr.title }}</span>
                            <span v-if="cr.shortcut" class="text-indigo-400/60 text-[10px] font-mono">{{ cr.shortcut }}</span>
                          </div>
                          <p class="text-white/30 text-xs mt-0.5 truncate">{{ cr.body }}</p>
                          <span v-if="cr.category" class="text-white/20 text-[10px] mt-0.5 block">{{ cr.category }}</span>
                        </button>
                        <div v-if="!filteredCanned.length" class="py-4 text-center text-white/30 text-xs">
                          No templates found
                        </div>
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <!-- Internal Note button -->
                <button
                  class="text-xs flex items-center gap-1 border rounded-lg px-2 py-1 transition-colors"
                  :class="showNoteForm
                    ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                    : 'text-white/40 hover:text-amber-400 border-white/10 hover:border-amber-500/30 hover:bg-amber-500/5'"
                  @click="showNoteForm = !showNoteForm"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Note
                </button>
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

            <!-- Internal Note Form -->
            <Transition name="fade">
              <div v-if="showNoteForm" class="mt-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <p class="text-amber-400/70 text-xs mb-2 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Internal note — only visible to your team, never to customers
                </p>
                <textarea
                  v-model="noteText"
                  rows="2"
                  placeholder="Write an internal note..."
                  class="input-glass w-full resize-none text-sm"
                  @keydown.enter.exact.prevent="sendInternalNote"
                />
                <div class="flex justify-end gap-2 mt-2">
                  <button @click="showNoteForm = false" class="btn-ghost text-xs">Cancel</button>
                  <button
                    class="text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors"
                    :disabled="!noteText.trim() || isSendingNote"
                    @click="sendInternalNote"
                  >
                    {{ isSendingNote ? 'Saving...' : 'Add Note' }}
                  </button>
                </div>
              </div>
            </Transition>
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

            <!-- SLA Timer (Temporizador SLA) -->
            <div v-if="slaCountdown" class="flex items-center justify-between">
              <dt class="text-white/40 text-xs">SLA</dt>
              <dd>
                <span v-if="slaCountdown.responded" class="px-2 py-0.5 rounded-full text-xs border bg-green-500/10 border-green-500/20 text-green-400">
                  ✓ Responded
                </span>
                <span
                  v-else
                  class="px-2 py-0.5 rounded-full text-xs border font-mono"
                  :class="{
                    'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse': slaCountdown.severity === 'breached' || slaCountdown.severity === 'critical',
                    'bg-amber-500/10 border-amber-500/20 text-amber-400': slaCountdown.severity === 'warning',
                    'bg-green-500/10 border-green-500/20 text-green-400': slaCountdown.severity === 'none',
                  }"
                >
                  {{ slaCountdown.display }}
                </span>
              </dd>
            </div>
            <div v-else-if="slaStatus" class="flex items-center justify-between">
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

        <!-- Tags -->
        <UiGlassCard padding="md">
          <h3 class="text-white/60 text-xs font-medium uppercase tracking-wider mb-3">Tags</h3>
          <div class="flex flex-wrap gap-1.5 mb-2">
            <span
              v-for="tag in ticketTags"
              :key="tag.id"
              class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border"
              :style="{ backgroundColor: tag.color + '15', borderColor: tag.color + '30', color: tag.color }"
            >
              {{ tag.name }}
              <button @click="removeTagFromTicket(tag.id)" class="opacity-60 hover:opacity-100 transition-opacity">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
            <div v-if="!ticketTags.length" class="text-white/30 text-xs">No tags</div>
          </div>
          <div class="relative">
            <button
              class="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
              @click="showTagPicker = !showTagPicker"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add tag
            </button>
            <Transition name="fade">
              <div
                v-if="showTagPicker && availableTags.length"
                class="absolute left-0 top-full mt-1 w-48 bg-[#12101f] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
              >
                <button
                  v-for="tag in availableTags"
                  :key="tag.id"
                  class="w-full text-left px-3 py-2 hover:bg-white/[0.04] transition-colors flex items-center gap-2"
                  @click="addTagToTicket(tag.id)"
                >
                  <div class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: tag.color }" />
                  <span class="text-white/70 text-sm">{{ tag.name }}</span>
                </button>
              </div>
            </Transition>
          </div>
        </UiGlassCard>

        <!-- AI Analyze Button (Botón de análisis IA) -->
        <UiGlassCard padding="md">
          <h3 class="text-white/60 text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Analysis
          </h3>
          <button
            class="w-full btn-primary text-sm flex items-center justify-center gap-2"
            :disabled="isAnalyzing"
            @click="analyzeWithAI"
          >
            <svg v-if="isAnalyzing" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {{ isAnalyzing ? 'Analyzing...' : 'Analyze with AI' }}
          </button>
          <p v-if="analysisError" class="text-red-400 text-xs mt-2 text-center">{{ analysisError }}</p>
          <p class="text-white/30 text-xs mt-2 text-center">
            Detects sentiment, priority, category &amp; suggests a reply
          </p>
        </UiGlassCard>

        <!-- AI Summary (Resumen de IA) -->
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
