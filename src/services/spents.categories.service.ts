import mongoose from 'mongoose';
import SpentsCategoriesDao from '../dao/spents.categories.dao.js';
import { RequestCategoryDTO } from '../dto/request/categories/request-category.dto.js';
import { ResponseCategoryDTO } from '../dto/response/categories/response-category.dto.js';
import { AppError } from '../errors/app-error.js';
import { CategoryMapper } from '../mappers/category.mapper.js';

export class SpentsCategoriesService {
  constructor(private readonly categoriesDao: SpentsCategoriesDao) {}

  async create(data: RequestCategoryDTO): Promise<ResponseCategoryDTO> {
    this.validateRequest(data);

    const category = await this.categoriesDao.create(data);

    return CategoryMapper.toDto(category);
  }

  async getAll(): Promise<ResponseCategoryDTO[]> {
    const categories = await this.categoriesDao.get();

    return categories.map(CategoryMapper.toDto);
  }

  async getAvailableForUser(userId: string): Promise<ResponseCategoryDTO[]> {
    this.validateObjectId(userId, 'User id is invalid.');

    const categories = await this.categoriesDao.getAvailableForUser(userId);

    return categories.map(CategoryMapper.toDto);
  }

  async deleteById(id: string): Promise<void> {
    this.validateObjectId(id, 'Category id is invalid.');

    const result = await this.categoriesDao.deleteById(id);

    if (result.deletedCount === 0) {
      throw AppError.notFound('Category not found.');
    }
  }

  private validateRequest(data: RequestCategoryDTO) {
    if (!data.category) {
      throw AppError.validation('Category is required.', {
        required: ['category'],
      });
    }

    if (data.userId) {
      this.validateObjectId(data.userId, 'User id is invalid.');
    }
  }

  private validateObjectId(id: string, message: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw AppError.validation(message);
    }
  }
}
