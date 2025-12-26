import mongoose from "mongoose";
import { RequestSpentDTO } from "../dto/request/spents/request-spent.dto";
import { SpentDocument, spentModel } from "../models/spent.model.js";
import { BaseResponseSpent, ResponseSpentDetail, ResponseSpentList } from "../dto/response/spents/response-spent.dto";
import { SpentLean } from "../dto/types/spents.types";

export class SpentMapper{

    static toModel(spent: RequestSpentDTO): SpentDocument {
        return new spentModel({
            accountId: new mongoose.Types.ObjectId(spent.accountId),
            category: spent.category ?? undefined,
            categoryId: spent.categoryId
                            ? new mongoose.Types.ObjectId(spent.categoryId)
                            : undefined,
            description: spent.description,
            date: new Date(spent.date),
            amount: spent.amount,
        });
    }

    static toBaseDto(spentModel: SpentLean): BaseResponseSpent{
        return {
                spentId: spentModel._id.toString(),
                description: spentModel.description,
                date: spentModel.date.toISOString(),
                amount: spentModel.amount,
        }
    }

    static toListDto(spentModel: SpentLean): ResponseSpentList{
                
        return {
            ...this.toBaseDto(spentModel),
             account: typeof spentModel.accountId === 'object'
                        ? spentModel.accountId.accountName
                        : '',
            category: typeof spentModel.categoryId === 'object'
                        ? spentModel.categoryId.category
                        : undefined,
        }

    }

    static toDetailDto(spentModel: SpentLean): ResponseSpentDetail{
        return {
            ...this.toBaseDto(spentModel),
            account: spentModel.accountId,
            category: spentModel.categoryId,
        }
    }

}