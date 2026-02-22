/**
 * Realtime Ticket Subscriptions (Suscripciones Realtime a Tickets)
 * File: composables/useRealtimeTickets.ts
 *
 * Subscribes to Supabase Realtime changes on the `tickets` table for the
 * current org. When a ticket is created or updated by ANYONE (another agent,
 * the intake form, an API call), this immediately reacts without page refresh.
 *
 * HOW SUPABASE REALTIME WORKS:
 * Supabase uses PostgreSQL's Logical Replication to stream row-level changes.
 * When any row in the `tickets` table changes, Supabase broadcasts that change
 * over a WebSocket that all connected clients can listen to.
 *
 * WHY WEBSOCKETS?
 * HTTP is request→response: the client always has to ask first.
 * WebSockets are bidirectional: the server can push data whenever it wants.
 * This is what makes "live" experiences possible.
 *
 * (¿POR QUÉ WEBSOCKETS?
 *  HTTP es solicitud→respuesta: el cliente siempre tiene que preguntar primero.
 *  Los WebSockets son bidireccionales: el servidor puede enviar datos cuando quiera.
 *  Esto hace posibles las experiencias "en vivo".)
 *
 * IMPORTANT: Realtime must be enabled for the `tickets` table in your Supabase
 * dashboard → Database → Replication → Broadcast changes
 */

import { useTicketsStore } from '~/stores/tickets'

export const useRealtimeTickets = () => {
  const supabase = useSupabaseClient()
  const ticketsStore = useTicketsStore()
  const toast = useToast()

  /**
   * Subscribe to ticket changes for a specific org.
   * Returns the Supabase RealtimeChannel so the caller can remove it on unmount.
   *
   * (Suscribirse a cambios de tickets para una org específica.
   *  Retorna el canal para que el llamante pueda eliminarlo al desmontar.)
   */
  function subscribe(orgId: string) {
    const channel = supabase
      .channel(`org-tickets:${orgId}`)

      // ── INSERT ── New ticket arrived (Nuevo ticket llegó) ──────────────────
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tickets',
          // Filter: only receive events for our org to avoid cross-tenant leaks
          // (Filtro: solo recibir eventos de nuestra org para evitar fugas entre tenants)
          filter: `orgId=eq.${orgId}`,
        },
        async () => {
          // Re-fetch the full list to reflect the new ticket (sorted by date,
          // the new ticket appears at the top automatically)
          // (Re-obtener la lista completa para reflejar el nuevo ticket — aparece al principio por el orden por fecha)
          toast.info('🎫 New ticket received')
          await ticketsStore.fetchTickets()
        },
      )

      // ── UPDATE ── An existing ticket was changed (Un ticket existente fue modificado) ─
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tickets',
          filter: `orgId=eq.${orgId}`,
        },
        (payload) => {
          // The payload.new contains the updated row (flat columns, no relations)
          // We update only the primitive fields in-place; relations (like assignedTo)
          // don't change here because they need a JOIN — a full re-fetch handles that.
          //
          // (payload.new contiene la fila actualizada (columnas planas, sin relaciones)
          //  Actualizamos solo los campos primitivos en su lugar; las relaciones como assignedTo
          //  necesitan un JOIN — un re-fetch completo maneja eso.)
          const updated = payload.new as any
          const idx = ticketsStore.tickets.findIndex(t => t.id === updated.id)

          if (idx >= 0) {
            // Only update scalar fields to avoid overwriting populated relations
            // (Solo actualizar campos escalares para no sobrescribir relaciones pobladas)
            const existing = ticketsStore.tickets[idx]
            if (existing) {
              Object.assign(existing, {
                status: updated.status,
                priority: updated.priority,
                assignedToId: updated.assignedToId,
                updatedAt: updated.updatedAt,
                sentiment: updated.sentiment,
                category: updated.category,
              })
            }
          }

          // If the updated ticket is the one currently open in the detail view,
          // trigger a silent background re-fetch to refresh all its data
          // (Si el ticket actualizado es el que está abierto en la vista de detalle,
          //  disparar un re-fetch silencioso en segundo plano para actualizar todos sus datos)
          if (ticketsStore.currentTicket?.id === updated.id) {
            ticketsStore.fetchTicket(updated.id)
          }
        },
      )

      .subscribe((status) => {
        // 'SUBSCRIBED' = connected, 'CLOSED' = disconnected
        // (Podemos loggear el estado de la conexión para debug)
        if (import.meta.dev) {
          console.log(`[Realtime:tickets] status →`, status)
        }
      })

    return channel
  }

  return { subscribe }
}
