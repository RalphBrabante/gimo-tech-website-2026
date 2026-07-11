import 'dotenv/config';
import { createApp } from './app.js';
const port = Number(process.env.PORT) || 3000;
const server = createApp().listen(port, () => console.log(`Gimo Tech listening on port ${port}`));

function shutdown(signal) {
  console.log(`${signal} received; closing server`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
