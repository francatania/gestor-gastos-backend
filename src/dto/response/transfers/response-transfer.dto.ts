export interface BaseResponseTransferDTO {
  id: string;
  userId: string;
  from: {
    id: string;
    name: string;
  };
  to: {
    id: string;
    name: string;
  };
  date: string;
  amount: number;
}
