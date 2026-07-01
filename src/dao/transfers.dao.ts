import { TransferLean } from '../dto/types/transfers.types.js';
import { TransferDocument, transferModel } from '../models/transfers.model.js';

export default class TransferDao {
  async create(doc: TransferDocument): Promise<TransferDocument> {
    return doc.save();
  }

  async get(): Promise<TransferLean[]> {
    return transferModel.find()
      .populate('accountId', 'accountName')
      .populate('to', 'accountName')
      .lean();
  }

  async getByDateRangeAndAccount(
    startDate: string,
    endDate: string,
    accountId: string
  ): Promise<TransferLean[]> {
    return transferModel.find({
      date: { $gte: startDate, $lte: endDate },
      $or: [
        { accountId },
        { to: accountId },
      ],
    })
      .populate('accountId', 'accountName')
      .populate('to', 'accountName')
      .lean();
  }

  async getById(id: string): Promise<TransferLean | null> {
    return transferModel.findOne({ _id: id })
      .populate('accountId', 'accountName')
      .populate('to', 'accountName')
      .lean();
  }

  async getByUserId(userId: string): Promise<TransferLean[]> {
    return transferModel.find({ userId })
      .populate('accountId', 'accountName')
      .populate('to', 'accountName')
      .lean();
  }

  async getByAccount(accountId: string): Promise<TransferLean[]> {
    return transferModel.find({
      $or: [
        { accountId },
        { to: accountId },
      ],
    })
      .populate('accountId', 'accountName')
      .populate('to', 'accountName')
      .lean();
  }

  async deleteById(id: string) {
    return transferModel.deleteOne({ _id: id });
  }
}
