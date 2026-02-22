// ============================================================================
// Entity Types — TypeScript interfaces for all database entities
// (Tipos de Entidad — Interfaces TypeScript para todas las entidades de base de datos)
// ============================================================================
// These interfaces mirror the Prisma schema and are used across frontend and backend.
// They define the "shape" of data flowing through the application.
// (Estas interfaces reflejan el esquema de Prisma y se usan en frontend y backend.
//  Definen la "forma" de los datos que fluyen por la aplicación.)
// ============================================================================

import {
  Role,
  TicketStatus,
  Priority,
  Sentiment,
  Channel,
  SenderType,
  Plan,
} from './enums'

// === Organization (Organización) ===
// Represents a tenant — each company/agency is an organization.
// All data is scoped to an organization (multi-tenancy).
// (Representa un tenant — cada empresa/agencia es una organización.
//  Todos los datos están limitados a una organización (multi-tenencia).)
export interface Organization {
  id: string
  name: string
  slug: string           // URL-friendly identifier (Identificador amigable para URL)
  plan: Plan
  logoUrl: string | null
  createdAt: Date
  updatedAt: Date
}

// === User (Usuario) ===
// A member of an organization. Their `id` matches the Supabase Auth UUID.
// (Un miembro de una organización. Su `id` coincide con el UUID de Supabase Auth.)
export interface User {
  id: string             // Supabase Auth UUID (UUID de autenticación de Supabase)
  email: string
  fullName: string
  role: Role
  orgId: string          // Foreign key to Organization (Clave foránea a Organización)
  avatarUrl: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// === Ticket ===
// The core entity — represents a customer inquiry/issue.
// AI automatically assigns sentiment, priority, and category upon creation.
// (La entidad central — representa una consulta/problema de un cliente.
//  La IA asigna automáticamente sentimiento, prioridad y categoría al crearse.)
export interface Ticket {
  id: string
  orgId: string
  subject: string        // Brief title (Título breve)
  body: string           // Full message content (Contenido completo del mensaje)
  channel: Channel       // Where it came from (De dónde provino)
  status: TicketStatus
  priority: Priority
  category: string | null     // AI-detected category: "billing", "technical", etc.
                               // (Categoría detectada por IA: "facturación", "técnico", etc.)
  sentiment: Sentiment | null
  sentimentScore: number | null // 0.0 to 1.0 — intensity of sentiment (Intensidad del sentimiento)
  language: string | null       // Detected language code: "en", "es", etc. (Código de idioma detectado)
  summary: string | null        // AI-generated summary (Resumen generado por IA)
  customerName: string | null
  customerEmail: string | null
  assignedToId: string | null   // FK to User (Clave foránea a Usuario)
  createdAt: Date
  updatedAt: Date
  resolvedAt: Date | null       // When it was resolved (Cuándo se resolvió)
}

// === Ticket Message (Mensaje del Ticket) ===
// A message in a ticket's conversation thread.
// (Un mensaje en el hilo de conversación de un ticket.)
export interface TicketMessage {
  id: string
  ticketId: string
  senderId: string | null       // Null for AI or anonymous customers (Null para IA o clientes anónimos)
  senderType: SenderType
  senderName: string | null
  body: string
  createdAt: Date
}

// === AI Suggestion (Sugerencia de IA) ===
// A response suggested by the AI engine for a ticket.
// Agents can accept, modify, or discard it.
// (Una respuesta sugerida por el motor de IA para un ticket.
//  Los agentes pueden aceptarla, modificarla o descartarla.)
export interface AiSuggestion {
  id: string
  ticketId: string
  suggestedReply: string
  confidence: number     // 0.0 to 1.0 — how confident the AI is (Confianza de la IA)
  accepted: boolean | null // null = pending, true = accepted, false = discarded
                           // (null = pendiente, true = aceptada, false = descartada)
  createdAt: Date
}

// === SLA Configuration (Configuración de SLA) ===
// Defines maximum response times per priority level for an organization.
// SLA = Service Level Agreement — the promise of "we'll respond within X minutes".
// (Define tiempos máximos de respuesta por nivel de prioridad para una organización.
//  SLA = Acuerdo de Nivel de Servicio — la promesa de "responderemos en X minutos".)
export interface SlaConfig {
  id: string
  orgId: string
  priority: Priority
  maxResponseMinutes: number
  createdAt: Date
  updatedAt: Date
}
