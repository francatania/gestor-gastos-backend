import AccountDao from '../dao/account.dao.js';
import IncomeDao from '../dao/income.dao.js';
import SpentDao from '../dao/spent.dao.js';
import TransferDao from '../dao/transfers.dao.js';
import { CurrentBalanceDTO } from '../dto/response/dashboard/response-dashboard-summary.dto.js';
import { TransferLean } from '../dto/types/transfers.types.js';
import { AppError } from '../errors/app-error.js';

export class AccountBalanceService {
  constructor(
    private readonly accountDao: AccountDao,
    private readonly spentDao: SpentDao,
    private readonly incomeDao: IncomeDao,
    private readonly transferDao: TransferDao
  ) {}

  async getCurrentBalance(accountId: string): Promise<CurrentBalanceDTO> {
    const account = await this.accountDao.getById(accountId);

    if (!account) {
      throw AppError.notFound('Account not found.');
    }

    const [spents, incomes, transfers] = await Promise.all([
      this.spentDao.getByAccount(accountId),
      this.incomeDao.getByAccount(accountId),
      this.transferDao.getByAccount(accountId),
    ]);

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

  async ensureCanSpend(accountId: string, amount: number): Promise<void> {
    const currentBalance = await this.getCurrentBalance(accountId);

    if (currentBalance.balance - amount < 0) {
      throw AppError.validation('Insufficient account balance.', {
        currentBalance: currentBalance.balance,
        attemptedSpent: amount,
      });
    }
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

  private sumAmounts(movements: Array<{ amount: number }>): number {
    return movements.reduce((total, movement) => total + movement.amount, 0);
  }

  private getRefId(ref: unknown): string {
    if (ref && typeof ref === 'object' && '_id' in ref) {
      return String(ref._id);
    }

    return String(ref);
  }
}
