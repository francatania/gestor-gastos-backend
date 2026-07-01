import { Router } from 'express';
import IncomeController from '../../controller/income.controller.js';
import AccountDao from '../../dao/account.dao.js';
import IncomeDao from '../../dao/income.dao.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { IncomeService } from '../../services/income.service.js';

const router = Router();

const incomeDao = new IncomeDao();
const accountDao = new AccountDao();
const incomeService = new IncomeService(incomeDao, accountDao);
const incomeController = new IncomeController(incomeService);

router.post('/incomes', requireAuth, incomeController.create);
router.get('/incomes', requireAuth, incomeController.getByAccount);
router.get('/incomes/range', requireAuth, incomeController.getByDateRange);
router.get('/incomes/:id', requireAuth, incomeController.getById);
router.patch('/incomes/:id', requireAuth, incomeController.updateById);
router.delete('/incomes/:id', requireAuth, incomeController.deleteById);

export default router;
