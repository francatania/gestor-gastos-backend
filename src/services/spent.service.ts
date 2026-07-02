import mongoose from 'mongoose';
import AccountDao from '../dao/account.dao.js';
import SpentDao from '../dao/spent.dao.js';
import {
  RequestSpentDTO,
  RequestUpdateSpentDTO,
} from '../dto/request/spents/request-spent.dto.js';
import { RequestSpentsListDTO } from '../dto/request/spents/request-spents-list.dto.js';
import {
  BaseResponseSpentDTO,
  ResponseSpentDetailDTO,
  ResponseSpentListDTO,
} from '../dto/response/spents/response-spent.dto.js';
import { AppError } from '../errors/app-error.js';
import { SpentMapper } from '../mappers/spent.mapper.js';
import { SpentDocument } from '../models/spent.model.js';
import { AccountBalanceService } from './account-balance.service.js';

export class SpentService {
  constructor(
    private readonly spentDao: SpentDao,
    private readonly accountDao: AccountDao,
    private readonly accountBalanceService: AccountBalanceService
  ) {}

  async create(data: RequestSpentDTO): Promise<BaseResponseSpentDTO> {
    this.validateCreateRequest(data);
    await this.accountBalanceService.ensureCanSpend(data.accountId, data.amount);

    const document = SpentMapper.toModel(data);
    const spent = await this.spentDao.create(document);
    const updatedAccount = await this.accountDao.addSpent(
      data.accountId,
      spent._id.toString()
    );

    if (!updatedAccount) {
      await this.spentDao.deleteById(spent._id.toString());
      throw AppError.notFound('Account not found.');
    }

    return SpentMapper.toBaseDto(spent);
  }

  async getByAccount(accountId: string): Promise<ResponseSpentListDTO[]> {
    this.validateObjectId(accountId, 'Account id is invalid.');

    const spents = await this.spentDao.getByAccount(accountId);

    return spents.map((spent) => SpentMapper.toListDto(spent));
  }

  async getByDateRangeAndAccount(
    request: RequestSpentsListDTO
  ): Promise<ResponseSpentListDTO[]> {
    if (!request.startDate || !request.endDate) {
      throw AppError.validation('Date range is required.', {
        required: ['startDate', 'endDate'],
      });
    }

    this.validateObjectId(request.accountId, 'Account id is invalid.');

    const spents = await this.spentDao.getByDateRangeAndAccount(
      request.startDate,
      request.endDate,
      request.accountId
    );

    return spents.map((spent) => SpentMapper.toListDto(spent));
  }

  async getById(spentId: string): Promise<ResponseSpentDetailDTO> {
    this.validateObjectId(spentId, 'Spent id is invalid.');

    const spent = await this.spentDao.getById(spentId);

    if (!spent) {
      throw AppError.notFound('Spent not found.');
    }

    return SpentMapper.toDetailDto(spent);
  }

  async updateById(
    spentId: string,
    data: RequestUpdateSpentDTO
  ): Promise<ResponseSpentDetailDTO> {
    this.validateObjectId(spentId, 'Spent id is invalid.');

    const updatedData = this.buildUpdateData(data);
    const spent = await this.spentDao.findByIdAndUpdate(spentId, updatedData);

    if (!spent) {
      throw AppError.notFound('Spent not found.');
    }

    return SpentMapper.toDetailDto(spent);
  }

  async deleteById(spentId: string, accountId: string): Promise<void> {
    this.validateObjectId(spentId, 'Spent id is invalid.');
    this.validateObjectId(accountId, 'Account id is invalid.');

    await this.accountDao.removeSpent(accountId, spentId);
    const result = await this.spentDao.deleteById(spentId);

    if (result.deletedCount === 0) {
      throw AppError.notFound('Spent not found.');
    }
  }

  private validateCreateRequest(data: RequestSpentDTO) {
    if (!data.accountId || !data.amount || !data.description || !data.date) {
      throw AppError.validation('There are some fields missing.', {
        required: ['accountId', 'amount', 'description', 'date'],
      });
    }

    if (!data.category && !data.categoryId) {
      throw AppError.validation('Spent category is required.', {
        requiredOneOf: ['category', 'categoryId'],
      });
    }

    this.validateObjectId(data.accountId, 'Account id is invalid.');

    if (data.categoryId) {
      this.validateObjectId(data.categoryId, 'Category id is invalid.');
    }
  }

  private buildUpdateData(data: RequestUpdateSpentDTO): Partial<SpentDocument> {
    if (data.accountId) {
      this.validateObjectId(data.accountId, 'Account id is invalid.');
    }

    if (data.categoryId) {
      this.validateObjectId(data.categoryId, 'Category id is invalid.');
    }

    return {
      accountId: data.accountId
        ? new mongoose.Types.ObjectId(data.accountId)
        : undefined,
      amount: data.amount,
      category: data.category,
      categoryId: data.categoryId
        ? new mongoose.Types.ObjectId(data.categoryId)
        : undefined,
      date: data.date ? new Date(data.date) : undefined,
      description: data.description,
    };
  }

  private validateObjectId(id: string, message: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw AppError.validation(message);
    }
  }
}
