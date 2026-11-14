import { AppError } from './errors/app-error.js';
import express from 'express';
import cors from 'cors';

import v2Router from './routers/v2/index.router.js';

import passport from 'passport';
import { init as initPassportConfig } from './config/passport.config.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();

app.use(cors({
  origin: [
    'https://mi-gestor-gastos.netlify.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
  ],
  methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

initPassportConfig();
app.use(passport.initialize());

app.use('/api/v2', v2Router);

app.use((_req, _res, next) => next(AppError.notFound('Resource not found.')));
app.use(errorMiddleware);

export default app;
