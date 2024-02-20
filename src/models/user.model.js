import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: {type: String, required: true},
  incomes: [{type: mongoose.Schema.Types.ObjectId, ref: 'incomes', default: []}],
  spents: [{type: mongoose.Schema.Types.ObjectId, ref: 'spents', default: []}],
  money: {type: Number, default: 0}
}, { timestamps: true });

export default mongoose.model('users', userSchema);