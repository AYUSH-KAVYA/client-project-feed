import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

function formatDatabaseUrl(rawUrl?: string): string | undefined {
  if (!rawUrl) return rawUrl;
  let url = rawUrl.trim();
  if (url.includes(':6543') || url.includes('pooler.supabase.com')) {
    if (!url.includes('pgbouncer=true')) {
      url += (url.includes('?') ? '&' : '?') + 'pgbouncer=true';
    }
  }
  return url;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: formatDatabaseUrl(env.DATABASE_URL),
      },
    },
  });

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}
