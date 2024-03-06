import spentModel from "../models/spent.model.js";

export default class SpentDao{
    static async create(data){
        return await spentModel.create(data);
    }

    static async get(){
        return await spentModel.find();
    }

    static async getByDateRange(startDate, endDate, id){
        
        return await spentModel.find({ date: { $gte: startDate, $lte: endDate }, accountId: id });
    }


    static async getById(id){
        return await spentModel.findOne({_id: id});
    }

    static async getByAccount(id){
        return await spentModel.find({ accountId: { $in: id } })
    }
    
    static delete(){
        return spentModel.deleteMany();
    }

    static deleteById(id){
        return spentModel.deleteOne({_id: id});
    }
}