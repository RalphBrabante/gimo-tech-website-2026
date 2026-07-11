import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { products } from './data/products.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const storefrontDirectory = path.resolve(currentDirectory, '../../client/dist/client/browser');

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        "font-src": ["'self'", 'https://fonts.gstatic.com'],
        "img-src": ["'self'", 'data:'],
        "script-src": ["'self'"]
      }
    }
  }));
  if (process.env.NODE_ENV !== 'production' || process.env.CLIENT_ORIGIN) {
    app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:4200' }));
  }
  app.use(express.json());
  app.use(morgan('dev'));
  const health = (_req, res) => res.json({ status: 'ok', service: 'gimo-tech-api', uptime: Math.round(process.uptime()) });
  app.get('/health', health);
  app.get('/api/health', health);
  app.get('/api/products', (req, res) => {
    const category = req.query.category?.toLowerCase();
    res.json(category ? products.filter((p) => p.category.toLowerCase() === category) : products);
  });
  app.get('/api/products/:id', (req, res) => {
    const product = products.find((p) => p.id === Number(req.params.id));
    return product ? res.json(product) : res.status(404).json({ message: 'Product not found' });
  });
  app.use('/api', (_req, res) => res.status(404).json({ message: 'API route not found' }));

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(storefrontDirectory, { maxAge: '1d', index: false }));
    app.get('*', (_req, res) => res.sendFile(path.join(storefrontDirectory, 'index.html')));
  }
  app.use((error, _req, res, _next) => { console.error(error); res.status(500).json({ message: 'Something went wrong' }); });
  return app;
}
