import mongoose, { Schema, InferSchemaType, Model, Types } from 'mongoose';

export interface Account {
  _id: Types.ObjectId;
  accountName: string;
  userId: Types.ObjectId;
  incomes: Types.ObjectId[];
  spents: Types.ObjectId[];
  transfers: Types.ObjectId[];
  createdAt: Date; 
  updatedAt: Date; 
}

const accountSchema = new Schema<Account>({
  accountName: {type: String, required: true},
  userId:{type: mongoose.Schema.Types.ObjectId, ref: 'users', required:true},
  incomes: [{type: mongoose.Schema.Types.ObjectId, ref: 'incomes', default: []}],
  spents: [{type: mongoose.Schema.Types.ObjectId, ref: 'spents', default: []}],
  transfers:[{type: mongoose.Schema.Types.ObjectId, ref: 'transfers', default: []}],
}, { timestamps: true });


export type AccountDocument = InferSchemaType<typeof accountSchema>;

export const accountModel: Model<AccountDocument> = mongoose.model('accounts', accountSchema);