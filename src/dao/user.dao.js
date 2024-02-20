import userModel from "../models/user.model.js";
import { createHash } from '../utils.js';

export default class UserDao{
    static create(data){
        const {
            first_name,
            last_name,
            password,
            email, 
        } = data

        return  userModel.create({
            first_name,
            last_name,
            password: createHash(password),
            email, 
        });
    }

    static async getById(data){
        const id = data;
        return await userModel.findOne({_id: id}).populate('incomes spents');
    }

    static async getByEmail(data){
        const email = data;
        return await userModel.findOne({email});
    }

    static async get(){
        
        return await userModel.find().populate('incomes spents');
    }

    static delete(){
        return userModel.deleteMany();
    }

    static deleteById(id){
        return userModel.deleteOne({_id: id});
    }

}
