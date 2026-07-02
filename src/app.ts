import express from 'express';
import path from 'path';
import cors from 'cors';

import usersRouter from './routers/users.router.js';
import incomeRouter from './routers/incomes.router.js';
import spentRouter from './routers/spents.router.js';
import authRouter from './routers/auth.router.js';
import spentsCategoriesRouter from './routers/spents.categories.router.js';
import incomesCategoriesRouter from './routers/incomes.categories.router.js';
import accountsRouter from './routers/accounts.router.js';
import transfersRouter from './routers/transfers.router.js';
import v2Router from './routers/v2/index.router.js';

import passport from 'passport';
import { init as initPassportConfig } from './config/passport.config.js';
import { __dirname } from './utils.js';
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
app.use(express.static(path.join(__dirname, '../public')));

initPassportConfig();
app.use(passport.initialize());

app.use('/api/v2', v2Router);

app.use(
  '/api',
  usersRouter,
  incomeRouter,
  spentRouter,
  authRouter,
  spentsCategoriesRouter,
  incomesCategoriesRouter,
  accountsRouter,
  transfersRouter
);

app.use(errorMiddleware);

export default app;
