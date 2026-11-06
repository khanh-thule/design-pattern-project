import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof EnvSchema>;

export const loadEnv = (): Env => EnvSchema.parse(process.env);
