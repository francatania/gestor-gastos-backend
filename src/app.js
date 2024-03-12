import express from 'express';
import path from 'path';
import cors from 'cors'
import usersRouter from './routers/users.router.js';
import incomeRouter from './routers/incomes.router.js'
import spentRouter from './routers/spents.router.js';
import authRouter from './routers/auth.router.js';
import spentsCategoriesRouter from './routers/spents.categories.router.js';
import incomesCategoriesRouter from './routers/incomes.categories.router.js';
import accountsRouter from './routers/accounts.router.js'
import transfersRouter from './routers/transfers.router.js'

import passport from 'passport';
import { init as initPassportConfig } from './config/passport.config.js';

import { __dirname } from './utils.js';

const app = express();

app.use(cors({origin:'http://localhost:5173', methods:['GET', 'PUT', 'POST', 'DELETE'], credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

initPassportConfig();
app.use(passport.initialize());


app.use('/api', usersRouter, incomeRouter, spentRouter, authRouter, spentsCategoriesRouter, incomesCategoriesRouter, accountsRouter, transfersRouter);

app.use((error, req, res, next) => {
  const message = `Ah ocurrido un error desconocido 😨: ${error.message}`;
  console.log(message);
  res.status(500).json({ status: 'error', message });
});

export default app;
