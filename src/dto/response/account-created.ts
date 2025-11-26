export interface ResponseAccountDTO {
  id: string;
  accountName: string;
  incomes: string[];
  spents: string[];
  transfers: string[];
  createdAt: string;
  updatedAt: string;
}