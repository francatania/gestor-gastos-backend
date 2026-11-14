import { SpentLean } from '../dto/types/spents.types.js';
import { SpentDocument, spentModel } from '../models/spent.model.js';
import { accountModel } from '../models/accounts.model.js';
import { validateId } from '../http/identity.js';
import { spentsCategoriesModel } from '../models/spents.categories.model.js';

export default class SpentDao {
  private async scope(userId: string) {
    validateId(userId);
    const accountIds = await accountModel.find({ userId }).distinct('_id');
    const categoryIds = await spentsCategoriesModel.find({ $or: [{ userId }, { userId: null }] }).distinct('_id');
    return { accountId: { $in: accountIds }, $or: [{ categoryId: null }, { categoryId: { $in: categoryIds } }] };
  }

  async create(doc: SpentDocument): Promise<SpentDocument> {
    return doc.save();
  }

  async getByAccount(accountId: string, userId: string): Promise<SpentLean[]> {
    return spentModel.find({ $and: [await this.scope(userId), { accountId }] })
      .populate('accountId', 'accountName').populate('categoryId', 'category').lean();
  }

  async getByDateRangeAndAccount(startDate: string, endDate: string, accountId: string, userId: string): Promise<SpentLean[]> {
    return spentModel.find({ $and: [await this.scope(userId), { accountId, date: { $gte: startDate, $lte: endDate } }] })
      .populate('accountId', 'accountName').populate('categoryId', 'category').lean();
  }

  async getById(id: string, userId: string): Promise<SpentLean | null> {
    return spentModel.findOne({ ...await this.scope(userId), _id: id })
      .populate('accountId', 'accountName').populate('categoryId', 'category').lean();
  }

  async findByIdAndUpdate(id: string, data: Partial<SpentDocument>, accountId: string, userId: string): Promise<SpentLean | null> {
    return spentModel.findOneAndUpdate(
      { $and: [await this.scope(userId), { _id: id, accountId }] },
      { $set: data }, { new: true, runValidators: true }
    ).populate('accountId', 'accountName').populate('categoryId', 'category').lean();
  }

  async deleteById(id: string, accountId: string, userId: string) {
    return spentModel.deleteOne({ $and: [await this.scope(userId), { _id: id, accountId }] });
  }
}
