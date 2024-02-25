import incomesCategoriesModel from "../models/incomes.categories.model.js";;

export default class incomesCategoriesDao{
    static async create(data){
        return await incomesCategoriesModel.create(data);
    }

    static async get(){
        return await incomesCategoriesModel.find();
    }

    static deleteById(id){
        return incomesCategoriesModel.deleteOne({_id: id});
    }
}