import mongoose, {
  HydratedDocument,
  InferSchemaType,
  Model,
  Schema,
} from 'mongoose';

const incomeSchema = new Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'accounts',
    required: true,
  },
  category: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
}, { timestamps: true });

export type Income = InferSchemaType<typeof incomeSchema>;

export type IncomeDocument = HydratedDocument<Income>;

export const incomeModel: Model<Income> = mongoose.model<Income>('incomes', incomeSchema);
