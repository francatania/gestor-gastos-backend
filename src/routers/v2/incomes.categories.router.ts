import { Router } from 'express';
import IncomesCategoriesController from '../../controller/incomes.categories.controller.js';
import IncomesCategoriesDao from '../../dao/incomes.categories.dao.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { IncomesCategoriesService } from '../../services/incomes.categories.service.js';

const router = Router();

const categoriesDao = new IncomesCategoriesDao();
const categoriesService = new IncomesCategoriesService(categoriesDao);
const categoriesController = new IncomesCategoriesController(categoriesService);

router.get('/incomes-categories', requireAuth, categoriesController.getAll);
router.post('/incomes-categories', requireAuth, categoriesController.create);
router.delete('/incomes-categories/:id', requireAuth, categoriesController.deleteById);

export default router;
