<!--
  Tickets List Page (Página de lista de tickets)
  Route: /dashboard/tickets
  Layout: dashboard

  KEY CONCEPTS USED HERE:
  1. Pinia store (useTicketsStore) — centralized state; survives component re-mounts
  2. URL-synced filters — filter state reflected in the URL query so users can bookmark/share
  3. Debounced search — waits 400ms after typing stops before calling the API
     (without debounce, every keystroke would fire an API call)
  4. watchEffect — automatically re-fetches when reactive filters change

  (CONCEPTOS CLAVE:
   1. Store de Pinia — estado centralizado; sobrevive a re-montajes del componente
   2. Filtros sincronizados con URL — se puede marcar/compartir
   3. Búsqueda debounced — espera 400ms tras el último tecleo
   4. watchEffect — re-obtiene automáticamente cuando cambian los filtros)
-->
<script setup lang="ts">
import { useTicketsStore } from '~/stores/tickets'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'dashboard' })

const ticketsStore = useTicketsStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

// ── Realtime subscription (Suscripción en tiempo real) ──────────────────────
// We subscribe to ticket changes for this org as soon as the page mounts.
// When another agent creates/updates a ticket, our list auto-refreshes.
//
// LIFECYCLE PATTERN:
//   onMounted  → start channel (open WebSocket connection)
//   onUnmounted → remove channel (close WebSocket, free memory)
//
// (PATRÓN DE CICLO DE VIDA:
//  onMounted → iniciar canal (abrir conexión WebSocket)
//  onUnmounted → eliminar canal (cerrar WebSocket, liberar memoria))
const { subscribe } = useRealtimeTickets()
const supabase = useSupabaseClient()
let realtimeChannel: ReturnType<typeof supabase.channel> | null = null

// Local search input — separate from filters so we can debounce it
// (Input de búsqueda local — separado de filtros para poder debouncearlo)
const searchInput = ref(String(route.query.search ?? ''))
let searchDebounce: ReturnType<typeof setTimeout> | null = null

// Status / priority filter selects (Selects de filtro de estado/prioridad)
const selectedStatus = ref(String(route.query.status ?? ''))
const selectedPriority = ref(String(route.query.priority ?? ''))

// Apply URL params as initial filters on mount (Aplicar parámetros URL como filtros iniciales)
onMounted(async () => {
  await ticketsStore.fetchTickets({
    search: searchInput.value || undefined,
    status: (selectedStatus.value as any) || undefined,
    priority: (selectedPriority.value as any) || undefined,
  })

  // Start the realtime subscription once auth is ready and orgId is known
  // (Iniciar la suscripción realtime una vez que la auth está lista y el orgId es conocido)
  const orgId = authStore.currentUser?.orgId
  if (orgId) {
    realtimeChannel = subscribe(orgId)
  }
})

// Clean up WebSocket when user leaves the page
// (Limpiar el WebSocket cuando el usuario deja la página)
onUnmounted(() => {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel)
    realtimeChannel = null
  }
})

// Debounced search: wait 400ms after last keystroke, then call the API
// (Búsqueda debounced: esperar 400ms tras el último keystroke, luego llamar a la API)
function onSearchInput() {
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    // Sync to URL (Sincronizar con URL)
    router.replace({ query: { ...route.query, search: searchInput.value || undefined, page: undefined } })
    ticketsStore.setFilter('search', searchInput.value || undefined)
  }, 400)
}

function onStatusChange() {
  router.replace({ query: { ...route.query, status: selectedStatus.value || undefined, page: undefined } })
  ticketsStore.setFilter('status', (selectedStatus.value as any) || undefined)
}

function onPriorityChange() {
  router.replace({ query: { ...route.query, priority: selectedPriority.value || undefined, page: undefined } })
  ticketsStore.setFilter('priority', (selectedPriority.value as any) || undefined)
}

function clearFilters() {
  searchInput.value = ''
  selectedStatus.value = ''
  selectedPriority.value = ''
  router.replace({ query: {} })
  ticketsStore.resetFilters()
}

// Toggle sort (Alternar orden)
function toggleSort(field: 'createdAt' | 'updatedAt' | 'priority' | 'subject') {
  const current = ticketsStore.filters.sortBy
  const currentOrder = ticketsStore.filters.sortOrder
  if (current === field) {
    ticketsStore.setFilter('sortOrder', currentOrder === 'desc' ? 'asc' : 'desc')
  } else {
    ticketsStore.filters.sortBy = field
    ticketsStore.filters.sortOrder = 'desc'
    ticketsStore.fetchTickets()
  }
}

// --- DISPLAY HELPERS ---
const statusConfig: Record<string, { label: string; class: string }> = {
  OPEN: { label: 'Open', class: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
  IN_PROGRESS: { label: 'In Progress', class: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
  RESOLVED: { label: 'Resolved', class: 'bg-green-500/20 text-green-300 border border-green-500/30' },
  CLOSED: { label: 'Closed', class: 'bg-white/10 text-white/50 border border-white/10' },
}

const priorityConfig: Record<string, { label: string; dot: string; text: string }> = {
  URGENT: { label: 'Urgent', dot: 'bg-red-500', text: 'text-red-400' },
  HIGH: { label: 'High', dot: 'bg-orange-400', text: 'text-orange-400' },
  MEDIUM: { label: 'Medium', dot: 'bg-amber-400', text: 'text-amber-400' },
  LOW: { label: 'Low', dot: 'bg-green-400', text: 'text-green-400' },
}

const sentimentEmoji: Record<string, string> = {
  POSITIVE: '😊',
  NEUTRAL: '😐',
  NEGATIVE: '😡',
}

const channelIcon: Record<string, string> = {
  EMAIL: '✉️',
  WHATSAPP: '💬',
  WEB: '🌐',
  SLACK: '⚡',
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

const hasActiveFilters = computed(
  () => !!(searchInput.value || selectedStatus.value || selectedPriority.value)
)

// --- BULK ACTIONS ---
const selectedTickets = ref<Set<string>>(new Set())
const isBulkProcessing = ref(false)
const toast = useToast()

const isAllSelected = computed(() => {
  if (!ticketsStore.tickets.length) return false
  return ticketsStore.tickets.every((t: any) => selectedTickets.value.has(t.id))
})

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedTickets.value.clear()
  } else {
    ticketsStore.tickets.forEach((t: any) => selectedTickets.value.add(t.id))
  }
}

function toggleTicket(id: string) {
  if (selectedTickets.value.has(id)) {
    selectedTickets.value.delete(id)
  } else {
    selectedTickets.value.add(id)
  }
}

async function bulkAction(action: string, value?: string) {
  if (!selectedTickets.value.size) return
  isBulkProcessing.value = true
  try {
    const res = await $fetch<{ data: { updatedCount: number } }>('/api/tickets/bulk', {
      method: 'POST',
      body: {
        ticketIds: Array.from(selectedTickets.value),
        action,
        value,
      },
    })
    toast.success(`Updated ${res.data.updatedCount} ticket(s)`)
    selectedTickets.value.clear()
    await ticketsStore.fetchTickets()
  } catch (e: any) {
    toast.error(e?.data?.message ?? 'Bulk action failed')
  } finally {
    isBulkProcessing.value = false
  }
}
</script>

<template>
  <div class="space-y-5 animate-fade-in">
    <!-- Header + Actions (Encabezado + Acciones) -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-white">Tickets</h2>
        <p class="text-white/50 text-sm mt-0.5">
          {{ ticketsStore.meta?.total ?? '...' }} total tickets
        </p>
      </div>
      <NuxtLink
        to="/dashboard/tickets/new"
        class="btn-primary flex items-center gap-2 text-sm"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Ticket
      </NuxtLink>
    </div>

    <!-- Filters Bar (Barra de filtros) -->
    <UiGlassCard padding="sm">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Search input (Input de búsqueda) -->
        <div class="relative flex-1 min-w-[200px]">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchInput"
            type="search"
            placeholder="Search tickets..."
            class="input-glass pl-9 text-sm"
            @input="onSearchInput"
          />
        </div>

        <!-- Status filter (Filtro de estado) -->
        <select
          v-model="selectedStatus"
          class="input-glass select-arrow text-sm min-w-[130px] cursor-pointer appearance-none pr-10"
          @change="onStatusChange"
        >
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>

        <!-- Priority filter (Filtro de prioridad) -->
        <select
          v-model="selectedPriority"
          class="input-glass select-arrow text-sm min-w-[130px] cursor-pointer appearance-none pr-10"
          @change="onPriorityChange"
        >
          <option value="">All priorities</option>
          <option value="URGENT">🔴 Urgent</option>
          <option value="HIGH">🟠 High</option>
          <option value="MEDIUM">🟡 Medium</option>
          <option value="LOW">🟢 Low</option>
        </select>

        <!-- Clear filters (Limpiar filtros) -->
        <button
          v-if="hasActiveFilters"
          class="btn-ghost text-sm flex items-center gap-1.5"
          @click="clearFilters"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear
        </button>
      </div>
    </UiGlassCard>

    <!-- Bulk Action Bar (Barra de acciones masivas) -->
    <Transition name="fade">
      <UiGlassCard v-if="selectedTickets.size > 0" padding="md">
        <div class="flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-2">
            <span class="text-white font-medium text-sm">{{ selectedTickets.size }} selected</span>
            <button class="text-white/40 hover:text-white/60 text-xs underline transition-colors" @click="selectedTickets.clear()">
              Clear
            </button>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <!-- Status actions -->
            <button
              class="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5"
              :disabled="isBulkProcessing"
              @click="bulkAction('updateStatus', 'IN_PROGRESS')"
            >
              ⚙️ Mark In Progress
            </button>
            <button
              class="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5"
              :disabled="isBulkProcessing"
              @click="bulkAction('updateStatus', 'RESOLVED')"
            >
              ✅ Resolve
            </button>
            <button
              class="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5"
              :disabled="isBulkProcessing"
              @click="bulkAction('updateStatus', 'CLOSED')"
            >
              🔒 Close
            </button>
            <!-- Priority actions -->
            <button
              class="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5 text-red-400 hover:text-red-300"
              :disabled="isBulkProcessing"
              @click="bulkAction('updatePriority', 'URGENT')"
            >
              🔴 Urgent
            </button>
            <!-- Unassign action -->
            <button
              class="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5"
              :disabled="isBulkProcessing"
              @click="bulkAction('unassign')"
            >
              Unassign
            </button>
          </div>
        </div>
      </UiGlassCard>
    </Transition>

    <!-- Tickets Table (Tabla de tickets) -->
    <UiGlassCard padding="none">
      <!-- Table header (Encabezado de tabla) -->
      <div class="px-5 py-3 border-b border-white/10">
        <div class="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-3 items-center text-xs text-white/40 font-medium uppercase tracking-wider">
          <!-- Select all checkbox -->
          <label class="flex items-center cursor-pointer" @click.stop>
            <input
              type="checkbox"
              :checked="isAllSelected"
              class="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/30 cursor-pointer"
              @change="toggleSelectAll"
            />
          </label>
          <button class="text-left flex items-center gap-1 hover:text-white/60 transition-colors" @click="toggleSort('createdAt')">
            Ticket
            <svg v-if="ticketsStore.filters.sortBy === 'createdAt'" class="w-3 h-3" :class="ticketsStore.filters.sortOrder === 'asc' ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <span class="hidden md:block">Status</span>
          <button class="hidden md:flex items-center gap-1 hover:text-white/60 transition-colors" @click="toggleSort('priority')">
            Priority
            <svg v-if="ticketsStore.filters.sortBy === 'priority'" class="w-3 h-3" :class="ticketsStore.filters.sortOrder === 'asc' ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <span class="hidden lg:block">Agent</span>
          <button class="flex items-center gap-1 hover:text-white/60 transition-colors" @click="toggleSort('updatedAt')">
            Updated
            <svg v-if="ticketsStore.filters.sortBy === 'updatedAt'" class="w-3 h-3" :class="ticketsStore.filters.sortOrder === 'asc' ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Loading skeleton (Skeleton de carga) -->
      <div v-if="ticketsStore.isLoadingList" class="p-4 space-y-2">
        <div
          v-for="i in 8"
          :key="i"
          class="h-14 rounded-lg bg-white/5 animate-pulse"
          :style="{ animationDelay: `${i * 50}ms` }"
        />
      </div>

      <!-- Error state (Estado de error) -->
      <div v-else-if="ticketsStore.error" class="py-12 text-center text-red-400 text-sm">
        {{ ticketsStore.error }}
        <button class="block mx-auto mt-3 text-white/40 hover:text-white/60 transition-colors underline text-xs" @click="ticketsStore.fetchTickets()">
          Try again
        </button>
      </div>

      <!-- Empty state (Estado vacío) -->
      <div v-else-if="!ticketsStore.tickets.length" class="py-16 text-center">
        <div class="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
          <svg class="w-7 h-7 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p class="text-white/40 text-sm">{{ hasActiveFilters ? 'No tickets match your filters.' : 'No tickets yet.' }}</p>
        <button v-if="hasActiveFilters" class="mt-3 text-indigo-400 hover:text-indigo-300 text-sm transition-colors" @click="clearFilters">
          Clear filters
        </button>
      </div>

      <!-- Ticket rows (Filas de tickets) -->
      <div v-else class="divide-y divide-white/5">
        <div
          v-for="ticket in ticketsStore.tickets"
          :key="ticket.id"
          class="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-3 items-center px-5 py-4 hover:bg-white/5 transition-colors group"
          :class="{ 'bg-indigo-500/5': selectedTickets.has(ticket.id) }"
        >
          <!-- Checkbox -->
          <label class="flex items-center cursor-pointer" @click.stop>
            <input
              type="checkbox"
              :checked="selectedTickets.has(ticket.id)"
              class="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/30 cursor-pointer"
              @change="toggleTicket(ticket.id)"
            />
          </label>
          <!-- Ticket info + SLA warning (clickable) -->
          <NuxtLink :to="`/dashboard/tickets/${ticket.id}`" class="min-w-0">
            <div class="flex items-center gap-2">
              <!-- SLA breach indicator (Indicador de incumplimiento SLA) -->
              <span
                v-if="ticket.isBreachingSla"
                class="inline-flex flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"
                title="SLA Breaching"
              />
              <p class="text-white text-sm font-medium truncate group-hover:text-indigo-300 transition-colors">
                {{ ticket.subject }}
              </p>
              <!-- Sentiment + channel (Sentimiento + canal) -->
              <span v-if="ticket.sentiment" class="flex-shrink-0 text-xs" :title="ticket.sentiment">
                {{ sentimentEmoji[ticket.sentiment] }}
              </span>
              <span v-if="ticket.channel" class="flex-shrink-0 text-xs" :title="ticket.channel">
                {{ channelIcon[ticket.channel] }}
              </span>
            </div>
            <p class="text-white/40 text-xs mt-0.5 truncate">
              {{ ticket.customerName || ticket.customerEmail || 'Unknown customer' }}
              <span v-if="(ticket._count?.messages ?? 0) > 0" class="ml-2">
                · {{ ticket._count?.messages }} msg{{ (ticket._count?.messages ?? 0) === 1 ? '' : 's' }}
              </span>
            </p>
          </NuxtLink>

          <!-- Status badge (Insignia de estado) -->
          <span class="hidden md:inline-flex px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap" :class="statusConfig[ticket.status]?.class">
            {{ statusConfig[ticket.status]?.label }}
          </span>

          <!-- Priority (Prioridad) -->
          <div class="hidden md:flex items-center gap-1.5">
            <div class="w-2 h-2 rounded-full" :class="priorityConfig[ticket.priority]?.dot" />
            <span class="text-xs" :class="priorityConfig[ticket.priority]?.text">
              {{ priorityConfig[ticket.priority]?.label }}
            </span>
          </div>

          <!-- Assigned agent avatar (Avatar del agente asignado) -->
          <div class="hidden lg:flex items-center justify-center w-7 h-7">
            <div
              v-if="ticket.assignedTo"
              class="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold"
              :title="ticket.assignedTo.fullName"
            >
              {{ ticket.assignedTo.fullName.charAt(0).toUpperCase() }}
            </div>
            <div v-else class="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/20">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          <!-- Updated time (Hora de actualización) -->
          <span class="text-white/30 text-xs whitespace-nowrap">
            {{ timeAgo(ticket.updatedAt) }}
          </span>
        </div>
      </div>

      <!-- Pagination (Paginación) -->
      <div
        v-if="(ticketsStore.meta?.totalPages ?? 0) > 1"
        class="flex items-center justify-between px-5 py-3 border-t border-white/10"
      >
        <p class="text-white/40 text-xs">
          Page {{ ticketsStore.currentPage }} of {{ ticketsStore.totalPages }}
          · {{ ticketsStore.meta?.total }} tickets
        </p>
        <div class="flex gap-2">
          <button
            :disabled="!ticketsStore.hasPrevPage"
            class="btn-ghost text-xs px-3 py-1.5 disabled:opacity-30"
            @click="ticketsStore.goToPage(ticketsStore.currentPage - 1)"
          >
            ← Prev
          </button>
          <button
            :disabled="!ticketsStore.hasNextPage"
            class="btn-ghost text-xs px-3 py-1.5 disabled:opacity-30"
            @click="ticketsStore.goToPage(ticketsStore.currentPage + 1)"
          >
            Next →
          </button>
        </div>
      </div>
    </UiGlassCard>
  </div>
</template>

<style scoped>
.select-arrow {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.4)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-size: 16px 16px;
  background-position: right 12px center;
  background-repeat: no-repeat;
}
</style>
