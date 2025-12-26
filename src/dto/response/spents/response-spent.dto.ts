export interface BaseResponseSpent {
  spentId: string;
  description: string;
  date: string;
  amount: number;
}

export interface ResponseSpentList extends BaseResponseSpent {
  account: string;
  category?: string;
}

export interface ResponseSpentDetail extends BaseResponseSpent {
  account: {
    _id: string;
    accountName: string;
  };
  category?: {
    _id: string;
    category: string;
  };
}
