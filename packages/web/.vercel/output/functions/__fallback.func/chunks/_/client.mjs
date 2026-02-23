import { PrismaClient } from '@prisma/client';

var _a;
const globalForPrisma = globalThis;
const prisma = (_a = globalForPrisma.prisma) != null ? _a : new PrismaClient({
  // Log database queries in development for debugging
  // (Registrar queries de BD en desarrollo para depuración)
  log: ["error"]
});

export { prisma as p };
//# sourceMappingURL=client.mjs.map
