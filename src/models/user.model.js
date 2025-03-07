import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: {type: String, required: true},
  accounts: [{type: mongoose.Schema.Types.ObjectId, ref: 'accounts', default: []}]
}, { timestamps: true });

export default mongoose.model('users', userSchema);