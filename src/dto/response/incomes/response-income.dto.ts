export interface BaseResponseIncomeDTO {
  id: string;
  category: string;
  description: string;
  date: string;
  amount: number;
}

export interface ResponseIncomeListDTO extends BaseResponseIncomeDTO {
  account: string;
}

export interface ResponseIncomeDetailDTO extends BaseResponseIncomeDTO {
  account: {
    id: string;
    accountName: string;
  };
}
