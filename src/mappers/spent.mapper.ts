import mongoose from "mongoose";
import { RequestSpentDTO } from "../dto/request/spents/request-spent.dto";
import { SpentDocument, spentModel } from "../models/spent.model.js";
import { ResponseSpentCreated } from "../dto/response/response-dto-created.dto";

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

    static toDto(spentModel: SpentDocument): ResponseSpentCreated{
        return {
            spentId: spentModel._id.toString() ,
            accountId: spentModel.accountId.toString(),
            description: spentModel.description,
            date: spentModel.date.toISOString(),
            amount: spentModel.amount,
        }
    }


}