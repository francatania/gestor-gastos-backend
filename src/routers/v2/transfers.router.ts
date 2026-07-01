import { Router } from 'express';
import TransferController from '../../controller/transfers.controller.js';
import AccountDao from '../../dao/account.dao.js';
import TransferDao from '../../dao/transfers.dao.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { TransferService } from '../../services/transfer.service.js';

const router = Router();

const transferDao = new TransferDao();
const accountDao = new AccountDao();
const transferService = new TransferService(transferDao, accountDao);
const transferController = new TransferController(transferService);

router.post('/transfers', requireAuth, transferController.create);
router.get('/transfers', requireAuth, transferController.getByAccount);
router.get('/transfers/all', requireAuth, transferController.getAll);
router.get('/transfers/range', requireAuth, transferController.getByDateRange);
router.get('/transfers/users/:id', requireAuth, transferController.getByUser);
router.get('/transfers/:id', requireAuth, transferController.getById);

export default router;
