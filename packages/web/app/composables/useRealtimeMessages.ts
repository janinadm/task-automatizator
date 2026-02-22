/**
 * Realtime Message Subscriptions (Suscripciones Realtime a Mensajes)
 * File: composables/useRealtimeMessages.ts
 *
 * Subscribes to new messages on a specific ticket's conversation thread.
 * This powers the "live chat" feel: when an agent sends a reply, another agent
 * watching the same ticket sees it appear instantly without reloading.
 *
 * USE CASE EXAMPLE:
 * Agent A is typing in the ticket detail page. Agent B (the supervisor) has the
 * same ticket open. When Agent A sends their reply, Agent B sees it appear in
 * real-time — just like a chat application.
 *
 * (CASO DE USO:
 *  El Agente A está escribiendo en la página de detalle del ticket. El Agente B (el supervisor)
 *  tiene el mismo ticket abierto. Cuando el Agente A envía su respuesta, el Agente B la
 *  ve aparecer en tiempo real — como una aplicación de chat.)
 *
 * TABLE: ticket_messages (@@map in Prisma schema)
 * FILTER: ticketId = the current ticket's ID
 *
 * IMPORTANT: Realtime must be enabled for `ticket_messages` in Supabase:
 * Dashboard → Database → Replication → Broadcast changes
 */

import { useTicketsStore } from '~/stores/tickets'

export const useRealtimeMessages = () => {
  const supabase = useSupabaseClient()
  const ticketsStore = useTicketsStore()
  const toast = useToast()

  /**
   * Subscribe to new messages for a specific ticket.
   * Returns the channel for cleanup in onUnmounted.
   *
   * (Suscribirse a nuevos mensajes de un ticket específico.
   *  Retorna el canal para limpiar en onUnmounted.)
   */
  function subscribe(ticketId: string) {
    const channel = supabase
      .channel(`ticket-messages:${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages',
          // Filter by the specific ticket's ID column
          // (Filtrar por la columna ID del ticket específico)
          filter: `ticketId=eq.${ticketId}`,
        },
        async (payload) => {
          // Check if we already have this message in the store
          // (the page might have fetched it already via a manual refresh)
          // (Verificar si ya tenemos este mensaje en el store
          //  la página puede haberlo obtenido ya via un refresh manual)
          const newMsgId = (payload.new as any)?.id
          const alreadyInStore = ticketsStore.currentTicket?.messages?.some(
            m => m.id === newMsgId,
          )

          if (!alreadyInStore) {
            // Re-fetch the full ticket to get the complete message with sender details
            // (we can't populate sender.fullName, avatarUrl from just the raw row)
            //
            // OPTIMIZATION OPPORTUNITY: Instead of a full re-fetch, you could:
            // 1. Build the message object from payload.new + sender lookup
            // 2. Append it directly to currentTicket.messages
            // For educational simplicity, we do a full re-fetch here.
            //
            // (OPORTUNIDAD DE OPTIMIZACIÓN: En lugar de un re-fetch completo, podrías:
            //  1. Construir el objeto de mensaje desde payload.new + búsqueda del remitente
            //  2. Adjuntarlo directamente a currentTicket.messages
            //  Por simplicidad educativa, hacemos un re-fetch completo aquí.)
            await ticketsStore.fetchTicket(ticketId)
            toast.info('💬 New message in this ticket')
          }
        },
      )
      .subscribe((status) => {
        if (import.meta.dev) {
          console.log(`[Realtime:messages:${ticketId}] status →`, status)
        }
      })

    return channel
  }

  return { subscribe }
}
