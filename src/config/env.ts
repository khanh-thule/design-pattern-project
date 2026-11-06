import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  JWT_SECRET: z.string().min(32),
});

export type Env = z.infer<typeof EnvSchema>;

export const loadEnv = (): Env => EnvSchema.parse(process.env);
