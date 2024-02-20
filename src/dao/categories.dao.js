import categoriesModel from "../models/categories.model.js";;

export default class CategoriesDao{
    static async create(data){
        return await categoriesModel.create(data);
    }

    static async get(){
        return await categoriesModel.find();
    }

    static deleteById(id){
        return categoriesModel.deleteOne({_id: id});
    }
}