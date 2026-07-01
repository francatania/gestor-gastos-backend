import { Router } from 'express';
import authRouter from './auth.router.js';
import accountsRouter from './accounts.router.js';
import spentsRouter from './spents.router.js';
import incomesRouter from './incomes.router.js';
import transfersRouter from './transfers.router.js';
import dashboardRouter from './dashboard.router.js';
import spentsCategoriesRouter from './spents.categories.router.js';
import incomesCategoriesRouter from './incomes.categories.router.js';

const router = Router();

router.use(authRouter);
router.use(accountsRouter);
router.use(spentsRouter);
router.use(incomesRouter);
router.use(transfersRouter);
router.use(dashboardRouter);
router.use(spentsCategoriesRouter);
router.use(incomesCategoriesRouter);

export default router;
