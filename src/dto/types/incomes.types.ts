type PopulatedAccountRef = {
  _id: unknown;
  accountName: string;
};

export type IncomeLean = {
  _id: unknown;
  accountId: PopulatedAccountRef | unknown;
  category: string;
  description: string;
  date: Date;
  amount: number;
};
