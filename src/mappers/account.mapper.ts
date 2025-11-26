
import { ResponseAccountDTO } from "../dto/response/account-created.js";
import { AccountDocument } from "../models/accounts.model.js";

export class AccountMapper {
  static toDto(
    account: AccountDocument,
  ): ResponseAccountDTO {

    return {
        id: account._id.toString(),
        accountName: account.accountName,
        incomes: account.incomes.map(i => i.toString()),
        spents: account.spents.map(i => i.toString()),
        transfers: account.transfers.map(i => i.toString()),
        createdAt: account.createdAt.toISOString(),
        updatedAt: account.updatedAt.toISOString()

    };
  }
}
