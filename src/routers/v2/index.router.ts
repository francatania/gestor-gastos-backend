import { Router } from 'express';
import authRouter from './auth.router.js';
import accountsRouter from './accounts.router.js';

const router = Router();

router.use(authRouter);
router.use(accountsRouter);

export default router;
