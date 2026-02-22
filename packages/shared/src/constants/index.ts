// ============================================================================
// Constants — Application-wide constant values
// (Constantes — Valores constantes de toda la aplicación)
// ============================================================================
// Constants are values that NEVER change during runtime. Centralizing them here
// prevents "magic numbers" and "magic strings" scattered across the codebase.
// (Las constantes son valores que NUNCA cambian durante la ejecución.
//  Centralizarlas aquí previene "números mágicos" y "strings mágicos"
//  dispersos por el código.)
// ============================================================================

// === Default SLA Times (Tiempos SLA por defecto) ===
// Maximum response time in minutes for each priority level
// (Tiempo máximo de respuesta en minutos para cada nivel de prioridad)
export const DEFAULT_SLA_MINUTES = {
  LOW: 1440,      // 24 hours (24 horas)
  MEDIUM: 480,    // 8 hours (8 horas)
  HIGH: 120,      // 2 hours (2 horas)
  URGENT: 30,     // 30 minutes (30 minutos)
} as const

// === Pagination Defaults (Valores por defecto de paginación) ===
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const

// === Ticket Categories (Categorías de tickets) ===
// Default categories that AI can assign to tickets
// (Categorías por defecto que la IA puede asignar a los tickets)
export const TICKET_CATEGORIES = [
  'billing',       // Billing & payments (Facturación y pagos)
  'technical',     // Technical support (Soporte técnico)
  'sales',         // Sales inquiries (Consultas de ventas)
  'feedback',      // Customer feedback (Feedback de clientes)
  'complaint',     // Complaints (Quejas)
  'general',       // General inquiries (Consultas generales)
  'onboarding',    // New customer setup (Configuración de nuevo cliente)
  'cancellation',  // Cancellation requests (Solicitudes de cancelación)
] as const

// === Sentiment Labels (Etiquetas de sentimiento) ===
// Human-readable labels and emoji for each sentiment level
// (Etiquetas legibles y emoji para cada nivel de sentimiento)
export const SENTIMENT_CONFIG = {
  POSITIVE: { label: 'Positive', labelEs: 'Positivo', emoji: '😊', color: 'text-green-400' },
  NEUTRAL: { label: 'Neutral', labelEs: 'Neutral', emoji: '😐', color: 'text-amber-400' },
  NEGATIVE: { label: 'Negative', labelEs: 'Negativo', emoji: '😠', color: 'text-red-400' },
} as const

// === Priority Labels (Etiquetas de prioridad) ===
export const PRIORITY_CONFIG = {
  LOW: { label: 'Low', labelEs: 'Baja', color: 'bg-green-500', textColor: 'text-green-400' },
  MEDIUM: { label: 'Medium', labelEs: 'Media', color: 'bg-amber-500', textColor: 'text-amber-400' },
  HIGH: { label: 'High', labelEs: 'Alta', color: 'bg-orange-500', textColor: 'text-orange-400' },
  URGENT: { label: 'Urgent', labelEs: 'Urgente', color: 'bg-red-500', textColor: 'text-red-400' },
} as const

// === Status Labels (Etiquetas de estado) ===
export const STATUS_CONFIG = {
  OPEN: { label: 'Open', labelEs: 'Abierto', color: 'bg-blue-500', textColor: 'text-blue-400' },
  IN_PROGRESS: { label: 'In Progress', labelEs: 'En Progreso', color: 'bg-yellow-500', textColor: 'text-yellow-400' },
  RESOLVED: { label: 'Resolved', labelEs: 'Resuelto', color: 'bg-green-500', textColor: 'text-green-400' },
  CLOSED: { label: 'Closed', labelEs: 'Cerrado', color: 'bg-gray-500', textColor: 'text-gray-400' },
} as const

// === Channel Labels (Etiquetas de canal) ===
export const CHANNEL_CONFIG = {
  EMAIL: { label: 'Email', icon: '📧' },
  WHATSAPP: { label: 'WhatsApp', icon: '💬' },
  WEB: { label: 'Web', icon: '🌐' },
  SLACK: { label: 'Slack', icon: '💼' },
} as const

// === AI Configuration (Configuración de IA) ===
export const AI_CONFIG = {
  MODEL: 'gemini-1.5-flash',
  MAX_TOKENS: 1024,
  TEMPERATURE: 0.3,  // Low temperature = more deterministic/consistent outputs
                      // (Temperatura baja = outputs más deterministas/consistentes)
  // Threshold: if negative sentiment score > this, auto-escalate to URGENT
  // (Umbral: si el score de sentimiento negativo > esto, auto-escalar a URGENTE)
  AUTO_ESCALATE_THRESHOLD: 0.8,
} as const

// === Application Limits (Límites de la aplicación) ===
export const APP_LIMITS = {
  FREE: {
    MAX_TICKETS_PER_MONTH: 100,
    MAX_AGENTS: 2,
    MAX_AI_ANALYSES: 50,
  },
  STARTER: {
    MAX_TICKETS_PER_MONTH: 1000,
    MAX_AGENTS: 5,
    MAX_AI_ANALYSES: 500,
  },
  PRO: {
    MAX_TICKETS_PER_MONTH: 10000,
    MAX_AGENTS: 25,
    MAX_AI_ANALYSES: 5000,
  },
  ENTERPRISE: {
    MAX_TICKETS_PER_MONTH: Infinity,
    MAX_AGENTS: Infinity,
    MAX_AI_ANALYSES: Infinity,
  },
} as const
