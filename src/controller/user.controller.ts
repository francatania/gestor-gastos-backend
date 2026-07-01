import { UserService } from '../services/user.service';
import { RegisterUserDTO } from '../dto/request/register-user.dto.js';
import { Request, Response, NextFunction } from 'express';
import { RequestLoginDTO } from "../dto/request/request-login.dto.js";
import { created, ok } from '../http/responses.js';

export default class UserController{

    constructor(private readonly userService: UserService) {}

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
        const data: RegisterUserDTO = req.body;
        const result = await this.userService.register(data);
        return created(res, result, 'Successfully registered user.');
        } catch (error: any) {
        return next(error);
        }
    };
    

    login = async (req: Request, res: Response, next: NextFunction) =>{

        try {
            const data : RequestLoginDTO = req.body;
            const result = await this.userService.login(data);
            return ok(res, result)
        } catch (error: any) {
            return next(error);
        }
    }

    /*

    static async getUsers(){
        return await UserDao.get();
    }

    static async getUserById(data){
        return UserDao.getById(data);
    }

    static async getUserByEmail(data){
        return UserDao.getByEmail(data);
    }


    static async deleteUsers(){
        return await UserDao.delete();
    }

    static async deleteById(id){
        return await UserDao.deleteById(id);
    }*/
}
