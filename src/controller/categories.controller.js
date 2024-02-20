import CategoriesDao from "../dao/categories.dao.js";

export default class CategoriesController{

    static async getCategories(){
        return await CategoriesDao.get();
    }

    static async createCategory(data){
        return await CategoriesDao.create(data);
    }

    static async deleteCategoriesById(id){
        return await CategoriesDao.deleteById(id);
    }
}