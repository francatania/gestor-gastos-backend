import { Router } from 'express';
import DashboardController from '../../controller/dashboard.controller.js';
import AccountDao from '../../dao/account.dao.js';
import IncomeDao from '../../dao/income.dao.js';
import SpentDao from '../../dao/spent.dao.js';
import TransferDao from '../../dao/transfers.dao.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { AccountBalanceService } from '../../services/account-balance.service.js';
import { DashboardService } from '../../services/dashboard.service.js';

const router = Router();

const accountDao = new AccountDao();
const spentDao = new SpentDao();
const incomeDao = new IncomeDao();
const transferDao = new TransferDao();
const accountBalanceService = new AccountBalanceService(
  accountDao,
  spentDao,
  incomeDao,
  transferDao
);
const dashboardService = new DashboardService(
  accountDao,
  spentDao,
  incomeDao,
  transferDao,
  accountBalanceService
);
const dashboardController = new DashboardController(dashboardService);

router.get(
  '/dashboard/accounts/:accountId/summary',
  requireAuth,
  dashboardController.getAccountSummary
);

router.get(
  '/dashboard/users/:userId/accounts-summary',
  requireAuth,
  dashboardController.getUserAccountsSummary
);

export default router;
