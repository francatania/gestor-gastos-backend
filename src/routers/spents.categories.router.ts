import { Router } from 'express';
import SpentsCategoriesController from '../controller/spents.categories.controller.js';
import SpentsCategoriesDao from '../dao/spents.categories.dao.js';
import { SpentsCategoriesService } from '../services/spents.categories.service.js';

const router = Router();

const categoriesDao = new SpentsCategoriesDao();
const categoriesService = new SpentsCategoriesService(categoriesDao);
const categoriesController = new SpentsCategoriesController(categoriesService);

router.get('/spents-categories', categoriesController.getAll);
router.get('/spents-categories/:id', categoriesController.getAvailableForUser);
router.post('/spents-categories', categoriesController.create);
router.delete('/spents-categories/:id', categoriesController.deleteById);

export default router;
