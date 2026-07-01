type PopulatedAccountRef = {
  _id: unknown;
  accountName: string;
};

export type TransferLean = {
  _id: unknown;
  userId: unknown;
  accountId: PopulatedAccountRef | unknown;
  fromName: string;
  to: PopulatedAccountRef | unknown;
  toName: string;
  date: Date;
  amount: number;
};
