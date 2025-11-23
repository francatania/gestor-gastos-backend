import { RegisterUserDTO } from '../dto/register-user.dto';
import UserDao from '../dao/user.dao.js'; 
import { UserDocument } from '../models/user.model';

export class UserService {
  constructor(private readonly userDao: UserDao) {}

  async register(data: RegisterUserDTO): Promise<UserDocument> {
    const {
      first_name,
      last_name,
      email,
      password,
    } = data;

    if (!first_name || !last_name || !email || !password) {
      throw new Error('All fields are required.');
    }
    const existingUser = await this.userDao.getByEmail(email);

    if (existingUser) {
      throw new Error('User already exists.');
    }
    const user = await this.userDao.create(data);
    return user;
  }
}