import { Router } from 'express';
import CategoriesController from '../controller/categories.controller.js';

const router = Router();

router.get('/categories', async (req, res)=>{
    try {
        const categories = await CategoriesController.getCategories();
        res.status(200).json({categories: categories});
    } catch (error) {
        res.status(400).json({message: error.message});
    }
})

router.post('/categories', async (req, res)=>{
    const data = req.body

    try {
        await CategoriesController.createCategory(data);
        res.status(201).json({message: "Categoria creada con éxito."})
    } catch (error) {
        res.status(400).json({message: error.message});
    }
})


export default router;