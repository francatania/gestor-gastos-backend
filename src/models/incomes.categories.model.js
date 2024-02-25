import mongoose, { Schema } from 'mongoose';

const incomesCategoriesSchema = new Schema({
    category: {type: String},
}, {timestamps:true})

export default mongoose.model('incomesCategories', incomesCategoriesSchema);