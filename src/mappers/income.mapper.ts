import mongoose from 'mongoose';
import { RequestIncomeDTO } from '../dto/request/incomes/request-income.dto.js';
import {
  BaseResponseIncomeDTO,
  ResponseIncomeDetailDTO,
  ResponseIncomeListDTO,
} from '../dto/response/incomes/response-income.dto.js';
import { IncomeLean } from '../dto/types/incomes.types.js';
import { incomeModel, IncomeDocument } from '../models/income.model.js';

type PopulatedAccount = {
  _id: unknown;
  accountName: string;
};

export class IncomeMapper {
  static toModel(income: RequestIncomeDTO): IncomeDocument {
    return new incomeModel({
      accountId: new mongoose.Types.ObjectId(income.accountId),
      category: income.category,
      description: income.description,
      date: new Date(income.date),
      amount: income.amount,
    });
  }

  static toBaseDto(income: IncomeLean): BaseResponseIncomeDTO {
    return {
      id: String(income._id),
      category: income.category,
      description: income.description,
      date: income.date.toISOString(),
      amount: income.amount,
    };
  }

  static toListDto(income: IncomeLean): ResponseIncomeListDTO {
    const account = this.getPopulatedAccount(income.accountId);

    return {
      ...this.toBaseDto(income),
      account: account?.accountName ?? '',
    };
  }

  static toDetailDto(income: IncomeLean): ResponseIncomeDetailDTO {
    const account = this.getPopulatedAccount(income.accountId);

    return {
      ...this.toBaseDto(income),
      account: {
        id: account ? String(account._id) : String(income.accountId),
        accountName: account?.accountName ?? '',
      },
    };
  }

  private static getPopulatedAccount(
    account: IncomeLean['accountId']
  ): PopulatedAccount | null {
    if (account && typeof account === 'object' && 'accountName' in account) {
      return account as PopulatedAccount;
    }

    return null;
  }
}
