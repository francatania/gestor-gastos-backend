export interface RequestSpentDTO {
  accountId: string;
  amount: number;
  category?: string;
  categoryId?: string;
  date: string;
  description: string;
}

export interface RequestUpdateSpentDTO {
  accountId?: string;
  amount?: number;
  category?: string;
  categoryId?: string;
  date?: string;
  description?: string;
}
