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
            const account = await AccountDao.create(data); 
            const userToUpdate = await UserController.getUserById(userId); 
    
            if (!userToUpdate) {
                throw new Error("El usuario no fue encontrado");
            }
    
            userToUpdate.accounts.push(account._id); 
    
            await userToUpdate.save(); 
        } catch (error) {
    
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