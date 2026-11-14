import { authenticatedUserId } from '../http/identity.js';
import { NextFunction, Request, Response } from 'express';
import { RequestTransferDTO } from '../dto/request/transfers/request-transfer.dto.js';
import { RequestTransfersListDTO } from '../dto/request/transfers/request-transfers-list.dto.js';
import { created, ok } from '../http/responses.js';
import { TransferService } from '../services/transfer.service.js';

export default class TransferController {
  constructor(private readonly transferService: TransferService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as RequestTransferDTO;
      const transfer = await this.transferService.create(data, authenticatedUserId(req));

      return created(res, transfer, 'Successfully created transfer.');
    } catch (error) {
      return next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transfers = await this.transferService.getAll(authenticatedUserId(req));

      return ok(res, transfers);
    } catch (error) {
      return next(error);
    }
  };

  getByUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transfers = await this.transferService.getByUser(req.params.id, authenticatedUserId(req));

      return ok(res, transfers);
    } catch (error) {
      return next(error);
    }
  };

  getByAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.query.accountId as string;
      const transfers = await this.transferService.getByAccount(accountId, authenticatedUserId(req));

      return ok(res, transfers);
    } catch (error) {
      return next(error);
    }
  };

  getByDateRange = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: RequestTransfersListDTO = {
        accountId: req.query.accountId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };
      const transfers = await this.transferService.getByDateRangeAndAccount(data, authenticatedUserId(req));

      return ok(res, transfers);
    } catch (error) {
      return next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transfer = await this.transferService.getById(req.params.id, authenticatedUserId(req));

      return ok(res, transfer);
    } catch (error) {
      return next(error);
    }
  };
}
