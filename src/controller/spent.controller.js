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
            const spent = await SpentDao.create(data); // Crear el ingreso
            const accountToUpdate = await AccountController.getAccountById(accountId); // Obtener la cuenta
    
            if (!accountToUpdate) {
                throw new Error("La cuenta no fue encontrado");
            }
    
            accountToUpdate.spents.push(spent._id); // Agregar el ID del nuevo gasto al array de gastos del usuario
    
            await accountToUpdate.save(); // Guardar la cuenta con el nuevo ingreso asociado
        } catch (error) {
            // Manejar cualquier error que ocurra durante el proceso
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
}