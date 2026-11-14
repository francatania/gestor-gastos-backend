import {
  incomesCategoriesModel,
  IncomesCategoryDocument,
} from '../models/incomes.categories.model.js';

export default class IncomesCategoriesDao {
  async get(): Promise<IncomesCategoryDocument[]> {
    return incomesCategoriesModel.find();
  }

}
