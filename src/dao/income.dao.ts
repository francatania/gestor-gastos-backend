import { IncomeLean } from '../dto/types/incomes.types.js';
import { IncomeDocument, incomeModel } from '../models/income.model.js';
import { accountModel } from '../models/accounts.model.js';
import { validateId } from '../http/identity.js';

export default class IncomeDao {
  private async scope(userId: string) {
    validateId(userId);
    const accountIds = await accountModel.find({ userId }).distinct('_id');
    return { accountId: { $in: accountIds } };
  }

  async create(doc: IncomeDocument): Promise<IncomeDocument> {
    return doc.save();
  }

  async getByAccount(accountId: string, userId: string): Promise<IncomeLean[]> {
    return incomeModel.find({ $and: [await this.scope(userId), { accountId }] })
      .populate('accountId', 'accountName').lean();
  }

  async getByDateRangeAndAccount(startDate: string, endDate: string, accountId: string, userId: string): Promise<IncomeLean[]> {
    return incomeModel.find({ $and: [await this.scope(userId), { accountId, date: { $gte: startDate, $lte: endDate } }] })
      .populate('accountId', 'accountName').lean();
  }

  async getById(id: string, userId: string): Promise<IncomeLean | null> {
    return incomeModel.findOne({ ...await this.scope(userId), _id: id })
      .populate('accountId', 'accountName').lean();
  }

  async findByIdAndUpdate(id: string, data: Partial<IncomeDocument>, accountId: string, userId: string): Promise<IncomeLean | null> {
    return incomeModel.findOneAndUpdate(
      { $and: [await this.scope(userId), { _id: id, accountId }] },
      { $set: data }, { new: true, runValidators: true }
    ).populate('accountId', 'accountName').lean();
  }

  async deleteById(id: string, accountId: string, userId: string) {
    return incomeModel.deleteOne({ $and: [await this.scope(userId), { _id: id, accountId }] });
  }
}
