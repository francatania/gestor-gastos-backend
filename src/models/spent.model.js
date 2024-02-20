import mongoose, { Schema } from 'mongoose';

const spentSchema = new Schema({
    userId:{type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    category: {type: String},
    description: {type: String},
    date: {type: Date},
    amount: {type: Number},
},{timestamps:true})

export default mongoose.model('spents', spentSchema);