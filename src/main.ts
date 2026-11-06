import 'dotenv/config';
import { buildContainer } from './config/container';
import { loadEnv } from './config/env';
import { createApp } from './infrastructure/http/app';

const env = loadEnv();
const app = createApp(buildContainer(env));

const server = app.listen(env.PORT, () => {
  console.log(`API démarrée sur http://localhost:${env.PORT}`);
});

const shutdown = () => server.close(() => process.exit(0));
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
