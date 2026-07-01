import { Router } from 'express';
import SpentController from '../controller/spent.controller.js';
import AccountDao from '../dao/account.dao.js';
import IncomeDao from '../dao/income.dao.js';
import SpentDao from '../dao/spent.dao.js';
import TransferDao from '../dao/transfers.dao.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { AccountBalanceService } from '../services/account-balance.service.js';
import { SpentService } from '../services/spent.service.js';

const router = Router();

const spentDao = new SpentDao();
const accountDao = new AccountDao();
const incomeDao = new IncomeDao();
const transferDao = new TransferDao();
const accountBalanceService = new AccountBalanceService(
  accountDao,
  spentDao,
  incomeDao,
  transferDao
);
const spentService = new SpentService(spentDao, accountDao, accountBalanceService);
const spentController = new SpentController(spentService);

router.get('/spents', requireAuth, spentController.getByAccount);
router.get('/spents-range-date/:id', requireAuth, spentController.getByDateRange);
router.get('/spents/:id', requireAuth, spentController.getByAccount);
router.post('/spents', requireAuth, spentController.create);
router.patch('/spents/:id', requireAuth, spentController.updateById);
router.delete('/spents/:id', requireAuth, spentController.deleteById);

export default router;
