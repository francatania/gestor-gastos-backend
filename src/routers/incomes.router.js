import { Router } from 'express';
import IncomeController from '../controller/income.controller.js';
import passport from 'passport';


const router = Router();


// router.get('/incomes', async (req, res)=>{
//     const {id} = req.body;

//     try {
//         const incomes = await IncomeController.getByUser(id);
//         res.status(201).json({list: incomes});
//     } catch (error) {
//         res.status(400).json({message: error.message});
//     }
// })

router.get('/incomes/:id', passport.authenticate('jwt',{session:false} ), async (req, res)=>{
    const id = req.params.id;

    try {
        const incomes = await IncomeController.getIncomesByAccount(id);
        res.status(201).json({list: incomes});
    } catch (error) {
        res.status(400).json({message: error.message});
    }
})

router.get('/incomes-range-date/:id', passport.authenticate('jwt',{session:false} ),  async (req, res)=>{

    const id = req.params.id;
    const startDate = req.query.startDate
    const endDate = req.query.endDate


    try {
        const incomes = await IncomeController.getIncomesByDateRange(startDate, endDate, id);
        res.status(201).json({list: incomes});
    } catch (error) {
        res.status(400).json({message: error.message});
    }
})

router.post('/incomes', async (req, res)=>{
    const {
        accountId,
        category,
        description,
        date,
        amount, 
    } = req.body

    const newIncome = {          
            accountId,
            category,
            description,
            date,
            amount, 
        }

    try {

        await IncomeController.register(newIncome);
        res.status(201).json({message: "Ingreso agregado"})

    } catch (error) {
        res.status(400).json({message: error.message});
    }
})

router.delete('/incomes/:id', async (req, res)=>{
    const id = req.params.id;
    const accountId = req.query.account
    try {
        await IncomeController.deleteIncome(id, accountId);
        res.status(200).json({message:"Ingreso eliminado."})
    } catch (error) {
        res.status(400).json({message: error.message});
    }
})

export default router;