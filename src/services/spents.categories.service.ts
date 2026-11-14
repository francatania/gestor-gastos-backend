import SpentsCategoriesDao from '../dao/spents.categories.dao.js';
import { RequestCategoryDTO } from '../dto/request/categories/request-category.dto.js';
import { ResponseCategoryDTO } from '../dto/response/categories/response-category.dto.js';
import { AppError } from '../errors/app-error.js';
import { CategoryMapper } from '../mappers/category.mapper.js';
import { assertSameUser, validateId } from '../http/identity.js';

export class SpentsCategoriesService {
  constructor(private readonly categoriesDao: SpentsCategoriesDao) {}

  async create(data: RequestCategoryDTO, userId: string): Promise<ResponseCategoryDTO> {
    assertSameUser(data.userId, userId);
    if (typeof data.category !== 'string' || !data.category.trim()) throw AppError.validation('Category is required.');
    return CategoryMapper.toDto(await this.categoriesDao.create({ category: data.category, userId }));
  }

  async getAll(userId: string): Promise<ResponseCategoryDTO[]> {
    return this.getAvailableForUser(userId, userId);
  }

  async getAvailableForUser(requestedUserId: string, userId: string): Promise<ResponseCategoryDTO[]> {
    assertSameUser(requestedUserId, userId);
    return (await this.categoriesDao.getAvailableForUser(userId)).map(CategoryMapper.toDto);
  }

  async deleteById(id: string, userId: string): Promise<void> {
    validateId(id);
    validateId(userId);
    const category = await this.categoriesDao.getAvailableById(id, userId);
    if (!category) throw AppError.notFound('Resource not found.');
    if (!category.userId) throw AppError.forbidden('Global categories are read-only.');
    if (await this.categoriesDao.isInUse(id)) throw AppError.conflict('Category is in use.');
    const result = await this.categoriesDao.deleteById(id, userId);
    if (!result.deletedCount) throw AppError.notFound('Resource not found.');
  }
}
