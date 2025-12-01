import SpentDao from "../dao/spent.dao.js";
import { RequestSpentDTO } from "../dto/request/request-spent.dto.js";
import { SpentService } from "../services/spent.service.js";
import AccountController from "./account.controller.js";
import { Request, Response } from 'express';

export default class SpentController{
    constructor(private readonly spentService: SpentService){}

    createSpent = async (req: Request, res: Response)=>{
        try {
            const data: RequestSpentDTO = req.body;
            const result = await this.spentService.createSpent(data);
            return res.status(201).json(result);
        } catch (error: any) {
            console.error(error);
             return res.status(400).json({ message: error.message ?? 'Error creating spent.' });
        }
    }


    /*static async getSpents(){
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
    }*/
}