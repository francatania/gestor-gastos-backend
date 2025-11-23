import UserDao from "../dao/user.dao.js";
import { verifyPassword, tokenGenerator } from "../utils.js"
import { UserService } from '../services/user.service';
import { RegisterUserDTO } from '../dto/register-user.dto';
import { Request, Response, NextFunction } from 'express';

export default class UserController{

    constructor(private readonly userService: UserService) {}

    async register(req: Request, res: Response, next: NextFunction){    
        try {
            const data = req.body as RegisterUserDTO;

            const user = await this.userService.register(data);

            return res.status(201).json({
                message: 'Successfully registered user.',
                user,
            });
            } catch (error) {
            next(error);
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