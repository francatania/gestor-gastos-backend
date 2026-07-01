import { SpentLean } from '../dto/types/spents.types.js';
import { SpentDocument, spentModel } from '../models/spent.model.js';

export default class SpentDao {
  async create(doc: SpentDocument): Promise<SpentDocument> {
    return doc.save();
  }

  async getByDateRangeAndAccount(
    startDate: string,
    endDate: string,
    accountId: string
  ): Promise<SpentLean[]> {
    return spentModel.find({
      date: { $gte: startDate, $lte: endDate },
      accountId,
    })
      .populate('accountId', 'accountName')
      .populate('categoryId', 'category')
      .lean();
  }

  async getByAccount(accountId: string): Promise<SpentLean[]> {
    return spentModel.find({ accountId })
      .populate('accountId', 'accountName')
      .populate('categoryId', 'category')
      .lean();
  }

  async getById(id: string): Promise<SpentLean | null> {
    return spentModel.findOne({ _id: id })
      .populate('accountId', 'accountName')
      .populate('categoryId', 'category')
      .lean();
  }

  async findByIdAndUpdate(
    spentId: string,
    data: Partial<SpentDocument>
  ): Promise<SpentLean | null> {
    return spentModel.findByIdAndUpdate(
      spentId,
      { $set: data },
      { new: true }
    )
      .populate('accountId', 'accountName')
      .populate('categoryId', 'category')
      .lean();
  }

  async deleteById(id: string) {
    return spentModel.deleteOne({ _id: id });
  }
}
