import SpentDao from "../dao/spent.dao";
import { RequestSpentDTO } from "../dto/request/request-spent.dto";
import { ResponseSpentCreated } from "../dto/response/response-dto-created.dto";
import { SpentMapper } from "../mappers/spent.mapper.js";
import { SpentDocument } from "../models/spent.model.js";

export class SpentService{
    constructor (private readonly spentDao: SpentDao){}

    async createSpent(spent: RequestSpentDTO): Promise<ResponseSpentCreated> {
        if(!spent.accountId || !spent.amount || !spent.categoryId){
            throw new Error('There are some fields missing.')
        }

        try {
            const document: SpentDocument = SpentMapper.toModel(spent);

            const result = await this.spentDao.create(document);
            return SpentMapper.toDto(result);
        } catch (error: any) {
            console.error('Could not save the spent.',error);
             throw error;
        }

    }
}