import mongoose from 'mongoose';
import IncomesCategoriesDao from '../dao/incomes.categories.dao.js';
import { RequestCategoryDTO } from '../dto/request/categories/request-category.dto.js';
import { ResponseCategoryDTO } from '../dto/response/categories/response-category.dto.js';
import { AppError } from '../errors/app-error.js';
import { CategoryMapper } from '../mappers/category.mapper.js';

export class IncomesCategoriesService {
  constructor(private readonly categoriesDao: IncomesCategoriesDao) {}

  async create(data: RequestCategoryDTO): Promise<ResponseCategoryDTO> {
    if (!data.category) {
      throw AppError.validation('Category is required.', {
        required: ['category'],
      });
    }

    const category = await this.categoriesDao.create(data);

    return CategoryMapper.toDto(category);
  }

  async getAll(): Promise<ResponseCategoryDTO[]> {
    const categories = await this.categoriesDao.get();

    return categories.map(CategoryMapper.toDto);
  }

  async deleteById(id: string): Promise<void> {
    if (!mongoose.isValidObjectId(id)) {
      throw AppError.validation('Category id is invalid.');
    }

    const result = await this.categoriesDao.deleteById(id);

    if (result.deletedCount === 0) {
      throw AppError.notFound('Category not found.');
    }
  }
}
