import { Router } from 'express';
import SpentController from '../../controller/spent.controller.js';
import AccountDao from '../../dao/account.dao.js';
import SpentDao from '../../dao/spent.dao.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { SpentService } from '../../services/spent.service.js';

const router = Router();

const spentDao = new SpentDao();
const accountDao = new AccountDao();
const spentService = new SpentService(spentDao, accountDao);
const spentController = new SpentController(spentService);

router.post('/spents', requireAuth, spentController.create);
router.get('/spents', requireAuth, spentController.getByAccount);
router.get('/spents/range', requireAuth, spentController.getByDateRange);
router.get('/spents/:id', requireAuth, spentController.getById);
router.patch('/spents/:id', requireAuth, spentController.updateById);
router.delete('/spents/:id', requireAuth, spentController.deleteById);

export default router;
