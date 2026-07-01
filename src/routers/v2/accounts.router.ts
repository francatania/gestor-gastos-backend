import { Router } from 'express';
import AccountController from '../../controller/account.controller.js';
import AccountDao from '../../dao/account.dao.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { AccountService } from '../../services/account.service.js';

const router = Router();

const accountDao = new AccountDao();
const accountService = new AccountService(accountDao);
const accountController = new AccountController(accountService);

router.post('/accounts', requireAuth, accountController.create);
router.get('/accounts', requireAuth, accountController.getByUser);
router.get('/accounts/:id', requireAuth, accountController.getById);
router.delete('/accounts/:id', requireAuth, accountController.deleteById);

export default router;
