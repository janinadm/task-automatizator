// ============================================================================
// Zod Validators — Runtime validation schemas for API payloads
// (Validadores Zod — Esquemas de validación en tiempo de ejecución para payloads de la API)
// ============================================================================
// WHY ZOD? TypeScript types only exist at compile-time — they vanish when your
// code runs in the browser or server. Zod schemas validate data at RUNTIME,
// catching invalid inputs that TypeScript can't: wrong values from API requests,
// malformed JSON, missing fields, etc.
//
// The magic: `z.infer<typeof schema>` automatically generates the TypeScript type
// from the schema, so types and validation are ALWAYS in sync.
//
// (¿POR QUÉ ZOD? Los tipos TypeScript solo existen en tiempo de compilación —
//  desaparecen cuando tu código se ejecuta. Los esquemas Zod validan datos en
//  RUNTIME, capturando inputs inválidos que TypeScript no puede: valores incorrectos
//  de peticiones API, JSON malformado, campos faltantes, etc.
//  La magia: `z.infer<typeof schema>` genera automáticamente el tipo TypeScript
//  desde el esquema, así tipos y validación SIEMPRE están sincronizados.)
// ============================================================================

import { z } from 'zod'

// === Enum Schemas (Esquemas de Enums) ===
// z.enum() creates a validator that only accepts the listed values
// (z.enum() crea un validador que solo acepta los valores listados)

export const TicketStatusSchema = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
export const PrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
export const SentimentSchema = z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE'])
export const ChannelSchema = z.enum(['EMAIL', 'WHATSAPP', 'WEB', 'SLACK'])
export const SenderTypeSchema = z.enum(['CUSTOMER', 'AGENT', 'AI'])
export const RoleSchema = z.enum(['ADMIN', 'AGENT'])
export const PlanSchema = z.enum(['FREE', 'STARTER', 'PRO', 'ENTERPRISE'])

// === Ticket Validators (Validadores de Ticket) ===

// Schema for creating a new ticket (Esquema para crear un nuevo ticket)
// .min(1) ensures the string is not empty (asegura que el string no esté vacío)
// .max(500) limits the length (limita la longitud)
// .trim() removes leading/trailing whitespace (elimina espacios al inicio/final)
export const CreateTicketSchema = z.object({
  subject: z
    .string()
    .min(1, 'Subject is required (El asunto es obligatorio)')
    .max(200, 'Subject must be under 200 characters (El asunto debe tener menos de 200 caracteres)')
    .trim(),
  body: z
    .string()
    .min(1, 'Message body is required (El cuerpo del mensaje es obligatorio)')
    .max(10000, 'Message is too long (El mensaje es demasiado largo)')
    .trim(),
  channel: ChannelSchema,
  customerName: z.string().max(100).trim().optional(),
  customerEmail: z.string().email('Invalid email (Email inválido)').optional(),
})

// Schema for updating a ticket (Esquema para actualizar un ticket)
// .partial() makes all fields optional — you only send what you want to change
// (.partial() hace todos los campos opcionales — solo envías lo que quieres cambiar)
export const UpdateTicketSchema = z.object({
  status: TicketStatusSchema.optional(),
  priority: PrioritySchema.optional(),
  assignedToId: z.string().uuid().nullable().optional(),
  category: z.string().max(50).nullable().optional(),
})

// Schema for ticket filters/query params (Esquema para filtros/parámetros de consulta de tickets)
export const TicketFiltersSchema = z.object({
  status: TicketStatusSchema.optional(),
  priority: PrioritySchema.optional(),
  sentiment: SentimentSchema.optional(),
  channel: ChannelSchema.optional(),
  assignedToId: z.string().uuid().optional(),
  search: z.string().max(200).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  // Sorting (Ordenamiento)
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'subject']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

// === Message Validators (Validadores de Mensaje) ===

export const CreateMessageSchema = z.object({
  body: z
    .string()
    .min(1, 'Message cannot be empty (El mensaje no puede estar vacío)')
    .max(10000, 'Message is too long (El mensaje es demasiado largo)')
    .trim(),
  senderType: z.enum(['AGENT', 'AI']),
})

// === Auth Validators (Validadores de Autenticación) ===

export const SignUpSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email (Por favor ingresa un email válido)')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters (La contraseña debe tener al menos 8 caracteres)')
    .max(72, 'Password is too long (La contraseña es demasiado larga)')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and a number (La contraseña debe contener mayúsculas, minúsculas y un número)'
    ),
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters (El nombre debe tener al menos 2 caracteres)')
    .max(100)
    .trim(),
  organizationName: z
    .string()
    .min(2, 'Organization name must be at least 2 characters (El nombre de la organización debe tener al menos 2 caracteres)')
    .max(100)
    .trim(),
})

export const LoginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email (Por favor ingresa un email válido)')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(1, 'Password is required (La contraseña es obligatoria)'),
})

export const AuthSetupSchema = z.object({
  // The Supabase Auth UUID — needed to create the Prisma User record
  // (El UUID de Supabase Auth — necesario para crear el registro de Usuario en Prisma)
  userId: z.string().uuid('Invalid user ID'),
  email: z.string().email('Invalid email'),
  fullName: z.string().min(2).max(100).trim(),
  organizationName: z.string().min(2).max(100).trim(),
})

// === SLA Validators (Validadores de SLA) ===

export const SlaConfigSchema = z.object({
  priority: PrioritySchema,
  maxResponseMinutes: z
    .number()
    .int()
    .min(1, 'Must be at least 1 minute (Debe ser al menos 1 minuto)')
    .max(10080, 'Cannot exceed 7 days (No puede exceder 7 días)'), // 7 days in minutes
})

// === Inferred Types (Tipos Inferidos) ===
// These types are automatically generated from the Zod schemas above.
// This is the "magic" — validation and types are always in sync.
// (Estos tipos se generan automáticamente desde los esquemas Zod de arriba.
//  Esta es la "magia" — validación y tipos siempre están sincronizados.)

export type CreateTicketInput = z.infer<typeof CreateTicketSchema>
export type UpdateTicketInput = z.infer<typeof UpdateTicketSchema>
export type TicketFiltersInput = z.infer<typeof TicketFiltersSchema>
export type CreateMessageInput = z.infer<typeof CreateMessageSchema>
export type SignUpInput = z.infer<typeof SignUpSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type AuthSetupInput = z.infer<typeof AuthSetupSchema>
// TicketFilters is defined in types/api.ts to avoid duplicate exports from the barrel
// (TicketFilters está definido en types/api.ts para evitar exportaciones duplicadas del barrel)
export type SlaConfigInput = z.infer<typeof SlaConfigSchema>

// === Invitation Validators (Validadores de Invitación) ===

export const CreateInvitationSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email')
    .trim()
    .toLowerCase(),
  role: RoleSchema.default('AGENT'),
})

export const AcceptInvitationSchema = z.object({
  token: z.string().min(1, 'Invitation token is required'),
})

// === Integration Validators (Validadores de Integración) ===

export const IntegrationTypeSchema = z.enum(['EMAIL_IMAP', 'EMAIL_SMTP', 'WHATSAPP', 'SLACK', 'WEBHOOK'])

export const CreateIntegrationSchema = z.object({
  type: IntegrationTypeSchema,
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100)
    .trim(),
  config: z.record(z.unknown()).default({}),
})

export const UpdateIntegrationSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  isActive: z.boolean().optional(),
  config: z.record(z.unknown()).optional(),
})

// === Inferred Types ===
export type CreateInvitationInput = z.infer<typeof CreateInvitationSchema>
export type AcceptInvitationInput = z.infer<typeof AcceptInvitationSchema>
export type CreateIntegrationInput = z.infer<typeof CreateIntegrationSchema>
export type UpdateIntegrationInput = z.infer<typeof UpdateIntegrationSchema>

// === Canned Response Validators (Validadores de Respuestas Predefinidas) ===

export const CreateCannedResponseSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be under 100 characters')
    .trim(),
  body: z
    .string()
    .min(1, 'Response body is required')
    .max(5000, 'Response is too long')
    .trim(),
  category: z.string().max(50).trim().optional(),
  shortcut: z
    .string()
    .max(30)
    .trim()
    .regex(/^\/[a-z0-9_-]+$/, 'Shortcut must start with / and use lowercase letters, numbers, hyphens')
    .optional(),
})

export const UpdateCannedResponseSchema = z.object({
  title: z.string().min(1).max(100).trim().optional(),
  body: z.string().min(1).max(5000).trim().optional(),
  category: z.string().max(50).trim().nullable().optional(),
  shortcut: z
    .string()
    .max(30)
    .trim()
    .regex(/^\/[a-z0-9_-]+$/, 'Shortcut must start with / and use lowercase letters')
    .nullable()
    .optional(),
  isActive: z.boolean().optional(),
})

// === Bulk Ticket Actions Validator (Validador de Acciones Masivas de Tickets) ===

export const BulkTicketActionSchema = z.object({
  ticketIds: z
    .array(z.string().cuid())
    .min(1, 'At least one ticket must be selected')
    .max(100, 'Cannot update more than 100 tickets at once'),
  action: z.enum(['updateStatus', 'updatePriority', 'assign', 'unassign']),
  value: z.string().optional(), // The status/priority value or assignedToId
})

// === Inferred Types ===
export type CreateCannedResponseInput = z.infer<typeof CreateCannedResponseSchema>
export type UpdateCannedResponseInput = z.infer<typeof UpdateCannedResponseSchema>
export type BulkTicketActionInput = z.infer<typeof BulkTicketActionSchema>

// ============================================================================
// Phase 8 — Tags, Knowledge Base Articles, Internal Notes
// ============================================================================

// === Tag Validators ===
export const CreateTagSchema = z.object({
  name: z.string().min(1).max(30).trim(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color')
    .optional()
    .default('#6366f1'),
})

export const AddTagToTicketSchema = z.object({
  tagId: z.string().cuid(),
})

// === Article Validators ===
export const ArticleStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])

export const CreateArticleSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  body: z.string().min(1),
  category: z.string().max(50).trim().optional(),
  status: ArticleStatusSchema.optional().default('DRAFT'),
})

export const UpdateArticleSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  body: z.string().min(1).optional(),
  category: z.string().max(50).trim().nullable().optional(),
  status: ArticleStatusSchema.optional(),
})

// === Internal Note Validator ===
export const CreateInternalNoteSchema = z.object({
  body: z.string().min(1).max(5000).trim(),
})

// === Inferred Types ===
export type CreateTagInput = z.infer<typeof CreateTagSchema>
export type AddTagToTicketInput = z.infer<typeof AddTagToTicketSchema>
export type CreateArticleInput = z.infer<typeof CreateArticleSchema>
export type UpdateArticleInput = z.infer<typeof UpdateArticleSchema>
export type CreateInternalNoteInput = z.infer<typeof CreateInternalNoteSchema>
