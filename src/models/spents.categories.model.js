import mongoose, { Schema } from 'mongoose';

const spentsCategoriesSchema = new Schema({
    category: {type: String},
}, {timestamps:true})

export default mongoose.model('spentsCategories', spentsCategoriesSchema);