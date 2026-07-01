import { Router } from 'express';
import SpentsCategoriesController from '../../controller/spents.categories.controller.js';
import SpentsCategoriesDao from '../../dao/spents.categories.dao.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { SpentsCategoriesService } from '../../services/spents.categories.service.js';

const router = Router();

const categoriesDao = new SpentsCategoriesDao();
const categoriesService = new SpentsCategoriesService(categoriesDao);
const categoriesController = new SpentsCategoriesController(categoriesService);

router.get('/spents-categories', requireAuth, categoriesController.getAll);
router.get('/spents-categories/users/:id', requireAuth, categoriesController.getAvailableForUser);
router.post('/spents-categories', requireAuth, categoriesController.create);
router.delete('/spents-categories/:id', requireAuth, categoriesController.deleteById);

export default router;
