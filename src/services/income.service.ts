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

  async create(data: RequestIncomeDTO): Promise<BaseResponseIncomeDTO> {
    this.validateCreateRequest(data);

    const document = IncomeMapper.toModel(data);
    const income = await this.incomeDao.create(document);
    const updatedAccount = await this.accountDao.addIncome(
      data.accountId,
      income._id.toString()
    );

    if (!updatedAccount) {
      await this.incomeDao.deleteById(income._id.toString());
      throw AppError.notFound('Account not found.');
    }

    return IncomeMapper.toBaseDto(income);
  }

  async getByAccount(accountId: string): Promise<ResponseIncomeListDTO[]> {
    this.validateObjectId(accountId, 'Account id is invalid.');

    const incomes = await this.incomeDao.getByAccount(accountId);

    return incomes.map((income) => IncomeMapper.toListDto(income));
  }

  async getByDateRangeAndAccount(
    request: RequestIncomesListDTO
  ): Promise<ResponseIncomeListDTO[]> {
    if (!request.startDate || !request.endDate) {
      throw AppError.validation('Date range is required.', {
        required: ['startDate', 'endDate'],
      });
    }

    this.validateObjectId(request.accountId, 'Account id is invalid.');

    const incomes = await this.incomeDao.getByDateRangeAndAccount(
      request.startDate,
      request.endDate,
      request.accountId
    );

    return incomes.map((income) => IncomeMapper.toListDto(income));
  }

  async getById(incomeId: string): Promise<ResponseIncomeDetailDTO> {
    this.validateObjectId(incomeId, 'Income id is invalid.');

    const income = await this.incomeDao.getById(incomeId);

    if (!income) {
      throw AppError.notFound('Income not found.');
    }

    return IncomeMapper.toDetailDto(income);
  }

  async updateById(
    incomeId: string,
    data: RequestUpdateIncomeDTO
  ): Promise<ResponseIncomeDetailDTO> {
    this.validateObjectId(incomeId, 'Income id is invalid.');

    const updatedData = this.buildUpdateData(data);
    const income = await this.incomeDao.findByIdAndUpdate(incomeId, updatedData);

    if (!income) {
      throw AppError.notFound('Income not found.');
    }

    return IncomeMapper.toDetailDto(income);
  }

  async deleteById(incomeId: string, accountId: string): Promise<void> {
    this.validateObjectId(incomeId, 'Income id is invalid.');
    this.validateObjectId(accountId, 'Account id is invalid.');

    await this.accountDao.removeIncome(accountId, incomeId);
    const result = await this.incomeDao.deleteById(incomeId);

    if (result.deletedCount === 0) {
      throw AppError.notFound('Income not found.');
    }
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
    if (!mongoose.isValidObjectId(id)) {
      throw AppError.validation(message);
    }
  }
}
