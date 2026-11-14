import IncomesCategoriesDao from '../dao/incomes.categories.dao.js';
import { RequestCategoryDTO } from '../dto/request/categories/request-category.dto.js';
import { ResponseCategoryDTO } from '../dto/response/categories/response-category.dto.js';
import { AppError } from '../errors/app-error.js';
import { CategoryMapper } from '../mappers/category.mapper.js';
import { validateId } from '../http/identity.js';

export class IncomesCategoriesService {
  constructor(private readonly categoriesDao: IncomesCategoriesDao) {}

  async create(_data: RequestCategoryDTO, userId: string): Promise<ResponseCategoryDTO> {
    validateId(userId);
    throw AppError.forbidden('Global categories are read-only.');
  }

  async getAll(userId: string): Promise<ResponseCategoryDTO[]> {
    validateId(userId);
    return (await this.categoriesDao.get()).map(CategoryMapper.toDto);
  }

  async deleteById(_id: string, userId: string): Promise<void> {
    validateId(userId);
    throw AppError.forbidden('Global categories are read-only.');
  }
}
