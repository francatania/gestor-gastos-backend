import incomeModel from "../models/income.model.js";


export default class IncomeDAO{
    static create(data){
        return incomeModel.create(data);
    }

    static async getById(id){
        return await incomeModel.findOne({_id: id});
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
