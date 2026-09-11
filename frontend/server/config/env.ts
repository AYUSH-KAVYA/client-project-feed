import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  PORT: z.string().default('5001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('postgresql://postgres.bdfylpkftgdrclcdtlmd:Kavyarawat_14@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true'),
  JWT_ACCESS_SECRET: z.string().default('super-secret-access-token-key-12345'),
  JWT_REFRESH_SECRET: z.string().default('super-secret-refresh-token-key-12345'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

const parsedEnv = envSchema.safeParse(process.env);

export const env = parsedEnv.success
  ? parsedEnv.data
  : {
      PORT: '5001',
      NODE_ENV: 'development' as const,
      DATABASE_URL: 'postgresql://postgres.bdfylpkftgdrclcdtlmd:Kavyarawat_14@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true',
      JWT_ACCESS_SECRET: 'super-secret-access-token-key-12345',
      JWT_REFRESH_SECRET: 'super-secret-refresh-token-key-12345',
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
      CORS_ORIGIN: 'http://localhost:5173',
    };
