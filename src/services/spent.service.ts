import mongoose from "mongoose";
import SpentDao from "../dao/spent.dao";
import { RequestSpentDTO, RequestUpdateSpent } from "../dto/request/spents/request-spent.dto";
import { RequestSpentList } from "../dto/request/spents/request-spents-list";
import { BaseResponseSpent, ResponseSpentDetail, ResponseSpentList } from "../dto/response/spents/response-spent.dto";
import { SpentMapper } from "../mappers/spent.mapper.js";
import { SpentDocument } from "../models/spent.model.js";

export class SpentService{
    constructor (private readonly spentDao: SpentDao){}

    async createSpent(spent: RequestSpentDTO): Promise<BaseResponseSpent> {
        if(!spent.accountId || !spent.amount || !spent.categoryId){
            throw new Error('There are some fields missing.')
        }

        try {
            const document: SpentDocument = SpentMapper.toModel(spent);

            const result = await this.spentDao.create(document);
            return SpentMapper.toBaseDto(result);
        } catch (error: any) {
            console.error('Could not save the spent.',error);
             throw error;
        }

    }

    async getSpentsByDateAndAccount(requestSpentList: RequestSpentList) :Promise<ResponseSpentList[]> {
        if(!requestSpentList.accountId || !requestSpentList.startDate || !requestSpentList.endDate){
            throw new Error('There are some fields missing.')
        }

        const { accountId, startDate, endDate} = requestSpentList;

        try {
            const list = await this.spentDao.getByDateRangeAndAccount(startDate, endDate, accountId);
             
               if (!list || list.length === 0) {
                    throw new Error('There are no spents.');
                }

            const result: ResponseSpentList[] = list.map(x => SpentMapper.toListDto(x))
            return result;
        } catch (error) {
             console.error('Error while retrieving the spents',error);
             throw error;
        }
    }

    async getSpentById(spentId: string): Promise<ResponseSpentDetail>{
        try {
            const spent = await this.spentDao.getById(spentId);
            if(spent == null){
                throw new Error('Could not find the spent.');
            }
            return SpentMapper.toDetailDto(spent);
        } catch (error) {
            console.error('Error while retrieving the spents',error);
             throw error;
        }
    }

    async updateSpentById(spentId: string, data: RequestUpdateSpent){
        try {


            const updatedData: Partial<SpentDocument> = {
                accountId: data.accountId ?  
                new mongoose.Types.ObjectId(data.accountId)
                : undefined,
                amount: data.amount ? data.amount : undefined,
                categoryId: data.categoryId ? 
                new mongoose.Types.ObjectId(data.categoryId)
                : undefined,
                description: data.description ? data.description : undefined              
            }

            const result = await this.spentDao.findByIdAndUpdate(spentId, updatedData);
            if(result == null){
                throw new Error('Could not find the spent.');
            }
            return SpentMapper.toDetailDto(result);
        } catch (error) {
            console.error('Error while updating the spents',error);
             throw error;
        }
    }
}