import AccountDao from "../dao/account.dao.js";
import UserController from "../controller/user.controller.js";

export default class AccountController{

    static async create(data){    
        const {
            accountName,
            userId
        } = data;
        
        if(
            !accountName ||
            !userId
            ){
            throw new Error('Todos los campos son obligatorios')
        }
        
        let account =  await AccountDao.getByName(accountName, userId);

        if(account){
            throw new Error('La cuenta ya existe.')
        }

        try {
            const account = await AccountDao.create(data); // Crear el ingreso
            const userToUpdate = await UserController.getUserById(userId); // Obtener el usuario
    
            if (!userToUpdate) {
                throw new Error("El usuario no fue encontrado");
            }
    
            userToUpdate.accounts.push(account._id); // Agregar el ID del nuevo ingreso al array de ingresos del usuario
    
            await userToUpdate.save(); // Guardar el usuario con el nuevo ingreso asociado
        } catch (error) {
            // Manejar cualquier error que ocurra durante el proceso
            console.error("Error al registrar la cuenta", error);
            throw error;
        }

    }


    static async getAccountById(id){
        return AccountDao.getById(id);
    }


    static async deleteById(id){
        return await AccountDao.deleteById(id);
    }
}