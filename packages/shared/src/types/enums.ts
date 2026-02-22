// ============================================================================
// Enums — Shared enumerations used across the entire application
// (Enums — Enumeraciones compartidas usadas en toda la aplicación)
// ============================================================================
// Enums define a fixed set of possible values for a field.
// Using enums instead of raw strings prevents typos and enables autocomplete.
// (Los enums definen un conjunto fijo de valores posibles para un campo.
//  Usar enums en lugar de strings crudos previene errores tipográficos y habilita autocompletado.)
// ============================================================================

/**
 * User role within an organization
 * (Rol del usuario dentro de una organización)
 * - ADMIN: Can configure AI, manage agents, view analytics, manage settings
 *   (Puede configurar IA, gestionar agentes, ver analíticas, gestionar ajustes)
 * - AGENT: Can manage tickets, respond to customers, view own performance
 *   (Puede gestionar tickets, responder a clientes, ver su propio rendimiento)
 */
export enum Role {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
}

/**
 * Ticket lifecycle status
 * (Estado del ciclo de vida del ticket)
 * - OPEN: Newly created, not yet assigned or reviewed
 *   (Recién creado, aún no asignado ni revisado)
 * - IN_PROGRESS: An agent is actively working on it
 *   (Un agente está trabajando activamente en él)
 * - RESOLVED: The issue has been addressed, waiting for confirmation
 *   (El problema ha sido atendido, esperando confirmación)
 * - CLOSED: Fully resolved and archived
 *   (Completamente resuelto y archivado)
 */
export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

/**
 * Ticket priority level — determines SLA response times
 * (Nivel de prioridad del ticket — determina tiempos de respuesta SLA)
 * - LOW: Informational, no urgency (Informativo, sin urgencia)
 * - MEDIUM: Standard request (Solicitud estándar)
 * - HIGH: Important issue requiring prompt attention (Problema importante que requiere atención pronta)
 * - URGENT: Critical issue — SLA clock is ticking fast (Problema crítico — el reloj SLA corre rápido)
 */
export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

/**
 * AI-detected sentiment of a customer message
 * (Sentimiento detectado por IA de un mensaje de cliente)
 * - POSITIVE: Customer is happy or grateful (Cliente está contento o agradecido)
 * - NEUTRAL: Factual or informational tone (Tono factual o informativo)
 * - NEGATIVE: Customer is frustrated or angry (Cliente está frustrado o enojado)
 */
export enum Sentiment {
  POSITIVE = 'POSITIVE',
  NEUTRAL = 'NEUTRAL',
  NEGATIVE = 'NEGATIVE',
}

/**
 * Communication channel where the message originated
 * (Canal de comunicación de donde provino el mensaje)
 */
export enum Channel {
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
  WEB = 'WEB',
  SLACK = 'SLACK',
}

/**
 * Who sent a message in a ticket conversation
 * (Quién envió un mensaje en una conversación de ticket)
 * - CUSTOMER: The end client who needs help (El cliente final que necesita ayuda)
 * - AGENT: A support team member (Un miembro del equipo de soporte)
 * - AI: An AI-generated response or suggestion (Una respuesta o sugerencia generada por IA)
 */
export enum SenderType {
  CUSTOMER = 'CUSTOMER',
  AGENT = 'AGENT',
  AI = 'AI',
}

/**
 * Subscription plan for an organization
 * (Plan de suscripción para una organización)
 */
export enum Plan {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}
