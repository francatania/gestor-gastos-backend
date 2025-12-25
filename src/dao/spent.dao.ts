import { RequestSpentDTO } from "../dto/request/spents/request-spent.dto.js";
import {spentModel, SpentDocument} from "../models/spent.model.js";

export default class SpentDao{
    async create(doc: SpentDocument): Promise<SpentDocument>{
       return await doc.save();
    }

    async get(){
        return await spentModel.find();
    }

    async getByDateRangeAndAccount(startDate: string, endDate: string, id: string): Promise<SpentDocument[] | null>{
        
        return await spentModel.find({ date: { $gte: startDate, $lte: endDate }, accountId: id });
    }

    async getById(id: string): Promise<SpentDocument | null>{
        return await spentModel.findOne({_id: id});
    }

    async getByAccount(accountId: string): Promise<SpentDocument[] | []>{
        return await spentModel.find({ accountId: { $in: accountId } })
    }
    
    async delete(){
        return spentModel.deleteMany();
    }

    async deleteById(id: string){
        return spentModel.deleteOne({_id: id});
    }
}