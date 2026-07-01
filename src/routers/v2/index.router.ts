import { Router } from 'express';
import authRouter from './auth.router.js';
import accountsRouter from './accounts.router.js';
import spentsRouter from './spents.router.js';

const router = Router();

router.use(authRouter);
router.use(accountsRouter);
router.use(spentsRouter);

export default router;
