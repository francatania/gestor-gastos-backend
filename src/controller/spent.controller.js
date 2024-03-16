import SpentDao from "../dao/spent.dao.js";
import AccountController from "./account.controller.js";

export default class SpentController{

    static async register(data){
        const { 
            accountId,
            category,
            description,
            date,
            amount, 
        } = data;
    
        if (
            !accountId ||
            !category ||
            !description ||
            !date ||
            !amount
        ) {
            throw new Error("Todos los campos son obligatorios");
        }
    
        try {
            const spent = await SpentDao.create(data); 
            const accountToUpdate = await AccountController.getAccountById(accountId); 
    
            if (!accountToUpdate) {
                throw new Error("La cuenta no fue encontrado");
            }
    
            accountToUpdate.spents.push(spent._id); 
    
            await accountToUpdate.save(); 
        } catch (error) {
            
            console.error("Error al registrar el gasto y actualizar la cuenta:", error);
            throw error;
        }
    }

    static async getSpents(){
        return await SpentDao.get();
    }

    static async getSpentsByAccount(id){
        return await SpentDao.getByAccount(id);
    }
    
    static async getSpentsByDateRange(start, end, id){
        return await SpentDao.getByDateRange(start, end, id);
    }

    static async deleteSpent(id, accountId){
        try {
            const accountToUpdate = await AccountController.getAccountById(accountId);
            accountToUpdate.spents = accountToUpdate.spents.filter(spent => spent.value !== id);
            await accountToUpdate.save()
            await SpentDao.deleteById(id);
        } catch (error) {
            console.log(error);
            throw Error(error);
        }
    }
}