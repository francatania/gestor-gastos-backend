import IncomesCategoriesDao from "../dao/incomes.categories.dao.js";

export default class IncomesCategoriesController{

    static async getCategories(){
        return await IncomesCategoriesDao.get();
    }

    static async createCategory(data){
        return await IncomesCategoriesDao.create(data);
    }

    static async deleteCategoriesById(id){
        return await IncomesCategoriesDao.deleteById(id);
    }
}