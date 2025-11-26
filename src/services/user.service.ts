import { RegisterUserDTO } from '../dto/request/register-user.dto';
import UserDao from '../dao/user.dao.js'; 
import { UserDocument } from '../models/user.model';
import { RequestAccountDTO } from '../dto/request/request-account.dto';
import { AccountService } from './account.service';
import { ResponseUserCreatedDTO } from '../dto/response/user-created.dto';
import { AccountDocument } from '../models/accounts.model';
import { ResponseAccountDTO } from '../dto/response/account-created';
import { AccountMapper } from '../mappers/account.mapper.js';
import { UserMapper } from '../mappers/user-mapper.js';

export class UserService {
  constructor(private readonly userDao: UserDao, 
    private readonly accountService: AccountService) {}

  async register(data: RegisterUserDTO): Promise<ResponseUserCreatedDTO> {
    const {
      first_name,
      last_name,
      email,
      password,
    } = data;

    if (!first_name || !last_name || !email || !password) {
      throw new Error('All fields are required.');
    }
    const existingUser: UserDocument | null = await this.userDao.getByEmail(email);

    if (existingUser) {
      throw new Error('User already exists.');
    }

    let user: UserDocument | null = null;

    try {
          user = await this.userDao.create(data);

          const firstAccount: RequestAccountDTO = {
                accountName: process.env.ACCOUNT_1,
                userId: user._id.toString()
              }
          
          const secondAccount: RequestAccountDTO = {
                accountName: process.env.ACCOUNT_2,
                userId: user._id.toString()
              }


          const createdAccounts = await Promise.all([
            this.accountService.create(firstAccount),
            this.accountService.create(secondAccount),
          ]);

          const accounts: ResponseAccountDTO[] = createdAccounts.map(AccountMapper.toDto);

          return UserMapper.toDto(user, accounts);

    } catch (error) {
        user ? await this.userDao.deleteById(user._id.toString()) : null;  
        console.error("There was an error in the user creation.", error);
        throw error;
    }

  }
}