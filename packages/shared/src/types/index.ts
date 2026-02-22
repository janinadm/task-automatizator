// Types Barrel Export (Exportación barril de tipos)
// A "barrel file" re-exports everything from the directory in a single import.
// Instead of: import { Ticket } from '@ata/shared/src/types/entities'
// You write:  import { Ticket } from '@ata/shared/types'
// (Un "archivo barril" re-exporta todo del directorio en un solo import.
//  En lugar de: import { Ticket } from '@ata/shared/src/types/entities'
//  Escribes:   import { Ticket } from '@ata/shared/types')

export * from './enums'
export * from './entities'
export * from './api'
