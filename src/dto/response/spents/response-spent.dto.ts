export interface BaseResponseSpentDTO {
  id: string;
  description: string;
  date: string;
  amount: number;
}

export interface ResponseSpentListDTO extends BaseResponseSpentDTO {
  account: string;
  category?: string;
}

export interface ResponseSpentDetailDTO extends BaseResponseSpentDTO {
  account: {
    id: string;
    accountName: string;
  };
  category?: {
    id: string;
    category: string;
  };
}
