import { NextFunction, Request, Response } from 'express';
import { ok } from '../http/responses.js';
import { DashboardService } from '../services/dashboard.service.js';

export default class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  getAccountSummary = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const summary = await this.dashboardService.getAccountSummary(
        req.params.accountId,
        {
          startDate: req.query.startDate as string,
          endDate: req.query.endDate as string,
        }
      );

      return ok(res, summary);
    } catch (error) {
      return next(error);
    }
  };

  getUserAccountsSummary = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const summary = await this.dashboardService.getUserAccountsSummary(
        req.params.userId,
        {
          startDate: req.query.startDate as string,
          endDate: req.query.endDate as string,
        }
      );

      return ok(res, summary);
    } catch (error) {
      return next(error);
    }
  };
}
