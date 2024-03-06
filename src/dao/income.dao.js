import incomeModel from "../models/income.model.js";


export default class IncomeDAO{
    static create(data){
        return incomeModel.create(data);
    }

    static async getById(id){
        return await incomeModel.findOne({_id: id});
    }

    static async getByDateRange(startDate, endDate, id){
        return await incomeModel.find({ date: { $gte: startDate, $lte: endDate }, accountId: id });
    }

    static async getByAccount(account){
        return await incomeModel.find({ accountId: { $in: account } })
    }

    static async get(){
        return await incomeModel.find();
    }

    static delete(){
        return incomeModel.deleteMany();
    }

    static deleteById(id){
        return incomeModel.deleteOne({_id: id});
    }
}
