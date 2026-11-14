
import { ResponseAccountDTO } from "../dto/response/account-created.js";
import { AccountDocument } from "../models/accounts.model.js";

export class AccountMapper {
  static toDto(
    account: AccountDocument,
  ): ResponseAccountDTO {

    return {
        id: account._id.toString(),
        accountName: account.accountName,
        createdAt: account.createdAt.toISOString(),
        updatedAt: account.updatedAt.toISOString()

    };
  }
}
