import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';
import config from './config/config.js';
import {ResponseLoginDTO} from './dto/response/response-login.js'
import { RequestLoginDTO } from './dto/request/user/request-login.dto.js';
import { UserDocument } from './models/user.model.js';

const __filename = fileURLToPath(import.meta.url);

export const __dirname = path.dirname(__filename);

export const createHash = (password: string) => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const verifyPassword = (password: string, user: RequestLoginDTO) => bcrypt.compareSync(password, user.password);

export const JWT_SECRET = config.JWT_SECRET;

export const tokenGenerator = (user: UserDocument): ResponseLoginDTO=>{
    const {
        _id: id,
        first_name,
        last_name,
        email,
        accounts

    } = user;

    const payload = {        
        _id: id,
        first_name,
        last_name,
        accounts,
        email
    }

    const token = JWT.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    return { accessToken: token };
}
