import { RequestCategoryDTO } from '../dto/request/categories/request-category.dto.js';
import {
  incomesCategoriesModel,
  IncomesCategoryDocument,
} from '../models/incomes.categories.model.js';

export default class IncomesCategoriesDao {
  async create(data: RequestCategoryDTO): Promise<IncomesCategoryDocument> {
    return incomesCategoriesModel.create(data);
  }

  async get(): Promise<IncomesCategoryDocument[]> {
    return incomesCategoriesModel.find();
  }

  async deleteById(id: string) {
    return incomesCategoriesModel.deleteOne({ _id: id });
  }
}
