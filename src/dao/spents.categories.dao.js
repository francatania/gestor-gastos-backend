import spentsCategoriesModel from "../models/spents.categories.model.js";
import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;


export default class SpentsCategoriesDao{
    static async create(data){
        return await spentsCategoriesModel.create(data);
    }

    static async get(){
        return await spentsCategoriesModel.find();
    }

    static async getByAccountId(id) {
        
        return await spentsCategoriesModel.find({
            $or: [
                { userId: id },
                { userId: { $exists: false } }
            ]
        });
    }

    static deleteById(id){
        return spentsCategoriesModel.deleteOne({_id: id});
    }
}