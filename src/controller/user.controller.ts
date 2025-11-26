import UserDao from "../dao/user.dao.js";
import { verifyPassword, tokenGenerator } from "../utils.js"
import { UserService } from '../services/user.service';
import { RegisterUserDTO } from '../dto/request/register-user.dto.js';
import { Request, Response, NextFunction } from 'express';

export default class UserController{

    constructor(private readonly userService: UserService) {}

    register = async (req: Request, res: Response) => {
        try {
        const data: RegisterUserDTO = req.body;
        const result = await this.userService.register(data);
        return res.status(201).json(result);
        } catch (error: any) {
        console.error(error);
        return res.status(400).json({ message: error.message ?? 'Error creating user' });
        }
    };
    

    /*static async login(data){
        const {email, password} = data;
        if(!email || !password){
            throw new Error('Correo o contraseña invalidos.');
        }
        const user = await UserDao.getByEmail(email);
        if(!user){
            throw new Error('Correo o contraseña invalidos.');}

        const isValidPass = verifyPassword(password, user);

        if(!isValidPass){
            throw new Error('Correo o contraseña invalidos.');}
        return tokenGenerator(user);
    }

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