import { assertSameUser, validateId } from '../http/identity.js';
import AccountDao from '../dao/account.dao.js';
import { RequestAccountDTO } from '../dto/request/request-account.dto.js';
import { ResponseAccountDTO } from '../dto/response/account-created.js';
import { AppError } from '../errors/app-error.js';
import { AccountMapper } from '../mappers/account.mapper.js';

export class AccountService {
  constructor(private readonly accountDao: AccountDao) {}

  async create(data: RequestAccountDTO, userId: string): Promise<ResponseAccountDTO> {
    assertSameUser(data.userId, userId);
    data = { accountName: data.accountName, userId };
    this.validateRequest(data);

    const account = await this.accountDao.getByName(data.accountName, data.userId);

    if (account) {
      throw AppError.conflict('Account already exists.');
    }

    const createdAccount = await this.accountDao.create(data);

    return AccountMapper.toDto(createdAccount);
  }

  async getById(id: string, userId: string): Promise<ResponseAccountDTO> {
    this.validateObjectId(id, 'Account id is invalid.');

    const account = await this.accountDao.getById(id, userId);

    if (!account) {
      throw AppError.notFound('Resource not found.');
    }

    return AccountMapper.toDto(account);
  }

  async getByUserId(requestedUserId: string, userId: string): Promise<ResponseAccountDTO[]> {
    assertSameUser(requestedUserId, userId);

    const accounts = await this.accountDao.getByUserId(userId);

    return accounts.map(AccountMapper.toDto);
  }

  async deleteById(id: string, userId: string): Promise<void> {
    this.validateObjectId(id, 'Account id is invalid.');

    const result = await this.accountDao.deleteById(id, userId);

    if (result.deletedCount === 0) {
      throw AppError.notFound('Resource not found.');
    }
  }

  private validateRequest(data: RequestAccountDTO) {
    if (typeof data.accountName !== 'string' || !data.accountName.trim() || !data.userId) {
      throw AppError.validation('All fields are required.', {
        required: ['accountName', 'userId'],
      });
    }

    this.validateObjectId(data.userId, 'User id is invalid.');
  }

  private validateObjectId(id: string, message: string) {
    try { validateId(id); } catch {
      throw AppError.validation(message);
    }
  }
}
