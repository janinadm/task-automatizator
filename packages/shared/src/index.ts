// ============================================================================
// Shared Package — Main Entry Point (Punto de entrada principal del paquete compartido)
// ============================================================================
// This barrel file exports EVERYTHING from the shared package.
// Other packages import from here: import { Ticket, CreateTicketSchema } from '@ata/shared'
// (Este archivo barril exporta TODO del paquete compartido.
//  Otros paquetes importan desde aquí: import { Ticket, CreateTicketSchema } from '@ata/shared')
// ============================================================================

// All types, enums, and interfaces (Todos los tipos, enums e interfaces)
export * from './types'

// All Zod validators and inferred types (Todos los validadores Zod y tipos inferidos)
export * from './validators'

// All constants (Todas las constantes)
export * from './constants'
