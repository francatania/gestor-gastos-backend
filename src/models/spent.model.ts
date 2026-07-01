import mongoose, {
  HydratedDocument,
  InferSchemaType,
  Model,
  Schema,
} from 'mongoose';

const spentSchema = new Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'accounts',
    required: true,
  },
  category: { type: String },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'spentsCategories',
  },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
}, { timestamps: true });

export type Spent = InferSchemaType<typeof spentSchema>;

export type SpentDocument = HydratedDocument<Spent>;

export const spentModel: Model<Spent> = mongoose.model<Spent>('spents', spentSchema);
