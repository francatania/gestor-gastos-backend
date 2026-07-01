import { NextFunction, Request, Response } from 'express';
import { RequestSpentDTO, RequestUpdateSpentDTO } from '../dto/request/spents/request-spent.dto.js';
import { RequestSpentsListDTO } from '../dto/request/spents/request-spents-list.dto.js';
import { created, noContent, ok } from '../http/responses.js';
import { SpentService } from '../services/spent.service.js';

export default class SpentController {
  constructor(private readonly spentService: SpentService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as RequestSpentDTO;
      const spent = await this.spentService.create(data);

      return created(res, spent, 'Successfully created spent.');
    } catch (error) {
      return next(error);
    }
  };

  getByAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = (req.query.accountId as string) ?? req.params.id;
      const spents = await this.spentService.getByAccount(accountId);

      return ok(res, spents);
    } catch (error) {
      return next(error);
    }
  };

  getByDateRange = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: RequestSpentsListDTO = {
        accountId: (req.query.accountId as string) ?? req.params.id,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };
      const spents = await this.spentService.getByDateRangeAndAccount(data);

      return ok(res, spents);
    } catch (error) {
      return next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const spent = await this.spentService.getById(req.params.id);

      return ok(res, spent);
    } catch (error) {
      return next(error);
    }
  };

  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as RequestUpdateSpentDTO;
      const spent = await this.spentService.updateById(req.params.id, data);

      return ok(res, spent, 'Successfully updated spent.');
    } catch (error) {
      return next(error);
    }
  };

  deleteById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.query.accountId as string;
      await this.spentService.deleteById(req.params.id, accountId);

      return noContent(res);
    } catch (error) {
      return next(error);
    }
  };
}
