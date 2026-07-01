import { RequestCategoryDTO } from '../dto/request/categories/request-category.dto.js';
import {
  spentsCategoriesModel,
  SpentsCategoryDocument,
} from '../models/spents.categories.model.js';

export default class SpentsCategoriesDao {
  async create(data: RequestCategoryDTO): Promise<SpentsCategoryDocument> {
    return spentsCategoriesModel.create(data);
  }

  async get(): Promise<SpentsCategoryDocument[]> {
    return spentsCategoriesModel.find();
  }

  async getAvailableForUser(userId: string): Promise<SpentsCategoryDocument[]> {
    return spentsCategoriesModel.find({
      $or: [
        { userId },
        { userId: { $exists: false } },
      ],
    });
  }

  async deleteById(id: string) {
    return spentsCategoriesModel.deleteOne({ _id: id });
  }
}
