export interface DashboardAccountDTO {
  id: string;
  accountName: string;
}

export interface MovementTotalsDTO {
  incomes: number;
  spents: number;
  incomingTransfers: number;
  outgoingTransfers: number;
}

export interface CurrentBalanceDTO extends MovementTotalsDTO {
  balance: number;
}

export interface PeriodTotalsDTO extends MovementTotalsDTO {
  net: number;
}

export interface ChartAmountDTO {
  amount: number;
}

export interface CategoryChartAmountDTO extends ChartAmountDTO {
  category: string;
}

export interface MonthChartAmountDTO extends ChartAmountDTO {
  month: string;
}

export interface AccountSummaryDTO {
  account: DashboardAccountDTO;
  currentBalance: CurrentBalanceDTO;
  period: {
    startDate: string;
    endDate: string;
    totals: PeriodTotalsDTO;
    charts: {
      spentsByCategory: CategoryChartAmountDTO[];
      incomesByCategory: CategoryChartAmountDTO[];
      spentsByMonth: MonthChartAmountDTO[];
      incomesByMonth: MonthChartAmountDTO[];
    };
  };
}

export interface CompactAccountSummaryDTO {
  account: DashboardAccountDTO;
  currentBalance: {
    balance: number;
  };
  period: {
    incomes: number;
    spents: number;
    incomingTransfers: number;
    outgoingTransfers: number;
    net: number;
  };
}
