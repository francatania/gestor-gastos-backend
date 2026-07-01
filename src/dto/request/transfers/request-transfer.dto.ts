export interface RequestTransferDTO {
  userId: string;
  accountId: string;
  fromName: string;
  to: string;
  toName: string;
  date: string;
  amount: number;
}

export interface RequestUpdateTransferDTO {
  userId?: string;
  accountId?: string;
  fromName?: string;
  to?: string;
  toName?: string;
  date?: string;
  amount?: number;
}
