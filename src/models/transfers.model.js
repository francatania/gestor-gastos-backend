import mongoose, { Schema } from 'mongoose';

const transferSchema = new Schema({
    userId : {type: mongoose.Schema.Types.ObjectId, ref: 'users', required:true},
    accountId:{type: mongoose.Schema.Types.ObjectId, ref: 'accounts', required:true},
    fromName:{type: String, required:true},
    to:{type: mongoose.Schema.Types.ObjectId, ref: 'accounts', required:true},
    toName:{type: String, required:true},
    date: {type: Date, required:true},
    amount: {type: Number, required:true},
},{timestamps:true})

export default mongoose.model('transfers', transferSchema);