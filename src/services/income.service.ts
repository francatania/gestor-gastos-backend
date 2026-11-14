import { assertSameUser, validateId, refId } from '../http/identity.js';
import mongoose from 'mongoose';
import AccountDao from '../dao/account.dao.js';
import IncomeDao from '../dao/income.dao.js';
import {
  RequestIncomeDTO,
  RequestUpdateIncomeDTO,
} from '../dto/request/incomes/request-income.dto.js';
import { RequestIncomesListDTO } from '../dto/request/incomes/request-incomes-list.dto.js';
import {
  BaseResponseIncomeDTO,
  ResponseIncomeDetailDTO,
  ResponseIncomeListDTO,
} from '../dto/response/incomes/response-income.dto.js';
import { AppError } from '../errors/app-error.js';
import { IncomeMapper } from '../mappers/income.mapper.js';
import { IncomeDocument } from '../models/income.model.js';

export class IncomeService {
  constructor(
    private readonly incomeDao: IncomeDao,
    private readonly accountDao: AccountDao
  ) {}

  async create(data: RequestIncomeDTO, userId: string): Promise<BaseResponseIncomeDTO> {
    assertSameUser((data as { userId?: unknown }).userId, userId);
    this.validateCreateRequest(data);
    await this.accountDao.requireOwned(data.accountId, userId);

    const document = IncomeMapper.toModel(data);
    const income = await this.incomeDao.create(document);
    const updatedAccount = await this.accountDao.addIncome(
      data.accountId,
      income._id.toString(), userId
    );

    if (!updatedAccount) {
      await income.deleteOne();
      throw AppError.notFound('Resource not found.');
    }

    return IncomeMapper.toBaseDto(income);
  }

  async getByAccount(accountId: string, userId: string): Promise<ResponseIncomeListDTO[]> {
    this.validateObjectId(accountId, 'Account id is invalid.');
    await this.accountDao.requireOwned(accountId, userId);

    const incomes = await this.incomeDao.getByAccount(accountId, userId);

    return incomes.map((income) => IncomeMapper.toListDto(income));
  }

  async getByDateRangeAndAccount(
    request: RequestIncomesListDTO, userId: string
  ): Promise<ResponseIncomeListDTO[]> {
    if (typeof request.startDate !== 'string' || !request.startDate || typeof request.endDate !== 'string' || !request.endDate) {
      throw AppError.validation('Date range is required.', {
        required: ['startDate', 'endDate'],
      });
    }

    this.validateObjectId(request.accountId, 'Account id is invalid.');
    await this.accountDao.requireOwned(request.accountId, userId);

    const incomes = await this.incomeDao.getByDateRangeAndAccount(
      request.startDate,
      request.endDate,
      request.accountId, userId
    );

    return incomes.map((income) => IncomeMapper.toListDto(income));
  }

  async getById(incomeId: string, userId: string): Promise<ResponseIncomeDetailDTO> {
    this.validateObjectId(incomeId, 'Income id is invalid.');

    const income = await this.incomeDao.getById(incomeId, userId);

    if (!income) {
      throw AppError.notFound('Resource not found.');
    }

    return IncomeMapper.toDetailDto(income);
  }

  async updateById(
    incomeId: string,
    data: RequestUpdateIncomeDTO, userId: string
  ): Promise<ResponseIncomeDetailDTO> {
    this.validateObjectId(incomeId, 'Income id is invalid.');

    assertSameUser((data as { userId?: unknown }).userId, userId);
    const current = await this.incomeDao.getById(incomeId, userId);
    if (!current) throw AppError.notFound('Resource not found.');
    const accountId = refId(current.accountId);
    if (data.accountId !== undefined) {
      await this.accountDao.requireOwned(data.accountId, userId);
      if (data.accountId.toLowerCase() !== accountId) throw AppError.validation('Changing movement account is not supported.');
    }
    const updatedData = this.buildUpdateData(data);
    const income = await this.incomeDao.findByIdAndUpdate(incomeId, updatedData, accountId, userId);

    if (!income) {
      throw AppError.notFound('Resource not found.');
    }

    return IncomeMapper.toDetailDto(income);
  }

  async deleteById(incomeId: string, accountId: string, userId: string): Promise<void> {
    validateId(incomeId);
    validateId(accountId);
    const current = await this.incomeDao.getById(incomeId, userId);
    if (!current) throw AppError.notFound('Resource not found.');
    const actualAccountId = refId(current.accountId);
    await this.accountDao.requireOwned(accountId, userId);
    if (actualAccountId !== accountId.toLowerCase()) throw AppError.validation('Movement account does not match.');
    const result = await this.incomeDao.deleteById(incomeId, actualAccountId, userId);
    if (result.deletedCount === 0) throw AppError.notFound('Resource not found.');
    await this.accountDao.removeIncome(actualAccountId, incomeId, userId);
  }

  private validateCreateRequest(data: RequestIncomeDTO) {
    if (!data.accountId || !data.amount || !data.category || !data.description || !data.date) {
      throw AppError.validation('There are some fields missing.', {
        required: ['accountId', 'amount', 'category', 'description', 'date'],
      });
    }

    this.validateObjectId(data.accountId, 'Account id is invalid.');
  }

  private buildUpdateData(data: RequestUpdateIncomeDTO): Partial<IncomeDocument> {
    if (data.accountId) {
      this.validateObjectId(data.accountId, 'Account id is invalid.');
    }

    return {
      accountId: data.accountId
        ? new mongoose.Types.ObjectId(data.accountId)
        : undefined,
      amount: data.amount,
      category: data.category,
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
