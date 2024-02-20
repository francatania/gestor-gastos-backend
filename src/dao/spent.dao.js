import spentModel from "../models/spent.model.js";

export default class SpentDao{
    static async create(data){
        return await spentModel.create(data);
    }

    static async get(){
        return await spentModel.find();
    }

    static async getById(id){
        return await spentModel.findOne({_id: id});
    }

    static async getByUser(user){
        return await spentModel.find({ userId: { $in: user } })
    }
    
    static delete(){
        return spentModel.deleteMany();
    }

    static deleteById(id){
        return spentModel.deleteOne({_id: id});
    }
}