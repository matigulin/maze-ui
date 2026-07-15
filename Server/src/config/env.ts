import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  CORS_ORIGIN: z.string().min(1),
  COOKIE_DOMAIN: z.string().optional(),
  SMS_API_KEY: z.string().optional(),
  /** Temp/demo: return OTP in API response when SMS provider is off (Railway preview). */
  AUTH_DEV_OTP: z
    .enum(['true', 'false', '1', '0', ''])
    .optional()
    .transform((v) => v === 'true' || v === '1'),
  CDEK_CLIENT_ID: z.string().optional(),
  CDEK_CLIENT_SECRET: z.string().optional(),
  YANDEX_DELIVERY_TOKEN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function resetEnvCache(): void {
  cached = null;
}

/** Dev / preview OTP in UI when there is no real SMS provider. */
export function isDevOtpEnabled(env: Env = loadEnv()): boolean {
  return !env.SMS_API_KEY && (env.NODE_ENV === 'development' || Boolean(env.AUTH_DEV_OTP));
}

export function loadEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  cached = parsed.data;
  return cached;
}
