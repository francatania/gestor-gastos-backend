import { Router } from 'express';
import IncomesCategoriesController from '../controller/incomes.categories.controller.js';

const router = Router();

router.get('/incomes-categories', async (req, res)=>{
    try {
        const categories = await IncomesCategoriesController.getCategories();
        res.status(200).json({categories: categories});
    } catch (error) {
        res.status(400).json({message: error.message});
    }
})

router.post('/incomes-categories', async (req, res)=>{
    const data = req.body

    try {
        await IncomesCategoriesController.createCategory(data);
        res.status(201).json({message: "Categoria creada con éxito."})
    } catch (error) {
        res.status(400).json({message: error.message});
    }
})


export default router;