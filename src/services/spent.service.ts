import SpentsCategoriesDao from '../dao/spents.categories.dao.js';
import { assertSameUser, validateId, refId } from '../http/identity.js';
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
    private readonly accountBalanceService: AccountBalanceService,
    private readonly categoriesDao: SpentsCategoriesDao
  ) {}

  async create(data: RequestSpentDTO, userId: string): Promise<BaseResponseSpentDTO> {
    assertSameUser((data as { userId?: unknown }).userId, userId);
    this.validateCreateRequest(data);
    await this.accountDao.requireOwned(data.accountId, userId);
    await this.validateCategory(data.categoryId, userId);
    await this.accountBalanceService.ensureCanSpend(data.accountId, data.amount, userId);

    const document = SpentMapper.toModel(data);
    const spent = await this.spentDao.create(document);
    const updatedAccount = await this.accountDao.addSpent(
      data.accountId,
      spent._id.toString(), userId
    );

    if (!updatedAccount) {
      await spent.deleteOne();
      throw AppError.notFound('Resource not found.');
    }

    return SpentMapper.toBaseDto(spent);
  }

  async getByAccount(accountId: string, userId: string): Promise<ResponseSpentListDTO[]> {
    this.validateObjectId(accountId, 'Account id is invalid.');
    await this.accountDao.requireOwned(accountId, userId);

    const spents = await this.spentDao.getByAccount(accountId, userId);

    return spents.map((spent) => SpentMapper.toListDto(spent));
  }

  async getByDateRangeAndAccount(
    request: RequestSpentsListDTO, userId: string
  ): Promise<ResponseSpentListDTO[]> {
    if (typeof request.startDate !== 'string' || !request.startDate || typeof request.endDate !== 'string' || !request.endDate) {
      throw AppError.validation('Date range is required.', {
        required: ['startDate', 'endDate'],
      });
    }

    this.validateObjectId(request.accountId, 'Account id is invalid.');
    await this.accountDao.requireOwned(request.accountId, userId);

    const spents = await this.spentDao.getByDateRangeAndAccount(
      request.startDate,
      request.endDate,
      request.accountId, userId
    );

    return spents.map((spent) => SpentMapper.toListDto(spent));
  }

  async getById(spentId: string, userId: string): Promise<ResponseSpentDetailDTO> {
    this.validateObjectId(spentId, 'Spent id is invalid.');

    const spent = await this.spentDao.getById(spentId, userId);

    if (!spent) {
      throw AppError.notFound('Resource not found.');
    }

    return SpentMapper.toDetailDto(spent);
  }

  async updateById(
    spentId: string,
    data: RequestUpdateSpentDTO, userId: string
  ): Promise<ResponseSpentDetailDTO> {
    this.validateObjectId(spentId, 'Spent id is invalid.');

    assertSameUser((data as { userId?: unknown }).userId, userId);
    const current = await this.spentDao.getById(spentId, userId);
    if (!current) throw AppError.notFound('Resource not found.');
    const accountId = refId(current.accountId);
    if (data.accountId !== undefined) {
      await this.accountDao.requireOwned(data.accountId, userId);
      if (data.accountId.toLowerCase() !== accountId) throw AppError.validation('Changing movement account is not supported.');
    }
    await this.validateCategory(data.categoryId, userId);
    const updatedData = this.buildUpdateData(data);
    const spent = await this.spentDao.findByIdAndUpdate(spentId, updatedData, accountId, userId);

    if (!spent) {
      throw AppError.notFound('Resource not found.');
    }

    return SpentMapper.toDetailDto(spent);
  }

  async deleteById(spentId: string, accountId: string, userId: string): Promise<void> {
    validateId(spentId);
    validateId(accountId);
    const current = await this.spentDao.getById(spentId, userId);
    if (!current) throw AppError.notFound('Resource not found.');
    const actualAccountId = refId(current.accountId);
    await this.accountDao.requireOwned(accountId, userId);
    if (actualAccountId !== accountId.toLowerCase()) throw AppError.validation('Movement account does not match.');
    const result = await this.spentDao.deleteById(spentId, actualAccountId, userId);
    if (result.deletedCount === 0) throw AppError.notFound('Resource not found.');
    await this.accountDao.removeSpent(actualAccountId, spentId, userId);
  }

  private async validateCategory(categoryId: unknown, userId: string) {
    if (categoryId === undefined) return;
    validateId(categoryId);
    if (!await this.categoriesDao.getAvailableById(categoryId, userId)) throw AppError.notFound('Resource not found.');
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
    try { validateId(id); } catch {
      throw AppError.validation(message);
    }
  }
}
