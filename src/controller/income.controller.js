import IncomeDAO from "../dao/income.dao.js";
import AccountController from "./account.controller.js";

export default class IncomeController{

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
            const income = await IncomeDAO.create(data); 
            const accountToUpdate = await AccountController.getAccountById(accountId); 
    
            if (!accountToUpdate) {
                throw new Error("La cuenta no fue encontrado");
            }
    
            accountToUpdate.incomes.push(income._id); 
    
            await accountToUpdate.save(); 
        } catch (error) {
            
            console.error("Error al registrar el ingreso y actualizar el usuario:", error);
            throw error;
        }
    }

    static async getIncomesByAccount(id){
        return await IncomeDAO.getByAccount(id);
    }   

    static async getIncomesByDateRange(start, end, id){
        return await IncomeDAO.getByDateRange(start, end, id);
    }
    
    
    static async deleteIncome(id, accountId){
        try {
            const accountToUpdate = await AccountController.getAccountById(accountId);
            accountToUpdate.incomes = accountToUpdate.incomes.filter(income => income.value !== id);
            await accountToUpdate.save()
            await IncomeDAO.deleteById(id);
        } catch (error) {
            console.log(error);
            throw Error(error);
        }
    }

}