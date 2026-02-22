/**
 * Tickets Store (Pinia)
 * File: stores/tickets.ts
 *
 * Manages the state of the tickets system:
 * - The list of tickets (with pagination metadata)
 * - The currently open ticket detail
 * - Active filters (for the UI filter panel)
 * - Loading/error states per operation
 *
 * WHY A SEPARATE STORE FROM AUTH?
 * In Pinia (and Redux, Zustand, Vuex) it's best practice to split stores by
 * "domain" — auth data, ticket data, analytics data are separate concerns.
 * Smaller stores are easier to test, maintain and understand.
 *
 * (¿POR QUÉ UN STORE SEPARADO DE AUTH?
 *  En Pinia es mejor práctica dividir stores por "dominio" — datos de auth,
 *  datos de tickets, datos de analytics son preocupaciones separadas.
 *  Los stores más pequeños son más fáciles de probar, mantener y entender.)
 */

import type { Ticket, PaginatedResponse, TicketFilters } from '@ata/shared'
import { PAGINATION } from '@ata/shared'

// Type for a single ticket with relations (Tipo para un ticket con relaciones)
type TicketWithRelations = Ticket & {
  assignedAgent?: { id: string; name: string; avatarUrl: string | null } | null
  isBreachingSla?: boolean
  _count?: { messages: number; aiSuggestions: number }
}

// Type for ticket detail page (full with messages + AI)
// (Tipo para la página de detalle de ticket — completo con mensajes + IA)
type TicketDetail = TicketWithRelations & {
  messages: Array<{
    id: string
    content: string
    senderType: string
    createdAt: string
    sender?: { id: string; name: string; avatarUrl: string | null; role: string } | null
  }>
  aiSuggestions: Array<{
    id: string
    suggestedReply: string | null
    confidence: number | null
    category: string | null
    reasoning: string | null
    createdAt: string
  }>
}

export const useTicketsStore = defineStore('tickets', () => {
  // --- STATE (ESTADO) ---
  // The paginated list of tickets (La lista paginada de tickets)
  const tickets = ref<TicketWithRelations[]>([])
  const meta = ref<PaginatedResponse<unknown>['meta'] | null>(null)

  // The currently open ticket in the detail view
  // (El ticket actualmente abierto en la vista de detalle)
  const currentTicket = ref<TicketDetail | null>(null)

  // Active filter state — kept in store so filters persist across page navigations
  // (Estado de filtros activos — en el store para que los filtros persistan entre navegaciones)
  const filters = ref<TicketFilters>({
    page: 1,
    limit: PAGINATION.DEFAULT_LIMIT,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  // Loading states per operation (Estados de carga por operación)
  const isLoadingList = ref(false)
  const isLoadingDetail = ref(false)
  const isUpdating = ref(false)

  // Error state (Estado de error)
  const error = ref<string | null>(null)

  // --- GETTERS (GETTERS) ---
  const totalPages = computed(() => meta.value?.totalPages ?? 1)
  const hasNextPage = computed(() => meta.value?.hasNextPage ?? false)
  const hasPrevPage = computed(() => meta.value?.hasPrevPage ?? false)
  const currentPage = computed(() => filters.value.page ?? 1)

  // --- ACTIONS (ACCIONES) ---

  /**
   * Fetch the ticket list with current filters.
   * Called when: page loads, filters change, after updates.
   *
   * (Obtener la lista de tickets con los filtros actuales.
   *  Se llama cuando: la página carga, los filtros cambian, después de actualizaciones.)
   */
  async function fetchTickets(overrideFilters?: Partial<TicketFilters>) {
    isLoadingList.value = true
    error.value = null

    // Merge any overrides into current filters (Combinar overrides con filtros actuales)
    if (overrideFilters) {
      filters.value = { ...filters.value, ...overrideFilters }
    }

    try {
      // Convert filters object to URL query string
      // (Convertir objeto de filtros a cadena de consulta URL)
      const query = Object.entries(filters.value)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {} as Record<string, any>)

      const response = await $fetch<PaginatedResponse<TicketWithRelations>>('/api/tickets', {
        query,
      })

      tickets.value = response.data
      meta.value = response.meta
    } catch (e: any) {
      error.value = e?.data?.message ?? 'Failed to load tickets'
      tickets.value = []
    } finally {
      isLoadingList.value = false
    }
  }

  /**
   * Fetch a single ticket for the detail view.
   * (Obtener un ticket individual para la vista de detalle.)
   */
  async function fetchTicket(id: string) {
    isLoadingDetail.value = true
    error.value = null
    try {
      const response = await $fetch<{ data: TicketDetail }>(`/api/tickets/${id}`)
      currentTicket.value = response.data
    } catch (e: any) {
      error.value = e?.data?.message ?? 'Failed to load ticket'
      currentTicket.value = null
    } finally {
      isLoadingDetail.value = false
    }
  }

  /**
   * Partially update a ticket (status, priority, assignment).
   * Optimistic update: update local state immediately, then sync with server.
   *
   * OPTIMISTIC UPDATES EXPLAINED:
   * Without it: user clicks "Resolve" → waits for server → UI updates (slow feeling)
   * With it: user clicks "Resolve" → UI updates immediately → server syncs in bg (fast!)
   * If server fails, we roll back to the previous state.
   *
   * (ACTUALIZACIONES OPTIMISTAS:
   *  Sin ellas: usuario hace clic en "Resolver" → espera al servidor → UI actualiza (lento)
   *  Con ellas: usuario hace clic → UI actualiza inmediatamente → servidor sincroniza en bg (rápido!)
   *  Si el servidor falla, revertimos al estado anterior.)
   */
  async function updateTicket(id: string, data: Partial<TicketWithRelations>) {
    isUpdating.value = true
    error.value = null

    // 1. Save current state for rollback (Guardar estado actual para revertir)
    const previousTicket = currentTicket.value
    const listIndex = tickets.value.findIndex(t => t.id === id)
    const previousListItem = listIndex >= 0 ? { ...tickets.value[listIndex] } : null

    // 2. Optimistic update (Actualización optimista)
    if (currentTicket.value?.id === id) {
      currentTicket.value = { ...currentTicket.value, ...data } as TicketDetail
    }
    if (listIndex >= 0) {
      tickets.value[listIndex] = { ...tickets.value[listIndex], ...data }
    }

    try {
      const response = await $fetch<{ data: TicketWithRelations }>(`/api/tickets/${id}`, {
        method: 'PATCH',
        body: data,
      })

      // 3. Sync with real server response (Sincronizar con respuesta real del servidor)
      if (currentTicket.value?.id === id) {
        currentTicket.value = { ...currentTicket.value, ...response.data } as TicketDetail
      }
      if (listIndex >= 0) {
        tickets.value[listIndex] = { ...tickets.value[listIndex], ...response.data }
      }

      return response.data
    } catch (e: any) {
      // 4. Rollback on failure (Revertir en caso de fallo)
      if (previousTicket) currentTicket.value = previousTicket
      if (listIndex >= 0 && previousListItem) {
        tickets.value[listIndex] = previousListItem as TicketWithRelations
      }
      error.value = e?.data?.message ?? 'Failed to update ticket'
      throw e
    } finally {
      isUpdating.value = false
    }
  }

  /**
   * Update filters and re-fetch the list.
   * (Actualizar filtros y volver a obtener la lista.)
   */
  function setFilter(key: keyof TicketFilters, value: any) {
    filters.value = { ...filters.value, [key]: value, page: 1 } // Reset to page 1 on filter change
    fetchTickets()
  }

  /**
   * Reset all filters to defaults (Restablecer filtros al estado por defecto)
   */
  function resetFilters() {
    filters.value = {
      page: 1,
      limit: PAGINATION.DEFAULT_LIMIT,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }
    fetchTickets()
  }

  /**
   * Go to a specific page (Ir a una página específica)
   */
  function goToPage(page: number) {
    filters.value = { ...filters.value, page }
    fetchTickets()
  }

  return {
    // State
    tickets,
    meta,
    currentTicket,
    filters,
    isLoadingList,
    isLoadingDetail,
    isUpdating,
    error,
    // Getters
    totalPages,
    hasNextPage,
    hasPrevPage,
    currentPage,
    // Actions
    fetchTickets,
    fetchTicket,
    updateTicket,
    setFilter,
    resetFilters,
    goToPage,
  }
})
