import { PrismaClient } from '@prisma/client/extension';

const prisma = new PrismaClient();

const globalForPrisma = global as unknown as { prisma: typeof prisma };

if (process.env.NODE_ENV == 'development') {
    if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = prisma; 
  }
}

export default prisma;
