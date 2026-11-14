import { spentModel } from '../models/spent.model.js';
import { RequestCategoryDTO } from '../dto/request/categories/request-category.dto.js';
import { spentsCategoriesModel, SpentsCategoryDocument } from '../models/spents.categories.model.js';

export default class SpentsCategoriesDao {
  async create(data: RequestCategoryDTO): Promise<SpentsCategoryDocument> {
    return spentsCategoriesModel.create({ category: data.category, userId: data.userId });
  }

  async getAvailableForUser(userId: string): Promise<SpentsCategoryDocument[]> {
    return spentsCategoriesModel.find({ $or: [{ userId }, { userId: null }] });
  }

  async getAvailableById(id: string, userId: string): Promise<SpentsCategoryDocument | null> {
    return spentsCategoriesModel.findOne({ _id: id, $or: [{ userId }, { userId: null }] });
  }

  async isInUse(id: string): Promise<boolean> {
    return Boolean(await spentModel.exists({ categoryId: id }));
  }

  async deleteById(id: string, userId: string) {
    return spentsCategoriesModel.deleteOne({ _id: id, userId });
  }
}
