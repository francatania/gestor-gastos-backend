import { Router } from 'express';
import SpentsCategoriesController from '../controller/spents.categories.controller.js';

const router = Router();

router.get('/spents-categories', async (req, res)=>{
    try {
        const categories = await SpentsCategoriesController.getCategories();
        res.status(200).json({categories: categories});
    } catch (error) {
        res.status(400).json({message: error.message});
    }
})

router.get('/spents-categories/:id', async (req, res)=>{
    try {
        const id = req.params.id;
        const categories = await SpentsCategoriesController.getById(id);
        res.status(200).json({categories: categories});
    } catch (error) {
        res.status(400).json({message: error.message});
    }
})


router.post('/spents-categories', async (req, res)=>{
    const data = req.body

    try {
        await SpentsCategoriesController.createCategory(data);
        res.status(201).json({message: "Categoria creada con éxito."})
    } catch (error) {
        res.status(400).json({message: error.message});
    }
})


export default router;