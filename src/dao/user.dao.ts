import { userModel, UserDocument } from '../models/user.model.js';
import { RegisterUserDTO } from '../dto/request/register-user.dto.js';
import { createHash } from '../utils.js';

export default class UserDao{
  async create(data: RegisterUserDTO): Promise<UserDocument> {
    return userModel.create({
      ...data,
      password: createHash(data.password),
    });
  }

    async getById(id: string): Promise<UserDocument | null> {
        return await userModel.findOne({_id: id}).populate("accounts")
    }

    async getByEmail(email: string): Promise<UserDocument | null>{
        return await userModel.findOne({email});
    }

    async get(): Promise<UserDocument[] | null>{
        return await userModel.find()
    }

    async delete(){
        return userModel.deleteMany();
    }

    async deleteById(id: string){
        return userModel.deleteOne({_id: id});
    }

}
