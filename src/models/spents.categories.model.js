import mongoose, { Schema } from 'mongoose';

const spentsCategoriesSchema = new Schema({
    category: {type: String},
    userId:{type: mongoose.Schema.Types.ObjectId, ref: 'user', required:true}
    
}, {timestamps:true})

export default mongoose.model('spentsCategories', spentsCategoriesSchema);

//accountId:{type: mongoose.Schema.Types.ObjectId, ref: 'accounts', required:true}