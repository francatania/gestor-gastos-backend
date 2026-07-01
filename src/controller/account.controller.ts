import { AccountService } from '../services/account.service.js';
import { RequestAccountDTO } from '../dto/request/request-account.dto.js';
import { Request, Response, NextFunction } from 'express';
import { created, noContent, ok } from '../http/responses.js';

export default class AccountController {
  constructor(private readonly accountService: AccountService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as RequestAccountDTO;
      const account = await this.accountService.create(data);

      return created(res, account, 'Successfully created account.');
    } catch (error) {
      return next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const account = await this.accountService.getById(req.params.id);

      return ok(res, account);
    } catch (error) {
      return next(error);
    }
  };

  getByUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.query.userId as string;
      const accounts = await this.accountService.getByUserId(userId);

      return ok(res, accounts);
    } catch (error) {
      return next(error);
    }
  };

  deleteById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.accountService.deleteById(req.params.id);

      return noContent(res);
    } catch (error) {
      return next(error);
    }
  };
}
