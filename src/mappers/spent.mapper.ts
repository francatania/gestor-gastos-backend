import mongoose from 'mongoose';
import { RequestSpentDTO } from '../dto/request/spents/request-spent.dto.js';
import {
  BaseResponseSpentDTO,
  ResponseSpentDetailDTO,
  ResponseSpentListDTO,
} from '../dto/response/spents/response-spent.dto.js';
import { SpentLean } from '../dto/types/spents.types.js';
import { spentModel, SpentDocument } from '../models/spent.model.js';

type PopulatedAccount = {
  _id: unknown;
  accountName: string;
};

type PopulatedCategory = {
  _id: unknown;
  category: string;
};

export class SpentMapper {
  static toModel(spent: RequestSpentDTO): SpentDocument {
    return new spentModel({
      accountId: new mongoose.Types.ObjectId(spent.accountId),
      category: spent.category,
      categoryId: spent.categoryId
        ? new mongoose.Types.ObjectId(spent.categoryId)
        : undefined,
      description: spent.description,
      date: new Date(spent.date),
      amount: spent.amount,
    });
  }

  static toBaseDto(spent: SpentLean): BaseResponseSpentDTO {
    return {
      id: String(spent._id),
      description: spent.description,
      date: spent.date.toISOString(),
      amount: spent.amount,
    };
  }

  static toListDto(spent: SpentLean): ResponseSpentListDTO {
    const account = this.getPopulatedAccount(spent.accountId);
    const category = this.getPopulatedCategory(spent.categoryId);

    return {
      ...this.toBaseDto(spent),
      account: account?.accountName ?? '',
      category: category?.category ?? spent.category ?? undefined,
    };
  }

  static toDetailDto(spent: SpentLean): ResponseSpentDetailDTO {
    const account = this.getPopulatedAccount(spent.accountId);
    const category = this.getPopulatedCategory(spent.categoryId);

    return {
      ...this.toBaseDto(spent),
      account: {
        id: account ? String(account._id) : String(spent.accountId),
        accountName: account?.accountName ?? '',
      },
      ...(category
        ? {
          category: {
            id: String(category._id),
            category: category.category,
          },
        }
        : spent.category
          ? { category: { id: '', category: spent.category } }
          : {}),
    };
  }

  private static getPopulatedAccount(
    account: SpentLean['accountId']
  ): PopulatedAccount | null {
    if (account && typeof account === 'object' && 'accountName' in account) {
      return account as PopulatedAccount;
    }

    return null;
  }

  private static getPopulatedCategory(
    category: SpentLean['categoryId']
  ): PopulatedCategory | null {
    if (category && typeof category === 'object' && 'category' in category) {
      return category as PopulatedCategory;
    }

    return null;
  }
}
