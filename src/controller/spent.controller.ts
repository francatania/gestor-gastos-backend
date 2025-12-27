import SpentDao from "../dao/spent.dao.js";
import { RequestSpentDTO, RequestUpdateSpent } from "../dto/request/spents/request-spent.dto.js";
import { RequestSpentList } from "../dto/request/spents/request-spents-list.js";
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

    getSpentsByDateRange = async (req: Request, res: Response) =>{
        try {   
            const data: RequestSpentList = {
            accountId: req.params.id,
            startDate: req.query.startDate as string,
            endDate: req.query.endDate as string,
            };
            const result = await this.spentService.getSpentsByDateAndAccount(data);
            return res.status(200).json(result);
        } catch (error: any) {
            console.error(error);
             return res.status(400).json({ message: error.message ?? 'Error' });
        }

    }

    getSpentById = async (req: Request, res: Response) =>{
        try {
            const id: string = req.params.id
            const result = await this.spentService.getSpentById(id)
            return res.status(200).json(result);
        } catch (error: any) {
            console.error(error);
             return res.status(400).json({ message: error.message ?? 'Error' });
        }
    }

    updateSpent = async(req: Request, res: Response)=>{
        try {
            const id: string = req.params.id;
            const data: RequestUpdateSpent = req.body;

            const result = await this.spentService.updateSpentById(id, data);
            return res.status(201).json(result);
        } catch (error: any) {
            
            console.error(error);
            return res.status(400).json({ message: error.message ?? 'Error' });
            
        }
    }

    /*static async getSpents(){
        return await SpentDao.get();
    }

    static async getSpentsByAccount(id){
        return await SpentDao.getByAccount(id);
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