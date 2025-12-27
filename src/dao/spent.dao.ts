import { RequestSpentDTO } from "../dto/request/spents/request-spent.dto.js";
import { SpentLean } from "../dto/types/spents.types.js";
import {spentModel, SpentDocument} from "../models/spent.model.js";

export default class SpentDao{
    async create(doc: SpentDocument): Promise<SpentDocument>{
       return await doc.save();
    }

    async get(){
        return await spentModel.find();
    }

    async getByDateRangeAndAccount(startDate: string, endDate: string, id: string): Promise<SpentLean[] | []>{
        
        return await spentModel.find({ date: { $gte: startDate, $lte: endDate }, accountId: id })    
        .populate('accountId', 'accountName')      
        .populate('categoryId', 'category')
        .lean();
    }

    async getById(id: string): Promise<SpentLean | null>{
        return await spentModel.findOne({_id: id})        
        .populate('accountId', 'accountName')      
        .populate('categoryId', 'category')
        .lean();
    }

    async getByAccount(accountId: string): Promise<SpentDocument[] | []>{
        return await spentModel.find({ accountId: { $in: accountId } })
    }

    async findByIdAndUpdate(spentId: string, data: Partial<SpentDocument>): Promise<SpentLean | null>{
        return await spentModel.findByIdAndUpdate(
            spentId,
            { $set: data },
            { new: true }
        )        
        .populate('accountId', 'accountName')      
        .populate('categoryId', 'category')
        .lean()
    }
    

    async deleteById(id: string){
        return spentModel.deleteOne({_id: id});
    }
}