import SpentDao from "../dao/spent.dao";
import { RequestSpentDTO } from "../dto/request/spents/request-spent.dto";
import { RequestSpentList } from "../dto/request/spents/request-spents-list";
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

    async getSpentsByDateAndAccount(requestSpentList: RequestSpentList) :Promise<ResponseSpentCreated[]> {
        if(!requestSpentList.accountId || !requestSpentList.startDate || !requestSpentList.endDate){
            throw new Error('There are some fields missing.')
        }

        const { accountId, startDate, endDate} = requestSpentList;

        try {
            const list = await this.spentDao.getByDateRangeAndAccount(startDate, endDate, accountId);
             
               if (!list || list.length === 0) {
                    throw new Error('There are no spents.');
                }

            const result: ResponseSpentCreated[] = list.map(x => SpentMapper.toDto(x))
            return result;
        } catch (error) {
             console.error('Error while retrieving the spents',error);
             throw error;
        }
    }
}