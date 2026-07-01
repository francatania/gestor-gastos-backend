import {
  HydratedDocument,
  InferSchemaType,
  Model,
  Schema,
  model,
} from 'mongoose';

const incomesCategoriesSchema = new Schema({
  category: { type: String, required: true },
}, { timestamps: true });

export type IncomesCategory = InferSchemaType<typeof incomesCategoriesSchema>;

export type IncomesCategoryDocument = HydratedDocument<IncomesCategory>;

export const incomesCategoriesModel: Model<IncomesCategory> =
  model<IncomesCategory>('incomesCategories', incomesCategoriesSchema);
