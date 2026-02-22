// ============================================================================
// Prisma Client Singleton — Database Connection Manager
// (Singleton del Cliente Prisma — Gestor de Conexión a Base de Datos)
// ============================================================================
// WHY A SINGLETON?
// In development, Nuxt/Vite uses Hot Module Replacement (HMR) — every time you
// save a file, the server partially restarts. Without this pattern, each restart
// creates a NEW database connection, eventually exhausting the connection pool.
//
// The singleton stores the Prisma instance in `globalThis` (a global variable
// that survives HMR reloads), so only ONE connection is ever created.
//
// In production, this isn't an issue (no HMR), but the pattern is still good practice.
//
// (¿POR QUÉ UN SINGLETON?
//  En desarrollo, Nuxt/Vite usa Hot Module Replacement (HMR) — cada vez que
//  guardas un archivo, el servidor se reinicia parcialmente. Sin este patrón,
//  cada reinicio crea una NUEVA conexión a la BD, agotando el pool de conexiones.
//  El singleton almacena la instancia de Prisma en `globalThis` (una variable
//  global que sobrevive a los reloads de HMR), así solo se crea UNA conexión.
//  En producción esto no es un problema (no hay HMR), pero el patrón sigue siendo buena práctica.)
// ============================================================================

import { PrismaClient } from '@prisma/client'

// Extend the global type to include our Prisma instance
// (Extender el tipo global para incluir nuestra instancia de Prisma)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create the client only if it doesn't already exist in the global scope
// (Crear el cliente solo si no existe ya en el ámbito global)
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Log database queries in development for debugging
    // (Registrar queries de BD en desarrollo para depuración)
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

// In development, save the instance to the global scope so HMR doesn't create duplicates
// (En desarrollo, guardar la instancia en el ámbito global para que HMR no cree duplicados)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Re-export PrismaClient type for use in other files
// (Re-exportar el tipo PrismaClient para uso en otros archivos)
export type { PrismaClient }
