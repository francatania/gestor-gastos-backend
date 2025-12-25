import {accountModel} from "../models/accounts.model.js";
import { RequestAccountDTO } from "../dto/request/account/request-account.dto.js";
import { AccountDocument } from "../models/accounts.model.js";

export default class AccountDao{
    async create(data: RequestAccountDTO): Promise<AccountDocument>{

        return accountModel.create({
        ...data
        });
    }

     async getByName(accountName: string, userId: string): Promise<AccountDocument | null>{
        return await accountModel.findOne({accountName, userId})
    }


    /*static async getById(id){
        return await accountsModel.findOne({_id: id}).populate('incomes spents transfers');
    }



    static async get(){
        return await accountsModel.find().populate('incomes spents transfers ');
    }

    static delete(){
        return accountsModel.deleteMany();
    }

    static deleteById(id){
        return accountsModel.deleteOne({_id: id});
    }
*/
}
