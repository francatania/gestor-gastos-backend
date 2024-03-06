import accountsModel from "../models/accounts.model.js";

export default class AccountDao{
    static create(data){
        const {
            accountName,
            userId
        } = data

        return accountsModel.create({
            accountName,
            userId
        });
    }

    static async getById(id){
        return await accountsModel.findOne({_id: id}).populate('incomes spents transfers');
    }

    static async getByName(accountName, userId){
        return await accountsModel.findOne({accountName, userId})
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

}
