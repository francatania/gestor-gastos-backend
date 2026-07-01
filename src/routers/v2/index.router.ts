import { Router } from 'express';
import authRouter from './auth.router.js';
import accountsRouter from './accounts.router.js';
import spentsRouter from './spents.router.js';
import spentsCategoriesRouter from './spents.categories.router.js';
import incomesCategoriesRouter from './incomes.categories.router.js';

const router = Router();

router.use(authRouter);
router.use(accountsRouter);
router.use(spentsRouter);
router.use(spentsCategoriesRouter);
router.use(incomesCategoriesRouter);

export default router;
