import transfers from "../models/transfers.model.js";

export default class TransferDao{
    static async create(data){
        return await transfers.create(data);
    }

    static async get(){
        return await transfers.find();
    }

    static async getByDateRange(startDate, endDate, id){
        // console.log(startDate, endDate, id)
        return await transfers.find({ date: { $gte: startDate, $lte: endDate }, accountId: id });
    }


    static async getById(id){
        return await transfers.findOne({_id: id});
    }

    static async getByUserId(id){
        return await transfers.find({userId: id});
    }
        

    static async getByAccount(account){
        return await transfers.find({ accountId: account  })
    }
    
    static delete(){
        return transfers.deleteMany();
    }

    static deleteById(id){
        return outgoingTransfer.deleteOne({_id: id});
    }
}