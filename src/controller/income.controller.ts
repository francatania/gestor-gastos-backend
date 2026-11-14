import { authenticatedUserId } from '../http/identity.js';
import { NextFunction, Request, Response } from 'express';
import {
  RequestIncomeDTO,
  RequestUpdateIncomeDTO,
} from '../dto/request/incomes/request-income.dto.js';
import { RequestIncomesListDTO } from '../dto/request/incomes/request-incomes-list.dto.js';
import { created, noContent, ok } from '../http/responses.js';
import { IncomeService } from '../services/income.service.js';

export default class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as RequestIncomeDTO;
      const income = await this.incomeService.create(data, authenticatedUserId(req));

      return created(res, income, 'Successfully created income.');
    } catch (error) {
      return next(error);
    }
  };

  getByAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.query.accountId as string;
      const incomes = await this.incomeService.getByAccount(accountId, authenticatedUserId(req));

      return ok(res, incomes);
    } catch (error) {
      return next(error);
    }
  };

  getByDateRange = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: RequestIncomesListDTO = {
        accountId: req.query.accountId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };
      const incomes = await this.incomeService.getByDateRangeAndAccount(data, authenticatedUserId(req));

      return ok(res, incomes);
    } catch (error) {
      return next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const income = await this.incomeService.getById(req.params.id, authenticatedUserId(req));

      return ok(res, income);
    } catch (error) {
      return next(error);
    }
  };

  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as RequestUpdateIncomeDTO;
      const income = await this.incomeService.updateById(req.params.id, data, authenticatedUserId(req));

      return ok(res, income, 'Successfully updated income.');
    } catch (error) {
      return next(error);
    }
  };

  deleteById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.query.accountId as string;
      await this.incomeService.deleteById(req.params.id, accountId, authenticatedUserId(req));

      return noContent(res);
    } catch (error) {
      return next(error);
    }
  };
}
