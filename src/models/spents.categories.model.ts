import mongoose, {
  HydratedDocument,
  InferSchemaType,
  Model,
  Schema,
} from 'mongoose';

const spentsCategoriesSchema = new Schema({
  category: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
}, { timestamps: true });

export type SpentsCategory = InferSchemaType<typeof spentsCategoriesSchema>;

export type SpentsCategoryDocument = HydratedDocument<SpentsCategory>;

export const spentsCategoriesModel: Model<SpentsCategory> =
  mongoose.model<SpentsCategory>('spentsCategories', spentsCategoriesSchema);
