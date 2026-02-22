// ============================================================================
// API Types — Request/Response shapes for our REST API
// (Tipos de API — Formas de Request/Response para nuestra API REST)
// ============================================================================
// These types define the "contract" between frontend and backend.
// When the frontend sends a request or receives a response, it knows exactly
// what shape the data will have. This prevents bugs caused by mismatched data.
// (Estos tipos definen el "contrato" entre frontend y backend.
//  Cuando el frontend envía una request o recibe una respuesta, sabe exactamente
//  qué forma tendrán los datos. Esto previene bugs causados por datos desalineados.)
// ============================================================================

import type { Ticket, TicketMessage, AiSuggestion, User, Organization } from './entities'
import type { TicketStatus, Priority, Sentiment, Channel } from './enums'

// === Pagination (Paginación) ===
// Standard paginated response wrapper — used for any list endpoint
// (Wrapper de respuesta paginada estándar — usado para cualquier endpoint de lista)
export interface PaginatedResponse<T> {
  data: T[]
  total: number          // Total matching records (Total de registros coincidentes)
  page: number           // Current page (Página actual)
  pageSize: number       // Items per page (Elementos por página)
  totalPages: number     // Total number of pages (Número total de páginas)
}

// === Ticket API Types (Tipos de API de Tickets) ===

// Filters for querying tickets (Filtros para consultar tickets)
export interface TicketFilters {
  status?: TicketStatus
  priority?: Priority
  sentiment?: Sentiment
  channel?: Channel
  assignedToId?: string
  search?: string        // Full-text search on subject/body (Búsqueda de texto completo en asunto/cuerpo)
  dateFrom?: string      // ISO 8601 date string (Fecha en formato ISO 8601)
  dateTo?: string
  page?: number
  pageSize?: number
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'subject'
  sortOrder?: 'asc' | 'desc'
}

// Payload for creating a new ticket (Carga para crear un nuevo ticket)
export interface CreateTicketPayload {
  subject: string
  body: string
  channel: Channel
  customerName?: string
  customerEmail?: string
}

// Payload for updating a ticket (Carga para actualizar un ticket)
export interface UpdateTicketPayload {
  status?: TicketStatus
  priority?: Priority
  assignedToId?: string | null
  category?: string | null
}

// Payload for adding a message to a ticket (Carga para añadir un mensaje a un ticket)
export interface CreateMessagePayload {
  body: string
  senderType: 'AGENT' | 'AI'
}

// Full ticket detail with related data (Detalle completo del ticket con datos relacionados)
export interface TicketDetail extends Ticket {
  messages: TicketMessage[]
  aiSuggestions: AiSuggestion[]
  assignedTo: User | null
}

// === Dashboard Stats (Estadísticas del Dashboard) ===

export interface DashboardStats {
  totalTickets: number
  openTickets: number
  urgentPending: number
  avgSentimentScore: number | null
  avgResolutionMinutes: number | null
  ticketsByStatus: Record<TicketStatus, number>
  ticketsByPriority: Record<Priority, number>
  recentTickets: Ticket[]
}

// === AI Analysis Result (Resultado del Análisis de IA) ===

export interface AiAnalysisResult {
  sentiment: Sentiment
  sentimentScore: number  // 0.0 to 1.0
  priority: Priority
  category: string
  language: string
  summary: string
}

// === Analytics Types (Tipos de Analíticas) ===

export interface SentimentTrend {
  date: string            // YYYY-MM-DD
  positive: number
  neutral: number
  negative: number
  avgScore: number
}

export interface ResolutionTimeStats {
  priority: Priority
  avgMinutes: number
  maxMinutes: number
  minMinutes: number
  ticketCount: number
}

export interface AgentPerformance {
  userId: string
  fullName: string
  avatarUrl: string | null
  ticketsResolved: number
  avgResolutionMinutes: number
  satisfaction: number    // Percentage of positive sentiment in resolved tickets
}

export interface VolumeByChannel {
  channel: Channel
  count: number
}

export interface VolumeByCategory {
  category: string
  count: number
}

// === Auth Types (Tipos de Autenticación) ===

export interface SignUpPayload {
  email: string
  password: string
  fullName: string
  organizationName: string
}

export interface AuthSetupPayload {
  fullName: string
  organizationName: string
}

// === API Response Wrapper (Envoltorio de Respuesta API) ===
// Standard response format for all API endpoints
// (Formato de respuesta estándar para todos los endpoints de la API)
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
