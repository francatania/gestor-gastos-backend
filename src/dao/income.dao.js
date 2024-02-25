import incomeModel from "../models/income.model.js";


export default class IncomeDAO{
    static create(data){
        return incomeModel.create(data);
    }

    static async getById(id){
        return await incomeModel.findOne({_id: id});
    }

    static async getByDateRange(startDate, endDate, id){
        return await incomeModel.find({ date: { $gte: startDate, $lte: endDate }, userId: id });
    }

    static async getByUser(user){
        return await incomeModel.find({ userId: { $in: user } })
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
