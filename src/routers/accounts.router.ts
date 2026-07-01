import { NextFunction, Request, Response, Router } from 'express';
import AccountController from '../controller/account.controller.js';
import AccountDao from '../dao/account.dao.js';
import { AccountService } from '../services/account.service.js';

const router = Router();

const accountDao = new AccountDao();
const accountService = new AccountService(accountDao);
const accountController = new AccountController(accountService);

router.post(
  '/accounts/:id',
  (req: Request, res: Response, next: NextFunction) => {
    req.body = {
      ...req.body,
      userId: req.params.id,
    };

    return accountController.create(req, res, next);
  }
);

router.get('/accounts/:id', accountController.getById);
router.delete('/accounts/:id', accountController.deleteById);

export default router;
