import UserDao from "../dao/user.dao.js";
import { verifyPassword, tokenGenerator } from "../utils.js"

export default class UserController{

    static async register(data){    
        const {
            first_name, 
            last_name, 
            email, 
            password,
        } = data;
        
        if(
            !first_name ||
            !last_name ||
            !password ||
            !email 
            ){
            throw new Error('Todos los campos son obligatorios')
        }
        
        let user =  await UserDao.getByEmail(email);

        if(user){
            throw new Error('El usuario ya existe.')
        }

        return await UserDao.create(data);
    }

    static async login(data){
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

    static async deleteUsers(){
        return await UserDao.delete();
    }

    static async deleteById(id){
        return await UserDao.deleteById(id);
    }
}