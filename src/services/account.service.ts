import mongoose from 'mongoose';
import AccountDao from '../dao/account.dao.js';
import { RequestAccountDTO } from '../dto/request/request-account.dto.js';
import { ResponseAccountDTO } from '../dto/response/account-created.js';
import { AppError } from '../errors/app-error.js';
import { AccountMapper } from '../mappers/account.mapper.js';

export class AccountService {
  constructor(private readonly accountDao: AccountDao) {}

  async create(data: RequestAccountDTO): Promise<ResponseAccountDTO> {
    this.validateRequest(data);

    const account = await this.accountDao.getByName(data.accountName, data.userId);

    if (account) {
      throw AppError.conflict('Account already exists.');
    }

    const createdAccount = await this.accountDao.create(data);

    return AccountMapper.toDto(createdAccount);
  }

  async getById(id: string): Promise<ResponseAccountDTO> {
    this.validateObjectId(id, 'Account id is invalid.');

    const account = await this.accountDao.getById(id);

    if (!account) {
      throw AppError.notFound('Account not found.');
    }

    return AccountMapper.toDto(account);
  }

  async getByUserId(userId: string): Promise<ResponseAccountDTO[]> {
    this.validateObjectId(userId, 'User id is invalid.');

    const accounts = await this.accountDao.getByUserId(userId);

    return accounts.map(AccountMapper.toDto);
  }

  async deleteById(id: string): Promise<void> {
    this.validateObjectId(id, 'Account id is invalid.');

    const result = await this.accountDao.deleteById(id);

    if (result.deletedCount === 0) {
      throw AppError.notFound('Account not found.');
    }
  }

  private validateRequest(data: RequestAccountDTO) {
    if (!data.accountName || !data.userId) {
      throw AppError.validation('All fields are required.', {
        required: ['accountName', 'userId'],
      });
    }

    this.validateObjectId(data.userId, 'User id is invalid.');
  }

  private validateObjectId(id: string, message: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw AppError.validation(message);
    }
  }
}
