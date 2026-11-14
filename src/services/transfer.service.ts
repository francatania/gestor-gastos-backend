import { assertSameUser, validateId } from '../http/identity.js';
import AccountDao from '../dao/account.dao.js';
import TransferDao from '../dao/transfers.dao.js';
import { RequestTransferDTO } from '../dto/request/transfers/request-transfer.dto.js';
import { RequestTransfersListDTO } from '../dto/request/transfers/request-transfers-list.dto.js';
import { BaseResponseTransferDTO } from '../dto/response/transfers/response-transfer.dto.js';
import { AppError } from '../errors/app-error.js';
import { TransferMapper } from '../mappers/transfer.mapper.js';

export class TransferService {
  constructor(
    private readonly transferDao: TransferDao,
    private readonly accountDao: AccountDao
  ) {}

  async create(data: RequestTransferDTO, userId: string): Promise<BaseResponseTransferDTO> {
    assertSameUser(data.userId, userId);
    const [from, to] = await Promise.all([
      this.accountDao.requireOwned(data.accountId, userId),
      this.accountDao.requireOwned(data.to, userId),
    ]);
    data = { ...data, userId, fromName: from.accountName, toName: to.accountName };
    this.validateCreateRequest(data);

    const document = TransferMapper.toModel(data);
    const transfer = await this.transferDao.create(document);
    const transferId = transfer._id.toString();

    const [fromAccount, toAccount] = await Promise.all([
      this.accountDao.addTransfer(data.accountId, transferId, userId),
      this.accountDao.addTransfer(data.to, transferId, userId),
    ]);

    if (!fromAccount || !toAccount) {
      await Promise.all([
        this.accountDao.removeTransfer(data.accountId, transferId, userId),
        this.accountDao.removeTransfer(data.to, transferId, userId),
      ]);
      await transfer.deleteOne();
      throw AppError.notFound('Resource not found.');
    }

    return TransferMapper.toDto(transfer);
  }

  async getAll(userId: string): Promise<BaseResponseTransferDTO[]> {
    const transfers = await this.transferDao.get(userId);

    return transfers.map((transfer) => TransferMapper.toDto(transfer));
  }

  async getByUser(requestedUserId: string, userId: string): Promise<BaseResponseTransferDTO[]> {
    assertSameUser(requestedUserId, userId);

    const transfers = await this.transferDao.getByUserId(userId);

    return transfers.map((transfer) => TransferMapper.toDto(transfer));
  }

  async getByAccount(accountId: string, userId: string): Promise<BaseResponseTransferDTO[]> {
    this.validateObjectId(accountId, 'Account id is invalid.');
    await this.accountDao.requireOwned(accountId, userId);

    const transfers = await this.transferDao.getByAccount(accountId, userId);

    return transfers.map((transfer) => TransferMapper.toDto(transfer));
  }

  async getByDateRangeAndAccount(
    request: RequestTransfersListDTO, userId: string
  ): Promise<BaseResponseTransferDTO[]> {
    if (typeof request.startDate !== 'string' || !request.startDate || typeof request.endDate !== 'string' || !request.endDate) {
      throw AppError.validation('Date range is required.', {
        required: ['startDate', 'endDate'],
      });
    }

    this.validateObjectId(request.accountId, 'Account id is invalid.');
    await this.accountDao.requireOwned(request.accountId, userId);

    const transfers = await this.transferDao.getByDateRangeAndAccount(
      request.startDate,
      request.endDate,
      request.accountId, userId
    );

    return transfers.map((transfer) => TransferMapper.toDto(transfer));
  }

  async getById(transferId: string, userId: string): Promise<BaseResponseTransferDTO> {
    this.validateObjectId(transferId, 'Transfer id is invalid.');

    const transfer = await this.transferDao.getById(transferId, userId);

    if (!transfer) {
      throw AppError.notFound('Resource not found.');
    }

    return TransferMapper.toDto(transfer);
  }

  private validateCreateRequest(data: RequestTransferDTO) {
    if (
      !data.userId ||
      !data.accountId ||
      !data.fromName ||
      !data.to ||
      !data.toName ||
      !data.date ||
      !data.amount
    ) {
      throw AppError.validation('There are some fields missing.', {
        required: ['userId', 'accountId', 'fromName', 'to', 'toName', 'date', 'amount'],
      });
    }

    this.validateObjectId(data.userId, 'User id is invalid.');
    this.validateObjectId(data.accountId, 'Source account id is invalid.');
    this.validateObjectId(data.to, 'Destination account id is invalid.');
  }

  private validateObjectId(id: string, message: string) {
    try { validateId(id); } catch {
      throw AppError.validation(message);
    }
  }
}
