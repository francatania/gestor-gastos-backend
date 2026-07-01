export interface RequestIncomeDTO {
  accountId: string;
  amount: number;
  category: string;
  date: string;
  description: string;
}

export interface RequestUpdateIncomeDTO {
  accountId?: string;
  amount?: number;
  category?: string;
  date?: string;
  description?: string;
}
