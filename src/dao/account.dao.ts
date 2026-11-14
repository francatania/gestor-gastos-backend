import mongoose from 'mongoose';
import { AppError } from '../errors/app-error.js';
import { validateId } from '../http/identity.js';
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

  async getById(id: string, userId: string): Promise<AccountDocument | null> {
    validateId(id);
    validateId(userId);
    return accountModel.findOne({ _id: id, userId });
  }

  async requireOwned(id: string, userId: string): Promise<AccountDocument> {
    const account = await this.getById(id, userId);
    if (!account) throw AppError.notFound('Resource not found.');
    return account;
  }

  async getByUserId(userId: string): Promise<AccountDocument[]> {
    validateId(userId);
    return accountModel.find({ userId });
  }

  async deleteById(id: string, userId: string) {
    validateId(id);
    validateId(userId);
    return accountModel.deleteOne({ _id: id, userId });
  }

  async addSpent(accountId: string, spentId: string, userId: string) {
    return accountModel.findOneAndUpdate(
      { _id: accountId, userId },
      { $addToSet: { spents: new mongoose.Types.ObjectId(spentId) } },
      { new: true }
    );
  }

  async removeSpent(accountId: string, spentId: string, userId: string) {
    return accountModel.findOneAndUpdate(
      { _id: accountId, userId },
      { $pull: { spents: new mongoose.Types.ObjectId(spentId) } },
      { new: true }
    );
  }

  async addIncome(accountId: string, incomeId: string, userId: string) {
    return accountModel.findOneAndUpdate(
      { _id: accountId, userId },
      { $addToSet: { incomes: new mongoose.Types.ObjectId(incomeId) } },
      { new: true }
    );
  }

  async removeIncome(accountId: string, incomeId: string, userId: string) {
    return accountModel.findOneAndUpdate(
      { _id: accountId, userId },
      { $pull: { incomes: new mongoose.Types.ObjectId(incomeId) } },
      { new: true }
    );
  }

  async addTransfer(accountId: string, transferId: string, userId: string) {
    return accountModel.findOneAndUpdate(
      { _id: accountId, userId },
      { $addToSet: { transfers: new mongoose.Types.ObjectId(transferId) } },
      { new: true }
    );
  }

  async removeTransfer(accountId: string, transferId: string, userId: string) {
    return accountModel.findOneAndUpdate(
      { _id: accountId, userId },
      { $pull: { transfers: new mongoose.Types.ObjectId(transferId) } },
      { new: true }
    );
  }
}
