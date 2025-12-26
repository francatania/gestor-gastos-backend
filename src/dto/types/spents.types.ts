type PopulatedRefAccount = {
  _id: any;
  accountName: string;
};

type PopulatedRefCategory = {
  _id: any;
  category: string;
};


export type SpentLean = {
  _id: any;
  accountId: PopulatedRefAccount | any;
  categoryId?: PopulatedRefCategory | any;
  description: string;
  date: Date;
  amount: number;
};