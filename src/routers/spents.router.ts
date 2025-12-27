import { Router } from 'express';
import SpentController from '../controller/spent.controller.js';
import passport from 'passport';
import { SpentService } from '../services/spent.service.js';
import SpentDao from '../dao/spent.dao.js';

const router = Router();
const spentDao = new SpentDao();
const spentService = new SpentService(spentDao);
const spentController = new SpentController(spentService);

router.post(
  '/spents',
  passport.authenticate('jwt', { session: false }),
  spentController.createSpent
);

router.get(
  '/spents-range-date/:id',
  passport.authenticate('jwt', { session: false }),
  spentController.getSpentsByDateRange
);

router.get(
  '/spents/:id',
  passport.authenticate('jwt', { session: false }),
  spentController.getSpentById
);

router.patch(
    '/spents/:id',
    passport.authenticate('jwt', { session: false }),
    spentController.updateSpent
)

/*

router.get('/spents/:id', passport.authenticate('jwt',{session:false} ), async (req, res)=>{
    const id = req.params.id;

    try {
        const spents = await SpentController.getSpentsByAccount(id);
        res.status(201).json({list: spents});
    } catch (error) {
        res.status(400).json({message: error.message});
    }
})

router.post('/spents', async (req, res)=>{
    const {
        accountId,
        category,
        description,
        date,
        amount, 
    } = req.body

    const newSpent = {          
            accountId,
            category,
            description,
            date,
            amount, 
        }

    try {

        await SpentController.register(newSpent);
        res.status(201).json({message: "Gasto agregado."})

    } catch (error) {
        res.status(400).json({message: error.message});
    }
})

router.delete('/spents/:id', async (req, res)=>{
    const id = req.params.id;
    const accountId = req.query.account
    try {
        await SpentController.deleteSpent(id, accountId);
        res.status(200).json({message:"Gasto eliminado."})
    } catch (error) {
        res.status(400).json({message: error.message});
    }
})*/


export default router;