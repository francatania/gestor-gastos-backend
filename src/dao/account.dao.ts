import mongoose from 'mongoose';
import { accountModel } from '../models/accounts.model.js';
import { RequestAccountDTO } from '../dto/request/request-account.dto.js';
import { AccountDocument } from '../models/accounts.model.js';

export default class AccountDao {
  async create(data: RequestAccountDTO): Promise<AccountDocument> {
    return accountModel.create({
      ...data,
    });
  }

  async getByName(
    accountName: string,
    userId: string
  ): Promise<AccountDocument | null> {
    return accountModel.findOne({ accountName, userId });
  }

  async getById(id: string): Promise<AccountDocument | null> {
    return accountModel.findOne({ _id: id }).populate('incomes spents transfers');
  }

  async getByUserId(userId: string): Promise<AccountDocument[]> {
    return accountModel.find({ userId }).populate('incomes spents transfers');
  }

  async deleteById(id: string) {
    return accountModel.deleteOne({ _id: id });
  }

  async addSpent(accountId: string, spentId: string) {
    return accountModel.findByIdAndUpdate(
      accountId,
      { $addToSet: { spents: new mongoose.Types.ObjectId(spentId) } },
      { new: true }
    );
  }

  async removeSpent(accountId: string, spentId: string) {
    return accountModel.findByIdAndUpdate(
      accountId,
      { $pull: { spents: new mongoose.Types.ObjectId(spentId) } },
      { new: true }
    );
  }

  async addIncome(accountId: string, incomeId: string) {
    return accountModel.findByIdAndUpdate(
      accountId,
      { $addToSet: { incomes: new mongoose.Types.ObjectId(incomeId) } },
      { new: true }
    );
  }

  async removeIncome(accountId: string, incomeId: string) {
    return accountModel.findByIdAndUpdate(
      accountId,
      { $pull: { incomes: new mongoose.Types.ObjectId(incomeId) } },
      { new: true }
    );
  }
}
