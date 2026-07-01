import { Router } from 'express';
import UserController from '../../controller/user.controller.js';
import UserDao from '../../dao/user.dao.js';
import AccountDao from '../../dao/account.dao.js';
import { AccountService } from '../../services/account.service.js';
import { UserService } from '../../services/user.service.js';

const router = Router();

const userDao = new UserDao();
const accountDao = new AccountDao();
const accountService = new AccountService(accountDao);
const userService = new UserService(userDao, accountService);
const userController = new UserController(userService);

router.post('/auth/register', userController.register);
router.post('/auth/login', userController.login);

export default router;
