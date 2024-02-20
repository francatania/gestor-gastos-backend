import SpentDao from "../dao/spent.dao.js";
import UserController from "./user.controller.js";

export default class SpentController{

    static async register(data){
        const { 
            userId,
            category,
            description,
            date,
            amount, 
        } = data;
    
        if (
            !userId ||
            !category ||
            !description ||
            !date ||
            !amount
        ) {
            throw new Error("Todos los campos son obligatorios");
        }
    
        try {
            const spent = await SpentDao.create(data); // Crear el ingreso
            const userToUpdate = await UserController.getUserById(userId); // Obtener el usuario
    
            if (!userToUpdate) {
                throw new Error("El usuario no fue encontrado");
            }
    
            userToUpdate.spents.push(spent._id); // Agregar el ID del nuevo ingreso al array de ingresos del usuario
    
            await userToUpdate.save(); // Guardar el usuario con el nuevo ingreso asociado
        } catch (error) {
            // Manejar cualquier error que ocurra durante el proceso
            console.error("Error al registrar el ingreso y actualizar el usuario:", error);
            throw error;
        }
    }

    static async getSpents(){
        return await SpentDao.get();
    }

    static async getSpentsByUser(id){
        return await SpentDao.getByUser(id);
    }   
}