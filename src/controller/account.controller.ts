import { AccountService } from "../services/account.service.js";
import UserController from "./user.controller.js";
import { RequestAccountDTO } from "../dto/request/request-account.dto.js";
import { Request, Response, NextFunction } from 'express';

export default class AccountController{
    constructor(private readonly accountService: AccountService) {}

    async create(req: Request, res: Response, next: NextFunction){    

        try {
            const data = req.body as RequestAccountDTO;

            const user = await this.accountService.create(data);

            return res.status(201).json({
                message: 'Successfully created account.',
                user,
            });
            } catch (error) {
            next(error);
            }
        
    }


    /*static async getAccountById(id){
        return AccountDao.getById(id);
    }


    static async deleteById(id){
        return await AccountDao.deleteById(id);
    }*/
}