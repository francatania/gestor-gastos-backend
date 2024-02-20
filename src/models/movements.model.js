import mongoose, { Schema } from 'mongoose';

const incomesMovementsSchema = new Schema({
    income: {type: mongoose.Schema.Types.ObjectId, ref: 'incomes'},

}, {_id: false})

const spentMovementsSchema = new Schema({
    income: {type: mongoose.Schema.Types.ObjectId, ref: 'spents'},

}, {_id: false})


const movementSchema = new Schema({
    idUser: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required:true},
    incomes: {type: [incomesMovementsSchema], default: []},
    outcomes: {type: [spentMovementsSchema], default: []}
})

export default mongoose.model('movements', movementSchema);