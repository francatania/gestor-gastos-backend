import mongoose, { Schema } from 'mongoose';

const incomeSchema = new Schema({
    accountId:{type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    category: {type: String},
    description: {type: String},
    date: {type: Date},
    amount: {type: Number},
}, {timestamps:true})

export default mongoose.model('incomes', incomeSchema);