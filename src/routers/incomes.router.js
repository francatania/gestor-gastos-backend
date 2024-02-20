import { Router } from 'express';
import IncomeController from '../controller/income.controller.js';

const router = Router();


router.get('/incomes', async (req, res)=>{
    const {id} = req.body;

    try {
        const incomes = await IncomeController.getByUser(id);
        res.status(201).json({list: incomes});
    } catch (error) {
        res.status(400).json({message: error.message});
    }
})

router.post('/incomes', async (req, res)=>{
    const {
        userId,
        category,
        description,
        date,
        amount, 
    } = req.body

    const newIncome = {          
            userId,
            category,
            description,
            date,
            amount, 
        }

    try {

        await IncomeController.register(newIncome);
        res.status(201).json({message: "Ingreso agredado"})

    } catch (error) {
        res.status(400).json({message: error.message});
    }
})

export default router;