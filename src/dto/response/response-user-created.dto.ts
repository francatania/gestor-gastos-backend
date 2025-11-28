import { ResponseAccountDTO } from "./account-created";

export interface ResponseUserCreatedDTO{
      id: string,
      first_name: string,
      last_name: string,
      email: string,
      accounts: ResponseAccountDTO[],
}