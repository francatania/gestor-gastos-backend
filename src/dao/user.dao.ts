import { userModel, UserDocument } from '../models/user.model';
import { RegisterUserDTO } from '../dto/register-user.dto.js';
import { createHash } from '../utils.js';

export default class UserDao{
  async create(data: RegisterUserDTO): Promise<UserDocument> {
    return userModel.create({
      ...data,
      password: createHash(data.password),
    });
  }

    async getById(data: string){
        const id = data;
        return await userModel.findOne({_id: id}).populate("accounts")
    }

    async getByEmail(data: string){
        const email = data;
        return await userModel.findOne({email});
    }

    async get(){
        
        return await userModel.find()
    }

    async delete(){
        return userModel.deleteMany();
    }

    async deleteById(id: string){
        return userModel.deleteOne({_id: id});
    }

}
