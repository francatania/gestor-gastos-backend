import mongoose, { Schema, InferSchemaType, Model } from 'mongoose';

const userSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  accounts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'accounts',
      default: [],
    },
  ],
}, { timestamps: true });

/**
 * InferSchemaType converts schema into ts' type:
 * {
 *   first_name: string;
 *   last_name: string;
 *   email: string; 
 *   password: string;
 *   accounts: Types.ObjectId[];
 *   createdAt: Date;
 *   updatedAt: Date;
 * }
 */
export type UserDocument = InferSchemaType<typeof userSchema>;

export const userModel: Model<UserDocument> = mongoose.model('users', userSchema);