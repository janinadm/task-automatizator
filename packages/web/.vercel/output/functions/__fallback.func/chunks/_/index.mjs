import { z } from 'zod';

const TicketStatusSchema = z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]);
const PrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
const SentimentSchema = z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]);
const ChannelSchema = z.enum(["EMAIL", "WHATSAPP", "WEB", "SLACK"]);
z.enum(["CUSTOMER", "AGENT", "AI"]);
const RoleSchema = z.enum(["ADMIN", "AGENT"]);
z.enum(["FREE", "STARTER", "PRO", "ENTERPRISE"]);
z.object({
  subject: z.string().min(1, "Subject is required (El asunto es obligatorio)").max(200, "Subject must be under 200 characters (El asunto debe tener menos de 200 caracteres)").trim(),
  body: z.string().min(1, "Message body is required (El cuerpo del mensaje es obligatorio)").max(1e4, "Message is too long (El mensaje es demasiado largo)").trim(),
  channel: ChannelSchema,
  customerName: z.string().max(100).trim().optional(),
  customerEmail: z.string().email("Invalid email (Email inv\xE1lido)").optional()
});
const UpdateTicketSchema = z.object({
  status: TicketStatusSchema.optional(),
  priority: PrioritySchema.optional(),
  assignedToId: z.string().uuid().nullable().optional(),
  category: z.string().max(50).nullable().optional()
});
const TicketFiltersSchema = z.object({
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
  sortBy: z.enum(["createdAt", "updatedAt", "priority", "subject"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc")
});
const CreateMessageSchema = z.object({
  body: z.string().min(1, "Message cannot be empty (El mensaje no puede estar vac\xEDo)").max(1e4, "Message is too long (El mensaje es demasiado largo)").trim(),
  senderType: z.enum(["AGENT", "AI"])
});
z.object({
  email: z.string().email("Please enter a valid email (Por favor ingresa un email v\xE1lido)").trim().toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters (La contrase\xF1a debe tener al menos 8 caracteres)").max(72, "Password is too long (La contrase\xF1a es demasiado larga)").regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain uppercase, lowercase, and a number (La contrase\xF1a debe contener may\xFAsculas, min\xFAsculas y un n\xFAmero)"
  ),
  fullName: z.string().min(2, "Name must be at least 2 characters (El nombre debe tener al menos 2 caracteres)").max(100).trim(),
  organizationName: z.string().min(2, "Organization name must be at least 2 characters (El nombre de la organizaci\xF3n debe tener al menos 2 caracteres)").max(100).trim()
});
z.object({
  email: z.string().email("Please enter a valid email (Por favor ingresa un email v\xE1lido)").trim().toLowerCase(),
  password: z.string().min(1, "Password is required (La contrase\xF1a es obligatoria)")
});
const AuthSetupSchema = z.object({
  // The Supabase Auth UUID — needed to create the Prisma User record
  // (El UUID de Supabase Auth — necesario para crear el registro de Usuario en Prisma)
  userId: z.string().uuid("Invalid user ID"),
  email: z.string().email("Invalid email"),
  fullName: z.string().min(2).max(100).trim(),
  organizationName: z.string().min(2).max(100).trim()
});
z.object({
  priority: PrioritySchema,
  maxResponseMinutes: z.number().int().min(1, "Must be at least 1 minute (Debe ser al menos 1 minuto)").max(10080, "Cannot exceed 7 days (No puede exceder 7 d\xEDas)")
  // 7 days in minutes
});
const CreateInvitationSchema = z.object({
  email: z.string().email("Please enter a valid email").trim().toLowerCase(),
  role: RoleSchema.default("AGENT")
});
z.object({
  token: z.string().min(1, "Invitation token is required")
});
const IntegrationTypeSchema = z.enum(["EMAIL_IMAP", "EMAIL_SMTP", "WHATSAPP", "SLACK", "WEBHOOK"]);
const CreateIntegrationSchema = z.object({
  type: IntegrationTypeSchema,
  name: z.string().min(2, "Name must be at least 2 characters").max(100).trim(),
  config: z.record(z.unknown()).default({})
});
const UpdateIntegrationSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  isActive: z.boolean().optional(),
  config: z.record(z.unknown()).optional()
});
const CreateCannedResponseSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be under 100 characters").trim(),
  body: z.string().min(1, "Response body is required").max(5e3, "Response is too long").trim(),
  category: z.string().max(50).trim().optional(),
  shortcut: z.string().max(30).trim().regex(/^\/[a-z0-9_-]+$/, "Shortcut must start with / and use lowercase letters, numbers, hyphens").optional()
});
const UpdateCannedResponseSchema = z.object({
  title: z.string().min(1).max(100).trim().optional(),
  body: z.string().min(1).max(5e3).trim().optional(),
  category: z.string().max(50).trim().nullable().optional(),
  shortcut: z.string().max(30).trim().regex(/^\/[a-z0-9_-]+$/, "Shortcut must start with / and use lowercase letters").nullable().optional(),
  isActive: z.boolean().optional()
});
const BulkTicketActionSchema = z.object({
  ticketIds: z.array(z.string().cuid()).min(1, "At least one ticket must be selected").max(100, "Cannot update more than 100 tickets at once"),
  action: z.enum(["updateStatus", "updatePriority", "assign", "unassign"]),
  value: z.string().optional()
  // The status/priority value or assignedToId
});

export { AuthSetupSchema as A, BulkTicketActionSchema as B, CreateCannedResponseSchema as C, TicketFiltersSchema as T, UpdateCannedResponseSchema as U, UpdateIntegrationSchema as a, CreateIntegrationSchema as b, CreateInvitationSchema as c, UpdateTicketSchema as d, CreateMessageSchema as e };
//# sourceMappingURL=index.mjs.map
