import SpentsCategoriesDao from "../dao/spents.categories.dao.js";

export default class SpentsCategoriesController{

    static async getCategories(){
        return await SpentsCategoriesDao.get();
    }

    static async createCategory(data){
        return await SpentsCategoriesDao.create(data);
    }

    static async deleteCategoriesById(id){
        return await SpentsCategoriesDao.deleteById(id);
    }
}