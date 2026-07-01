import { IncomeLean } from '../dto/types/incomes.types.js';
import { IncomeDocument, incomeModel } from '../models/income.model.js';

export default class IncomeDao {
  async create(doc: IncomeDocument): Promise<IncomeDocument> {
    return doc.save();
  }

  async getByDateRangeAndAccount(
    startDate: string,
    endDate: string,
    accountId: string
  ): Promise<IncomeLean[]> {
    return incomeModel.find({
      date: { $gte: startDate, $lte: endDate },
      accountId,
    })
      .populate('accountId', 'accountName')
      .lean();
  }

  async getByAccount(accountId: string): Promise<IncomeLean[]> {
    return incomeModel.find({ accountId })
      .populate('accountId', 'accountName')
      .lean();
  }

  async getById(id: string): Promise<IncomeLean | null> {
    return incomeModel.findOne({ _id: id })
      .populate('accountId', 'accountName')
      .lean();
  }

  async findByIdAndUpdate(
    incomeId: string,
    data: Partial<IncomeDocument>
  ): Promise<IncomeLean | null> {
    return incomeModel.findByIdAndUpdate(
      incomeId,
      { $set: data },
      { new: true }
    )
      .populate('accountId', 'accountName')
      .lean();
  }

  async deleteById(id: string) {
    return incomeModel.deleteOne({ _id: id });
  }
}
