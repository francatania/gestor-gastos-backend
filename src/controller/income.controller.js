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
            const income = await IncomeDAO.create(data); // Crear el ingreso
            const accountToUpdate = await AccountController.getAccountById(accountId); // Obtener la cuenta
    
            if (!accountToUpdate) {
                throw new Error("La cuenta no fue encontrado");
            }
    
            accountToUpdate.incomes.push(income._id); // Agregar el ID del nuevo ingreso al array de ingresos del usuario
    
            await accountToUpdate.save(); // Guardar el usuario con el nuevo ingreso asociado
        } catch (error) {
            // Manejar cualquier error que ocurra durante el proceso
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
    

}