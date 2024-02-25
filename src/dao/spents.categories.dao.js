import spentsCategoriesModel from "../models/spents.categories.model.js";;

export default class SpentsCategoriesDao{
    static async create(data){
        return await spentsCategoriesModel.create(data);
    }

    static async get(){
        return await spentsCategoriesModel.find();
    }

    static deleteById(id){
        return spentsCategoriesModel.deleteOne({_id: id});
    }
}