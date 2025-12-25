import AccountDao from "../dao/account.dao";
import { RequestAccountDTO } from "../dto/request/account/request-account.dto";
import { AccountDocument } from "../models/accounts.model";

export class AccountService {
  constructor(private readonly accountDao: AccountDao) {}

  async create(data: RequestAccountDTO): Promise<AccountDocument>{
            if(
            !data.accountName ||
            !data.userId
            ){
            throw new Error('All fields are required.')
        }
        
        const account: AccountDocument | null =  await this.accountDao.getByName(data.accountName, data.userId);

        if(account){
            throw new Error('Account already exists.')
        }

        try {
            return await this.accountDao.create(data); 

        } catch (error) {
    
            console.error("Could not create the account.", error);
            throw error;
        }
  }

}