import mongoose, {
  Schema,
  InferSchemaType,
  Model,
  HydratedDocument,
} from 'mongoose';

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


export type User = InferSchemaType<typeof userSchema>;

export type UserDocument = HydratedDocument<User>;

export const userModel: Model<User> = mongoose.model<User>('users', userSchema);