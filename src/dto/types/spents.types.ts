type PopulatedAccountRef = {
  _id: unknown;
  accountName: string;
};

type PopulatedCategoryRef = {
  _id: unknown;
  category: string;
};

export type SpentLean = {
  _id: unknown;
  accountId: PopulatedAccountRef | unknown;
  category?: string | null;
  categoryId?: PopulatedCategoryRef | unknown;
  description: string;
  date: Date;
  amount: number;
};
