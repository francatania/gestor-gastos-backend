import mongoose from 'mongoose';
import AccountDao from '../dao/account.dao.js';
import IncomeDao from '../dao/income.dao.js';
import SpentDao from '../dao/spent.dao.js';
import TransferDao from '../dao/transfers.dao.js';
import {
  AccountSummaryDTO,
  CategoryChartAmountDTO,
  CompactAccountSummaryDTO,
  CurrentBalanceDTO,
  MonthChartAmountDTO,
  PeriodTotalsDTO,
} from '../dto/response/dashboard/response-dashboard-summary.dto.js';
import { IncomeLean } from '../dto/types/incomes.types.js';
import { SpentLean } from '../dto/types/spents.types.js';
import { TransferLean } from '../dto/types/transfers.types.js';
import { AppError } from '../errors/app-error.js';
import { AccountDocument } from '../models/accounts.model.js';

type DateRange = {
  startDate: string;
  endDate: string;
};

export class DashboardService {
  constructor(
    private readonly accountDao: AccountDao,
    private readonly spentDao: SpentDao,
    private readonly incomeDao: IncomeDao,
    private readonly transferDao: TransferDao
  ) {}

  async getAccountSummary(
    accountId: string,
    range: DateRange
  ): Promise<AccountSummaryDTO> {
    this.validateObjectId(accountId, 'Account id is invalid.');
    this.validateDateRange(range);

    const account = await this.accountDao.getById(accountId);

    if (!account) {
      throw AppError.notFound('Account not found.');
    }

    const [
      allTimeSpents,
      allTimeIncomes,
      allTimeTransfers,
      periodSpents,
      periodIncomes,
      periodTransfers,
    ] = await Promise.all([
      this.spentDao.getByAccount(accountId),
      this.incomeDao.getByAccount(accountId),
      this.transferDao.getByAccount(accountId),
      this.spentDao.getByDateRangeAndAccount(range.startDate, range.endDate, accountId),
      this.incomeDao.getByDateRangeAndAccount(range.startDate, range.endDate, accountId),
      this.transferDao.getByDateRangeAndAccount(range.startDate, range.endDate, accountId),
    ]);

    const currentBalance = this.buildCurrentBalance(
      accountId,
      allTimeIncomes,
      allTimeSpents,
      allTimeTransfers
    );
    const periodTotals = this.buildPeriodTotals(
      accountId,
      periodIncomes,
      periodSpents,
      periodTransfers
    );

    return {
      account: this.toAccountDto(account),
      currentBalance,
      period: {
        startDate: range.startDate,
        endDate: range.endDate,
        totals: periodTotals,
        charts: {
          spentsByCategory: this.groupSpentsByCategory(periodSpents),
          incomesByCategory: this.groupIncomesByCategory(periodIncomes),
          spentsByMonth: this.groupByMonth(periodSpents),
          incomesByMonth: this.groupByMonth(periodIncomes),
        },
      },
    };
  }

  async getUserAccountsSummary(
    userId: string,
    range: DateRange
  ): Promise<CompactAccountSummaryDTO[]> {
    this.validateObjectId(userId, 'User id is invalid.');
    this.validateDateRange(range);

    const accounts = await this.accountDao.getByUserId(userId);

    return Promise.all(
      accounts.map(async (account) => {
        const accountId = account._id.toString();
        const [
          allTimeSpents,
          allTimeIncomes,
          allTimeTransfers,
          periodSpents,
          periodIncomes,
          periodTransfers,
        ] = await Promise.all([
          this.spentDao.getByAccount(accountId),
          this.incomeDao.getByAccount(accountId),
          this.transferDao.getByAccount(accountId),
          this.spentDao.getByDateRangeAndAccount(range.startDate, range.endDate, accountId),
          this.incomeDao.getByDateRangeAndAccount(range.startDate, range.endDate, accountId),
          this.transferDao.getByDateRangeAndAccount(range.startDate, range.endDate, accountId),
        ]);

        const currentBalance = this.buildCurrentBalance(
          accountId,
          allTimeIncomes,
          allTimeSpents,
          allTimeTransfers
        );
        const periodTotals = this.buildPeriodTotals(
          accountId,
          periodIncomes,
          periodSpents,
          periodTransfers
        );

        return {
          account: this.toAccountDto(account),
          currentBalance: {
            balance: currentBalance.balance,
          },
          period: periodTotals,
        };
      })
    );
  }

  private buildCurrentBalance(
    accountId: string,
    incomes: IncomeLean[],
    spents: SpentLean[],
    transfers: TransferLean[]
  ): CurrentBalanceDTO {
    const incomesTotal = this.sumAmounts(incomes);
    const spentsTotal = this.sumAmounts(spents);
    const { incomingTransfers, outgoingTransfers } =
      this.calculateTransferTotals(accountId, transfers);

    return {
      incomes: incomesTotal,
      spents: spentsTotal,
      incomingTransfers,
      outgoingTransfers,
      balance: incomesTotal - spentsTotal + incomingTransfers - outgoingTransfers,
    };
  }

  private buildPeriodTotals(
    accountId: string,
    incomes: IncomeLean[],
    spents: SpentLean[],
    transfers: TransferLean[]
  ): PeriodTotalsDTO {
    const incomesTotal = this.sumAmounts(incomes);
    const spentsTotal = this.sumAmounts(spents);
    const { incomingTransfers, outgoingTransfers } =
      this.calculateTransferTotals(accountId, transfers);

    return {
      incomes: incomesTotal,
      spents: spentsTotal,
      incomingTransfers,
      outgoingTransfers,
      net: incomesTotal - spentsTotal + incomingTransfers - outgoingTransfers,
    };
  }

  private calculateTransferTotals(accountId: string, transfers: TransferLean[]) {
    return transfers.reduce(
      (totals, transfer) => {
        if (this.getRefId(transfer.accountId) === accountId) {
          totals.outgoingTransfers += transfer.amount;
        }

        if (this.getRefId(transfer.to) === accountId) {
          totals.incomingTransfers += transfer.amount;
        }

        return totals;
      },
      {
        incomingTransfers: 0,
        outgoingTransfers: 0,
      }
    );
  }

  private groupSpentsByCategory(spents: SpentLean[]): CategoryChartAmountDTO[] {
    const grouped = spents.reduce<Record<string, number>>((acc, spent) => {
      const category = this.getSpentCategory(spent);
      acc[category] = (acc[category] ?? 0) + spent.amount;
      return acc;
    }, {});

    return this.toSortedCategoryChart(grouped);
  }

  private groupIncomesByCategory(incomes: IncomeLean[]): CategoryChartAmountDTO[] {
    const grouped = incomes.reduce<Record<string, number>>((acc, income) => {
      acc[income.category] = (acc[income.category] ?? 0) + income.amount;
      return acc;
    }, {});

    return this.toSortedCategoryChart(grouped);
  }

  private groupByMonth(
    movements: Array<{ date: Date; amount: number }>
  ): MonthChartAmountDTO[] {
    const grouped = movements.reduce<Record<string, number>>((acc, movement) => {
      const month = movement.date.toISOString().slice(0, 7);
      acc[month] = (acc[month] ?? 0) + movement.amount;
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private sumAmounts(movements: Array<{ amount: number }>): number {
    return movements.reduce((total, movement) => total + movement.amount, 0);
  }

  private getSpentCategory(spent: SpentLean): string {
    if (
      spent.categoryId &&
      typeof spent.categoryId === 'object' &&
      'category' in spent.categoryId &&
      typeof spent.categoryId.category === 'string'
    ) {
      return spent.categoryId.category;
    }

    return spent.category ?? 'Sin categoria';
  }

  private toSortedCategoryChart(
    grouped: Record<string, number>
  ): CategoryChartAmountDTO[] {
    return Object.entries(grouped)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }

  private toAccountDto(account: AccountDocument) {
    return {
      id: account._id.toString(),
      accountName: account.accountName,
    };
  }

  private getRefId(ref: unknown): string {
    if (ref && typeof ref === 'object' && '_id' in ref) {
      return String(ref._id);
    }

    return String(ref);
  }

  private validateDateRange(range: DateRange) {
    if (!range.startDate || !range.endDate) {
      throw AppError.validation('Date range is required.', {
        required: ['startDate', 'endDate'],
      });
    }
  }

  private validateObjectId(id: string, message: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw AppError.validation(message);
    }
  }
}
