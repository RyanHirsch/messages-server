import path from 'path';
import express from 'express';
import compression from 'compression';
import cors from 'cors';
import serveStatic from 'serve-static';
import morgan from 'morgan';

import { stream } from './logger';
import db from './db';
import api from './routes/api';

export default function startApp(port) {
  const app = express();

  app.use(morgan('combined', { stream }));
  app.use(cors());
  app.use(compression());
  app.use(serveStatic(path.resolve(__dirname, '..', 'public')));

  app.use('/api', api);
  app.get('/', (req, res) => {
    res.json({ version: '1.0.0', alive: true });
  });

  return new Promise((resolve, reject) => {
    const server = app.listen(port, err => {
      if (err) {
        return reject(err);
      }
      return resolve(server);
    });
    server.on('close', () => {
      db.close();
    });
  });
}
