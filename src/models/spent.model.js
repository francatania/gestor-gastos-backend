import mongoose, { Schema } from 'mongoose';

const spentSchema = new Schema({
    accountId:{type: mongoose.Schema.Types.ObjectId, ref: 'accounts', required:true},
    category: {type: String, required:true},
    description: {type: String, required:true},
    date: {type: Date, required:true},
    amount: {type: Number, required:true},
},{timestamps:true})

export default mongoose.model('spents', spentSchema);