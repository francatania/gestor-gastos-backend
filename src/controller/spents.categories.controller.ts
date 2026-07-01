import { NextFunction, Request, Response } from 'express';
import { RequestCategoryDTO } from '../dto/request/categories/request-category.dto.js';
import { created, noContent, ok } from '../http/responses.js';
import { SpentsCategoriesService } from '../services/spents.categories.service.js';

export default class SpentsCategoriesController {
  constructor(private readonly categoriesService: SpentsCategoriesService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as RequestCategoryDTO;
      const category = await this.categoriesService.create(data);

      return created(res, category, 'Successfully created category.');
    } catch (error) {
      return next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await this.categoriesService.getAll();

      return ok(res, categories);
    } catch (error) {
      return next(error);
    }
  };

  getAvailableForUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await this.categoriesService.getAvailableForUser(req.params.id);

      return ok(res, categories);
    } catch (error) {
      return next(error);
    }
  };

  deleteById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.categoriesService.deleteById(req.params.id);

      return noContent(res);
    } catch (error) {
      return next(error);
    }
  };
}
