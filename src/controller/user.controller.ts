import UserDao from "../dao/user.dao.js";
import { verifyPassword, tokenGenerator } from "../utils.js"
import { UserService } from '../services/user.service';
import { RegisterUserDTO } from '../dto/request/register-user.dto.js';
import { Request, Response, NextFunction } from 'express';
import { RequestLoginDTO } from "../dto/request/request-login.dto.js";

export default class UserController{

    constructor(private readonly userService: UserService) {}

    register = async (req: Request, res: Response) => {
        try {
        const data: RegisterUserDTO = req.body;
        const result = await this.userService.register(data);
        return res.status(201).json(result);
        } catch (error: any) {
        console.error(error);
        return res.status(400).json({ message: error.message ?? 'Error creating user.' });
        }
    };
    

    login = async (req: Request, res: Response) =>{

        try {
            const data : RequestLoginDTO = req.body;
            const result = await this.userService.login(data);
            return res.status(200).json(result)
        } catch (error: any) {
            console.error(error);
            return res.status(400).json({ message: error.message ?? 'Login error.' });
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