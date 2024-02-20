import mongoose, { Schema } from 'mongoose';

const categoriesSchema = new Schema({
    category: {type: String},
}, {timestamps:true})

export default mongoose.model('categories', categoriesSchema);