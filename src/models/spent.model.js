import mongoose, { Schema } from 'mongoose';

const spentSchema = new Schema({
    userId:{type: mongoose.Schema.Types.ObjectId, ref: 'users', required:true},
    category: {type: String, required:true},
    description: {type: String, required:true},
    date: {type: Date, required:true},
    amount: {type: Number, required:true},
},{timestamps:true})

export default mongoose.model('spents', spentSchema);