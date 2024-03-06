import mongoose, { Schema } from 'mongoose';

const accountSchema = new Schema({
  accountName: {type: String, required: true},
  userId:{type: mongoose.Schema.Types.ObjectId, ref: 'users', required:true},
  incomes: [{type: mongoose.Schema.Types.ObjectId, ref: 'incomes', default: []}],
  spents: [{type: mongoose.Schema.Types.ObjectId, ref: 'spents', default: []}],
  transfers:[{type: mongoose.Schema.Types.ObjectId, ref: 'transfers', default: []}],
}, { timestamps: true });

export default mongoose.model('accounts', accountSchema);