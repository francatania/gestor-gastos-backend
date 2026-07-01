import mongoose from 'mongoose';
import { RequestTransferDTO } from '../dto/request/transfers/request-transfer.dto.js';
import { BaseResponseTransferDTO } from '../dto/response/transfers/response-transfer.dto.js';
import { TransferLean } from '../dto/types/transfers.types.js';
import { transferModel, TransferDocument } from '../models/transfers.model.js';

type PopulatedAccount = {
  _id: unknown;
  accountName: string;
};

export class TransferMapper {
  static toModel(transfer: RequestTransferDTO): TransferDocument {
    return new transferModel({
      userId: new mongoose.Types.ObjectId(transfer.userId),
      accountId: new mongoose.Types.ObjectId(transfer.accountId),
      fromName: transfer.fromName,
      to: new mongoose.Types.ObjectId(transfer.to),
      toName: transfer.toName,
      date: new Date(transfer.date),
      amount: transfer.amount,
    });
  }

  static toDto(transfer: TransferLean): BaseResponseTransferDTO {
    const fromAccount = this.getPopulatedAccount(transfer.accountId);
    const toAccount = this.getPopulatedAccount(transfer.to);

    return {
      id: String(transfer._id),
      userId: String(transfer.userId),
      from: {
        id: fromAccount ? String(fromAccount._id) : String(transfer.accountId),
        name: fromAccount?.accountName ?? transfer.fromName,
      },
      to: {
        id: toAccount ? String(toAccount._id) : String(transfer.to),
        name: toAccount?.accountName ?? transfer.toName,
      },
      date: transfer.date.toISOString(),
      amount: transfer.amount,
    };
  }

  private static getPopulatedAccount(
    account: TransferLean['accountId'] | TransferLean['to']
  ): PopulatedAccount | null {
    if (account && typeof account === 'object' && 'accountName' in account) {
      return account as PopulatedAccount;
    }

    return null;
  }
}
