import mongoose from 'mongoose';
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

  async create(data: RequestTransferDTO): Promise<BaseResponseTransferDTO> {
    this.validateCreateRequest(data);

    const document = TransferMapper.toModel(data);
    const transfer = await this.transferDao.create(document);
    const transferId = transfer._id.toString();

    const [fromAccount, toAccount] = await Promise.all([
      this.accountDao.addTransfer(data.accountId, transferId),
      this.accountDao.addTransfer(data.to, transferId),
    ]);

    if (!fromAccount || !toAccount) {
      await Promise.all([
        this.accountDao.removeTransfer(data.accountId, transferId),
        this.accountDao.removeTransfer(data.to, transferId),
      ]);
      await this.transferDao.deleteById(transferId);
      throw AppError.notFound('Account not found.');
    }

    return TransferMapper.toDto(transfer);
  }

  async getAll(): Promise<BaseResponseTransferDTO[]> {
    const transfers = await this.transferDao.get();

    return transfers.map((transfer) => TransferMapper.toDto(transfer));
  }

  async getByUser(userId: string): Promise<BaseResponseTransferDTO[]> {
    this.validateObjectId(userId, 'User id is invalid.');

    const transfers = await this.transferDao.getByUserId(userId);

    return transfers.map((transfer) => TransferMapper.toDto(transfer));
  }

  async getByAccount(accountId: string): Promise<BaseResponseTransferDTO[]> {
    this.validateObjectId(accountId, 'Account id is invalid.');

    const transfers = await this.transferDao.getByAccount(accountId);

    return transfers.map((transfer) => TransferMapper.toDto(transfer));
  }

  async getByDateRangeAndAccount(
    request: RequestTransfersListDTO
  ): Promise<BaseResponseTransferDTO[]> {
    if (!request.startDate || !request.endDate) {
      throw AppError.validation('Date range is required.', {
        required: ['startDate', 'endDate'],
      });
    }

    this.validateObjectId(request.accountId, 'Account id is invalid.');

    const transfers = await this.transferDao.getByDateRangeAndAccount(
      request.startDate,
      request.endDate,
      request.accountId
    );

    return transfers.map((transfer) => TransferMapper.toDto(transfer));
  }

  async getById(transferId: string): Promise<BaseResponseTransferDTO> {
    this.validateObjectId(transferId, 'Transfer id is invalid.');

    const transfer = await this.transferDao.getById(transferId);

    if (!transfer) {
      throw AppError.notFound('Transfer not found.');
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
    if (!mongoose.isValidObjectId(id)) {
      throw AppError.validation(message);
    }
  }
}
