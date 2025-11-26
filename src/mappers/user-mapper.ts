import { ResponseAccountDTO } from "../dto/response/account-created";
import { ResponseUserCreatedDTO } from "../dto/response/user-created.dto";
import { UserDocument } from "../models/user.model";

export class UserMapper{

    static toDto(
        user: UserDocument,
        accounts: ResponseAccountDTO[]
    ): ResponseUserCreatedDTO{

        return{
            id: user._id.toString(),
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            accounts: accounts
        }
    }


}