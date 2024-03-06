import TransferDao from "../dao/transfers.dao.js";
import AccountController from "./account.controller.js";


export default class TransferController{

    static async getTransfers(){
        return await TransferDao.get();
    }

    static async createTransfer(data){
        const {
            userId,
            accountId,
            to,
            date,
            amount
        } = data;

        if(
            !userId||
            !accountId ||
            !to ||
            !date ||
            !amount
        ){
            throw new Error("Todos los campos son obligatorios");
        }

        try {
            const transfer = await TransferDao.create(data); 
            const accountToUpdate1 = await AccountController.getAccountById(accountId);
            const accountToUpdate2 = await AccountController.getAccountById(to); 
 
    
            if (!accountToUpdate1 || !accountToUpdate2) {
                throw new Error("La cuenta no fue encontrado");
            }
    
            accountToUpdate1.transfers.push(transfer._id);
            accountToUpdate2.transfers.push(transfer._id); 
 
    
            await accountToUpdate1.save();
            await accountToUpdate2.save();  
        } catch (error) {
            // Manejar cualquier error que ocurra durante el proceso
            console.error("Error al registrar la transferencia y actualizar la cuenta:", error);
            throw error;
        }
    }

    static async getTransfersByUser(id){
        return await TransferDao.getByUserId(id);
    }

    static async getTransfersByAccount(id){
        return await TransferDao.getByAccount(id);
    }

    static async getTransfersByDate(startDate, enDate, id){
        return await TransferDao.getByDateRange(startDate, enDate, id);
    }
    
    // static async getSpentsByDateRange(start, end, id){
    //     return await SpentDao.getByDateRange(start, end, id);
    // }
}