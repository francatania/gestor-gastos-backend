import { TransferLean } from '../dto/types/transfers.types.js';
import { TransferDocument, transferModel } from '../models/transfers.model.js';
import { accountModel } from '../models/accounts.model.js';
import { validateId } from '../http/identity.js';

export default class TransferDao {
  private async scope(userId: string) {
    validateId(userId);
    const ids = await accountModel.find({ userId }).distinct('_id');
    return { userId, accountId: { $in: ids }, to: { $in: ids } };
  }

  async create(doc: TransferDocument): Promise<TransferDocument> { return doc.save(); }

  async get(userId: string): Promise<TransferLean[]> {
    return transferModel.find(await this.scope(userId))
      .populate('accountId', 'accountName').populate('to', 'accountName').lean();
  }

  async getByDateRangeAndAccount(startDate: string, endDate: string, accountId: string, userId: string): Promise<TransferLean[]> {
    return transferModel.find({ ...await this.scope(userId), date: { $gte: startDate, $lte: endDate },
      $or: [{ accountId }, { to: accountId }] })
      .populate('accountId', 'accountName').populate('to', 'accountName').lean();
  }

  async getById(id: string, userId: string): Promise<TransferLean | null> {
    return transferModel.findOne({ ...await this.scope(userId), _id: id })
      .populate('accountId', 'accountName').populate('to', 'accountName').lean();
  }

  async getByUserId(userId: string): Promise<TransferLean[]> { return this.get(userId); }

  async getByAccount(accountId: string, userId: string): Promise<TransferLean[]> {
    return transferModel.find({ ...await this.scope(userId), $or: [{ accountId }, { to: accountId }] })
      .populate('accountId', 'accountName').populate('to', 'accountName').lean();
  }

}
