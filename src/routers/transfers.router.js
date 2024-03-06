import { Router } from 'express';
import TransferController from '../controller/transfers.controller.js';
import passport from 'passport';

const router = Router();

router.get('/transfers', passport.authenticate('jwt',{session:false} ),  async (req, res)=>{

    try {
        const transfers = await TransferController.getTransfers();
        res.status(201).json({list: transfers});
    } catch (error) {
        res.status(400).json({message: error.message});
    }
})

router.get('/transfers/:id', passport.authenticate('jwt',{session:false} ),  async (req, res)=>{

    const id = req.params.id;

    try {
        const transfers = await TransferController.getTransfersByAccount(id);
        res.status(201).json({list: transfers});
    } catch (error) {
        res.status(400).json({message: error.message});
    }
})

router.get('/transfers-range-date/:id', passport.authenticate('jwt',{session:false} ),  async (req, res)=>{

    const id = req.params.id;
    const startDate = req.query.startDate
    const endDate = req.query.endDate

    try {
        const transfers = await TransferController.getTransfersByDate(startDate, endDate, id);
        res.status(201).json({list: transfers});
    } catch (error) {
        res.status(400).json({message: error.message});
    }
})

router.post('/transfers', passport.authenticate('jwt',{session:false}), async (req, res)=>{
    const {
        userId,
        accountId,
        to,
        date,
        amount
    } = req.body
    
    const data = {
        userId,
        accountId,
        to,
        date,
        amount
    }

    try {

        await TransferController.createTransfer(data);
        res.status(201).json({message: "Transferencia agregada."})

    } catch (error) {
        res.status(400).json({message: error.message});
    }

})

// router.get('/spents-range-date/:id', passport.authenticate('jwt',{session:false} ),  async (req, res)=>{

//     const id = req.params.id;
//     const startDate = req.query.startDate
//     const endDate = req.query.endDate

//     console.log(id, startDate, endDate)

//     try {
//         const spents = await SpentController.getSpentsByDateRange(startDate, endDate, id);
//         res.status(201).json({list: spents});
//     } catch (error) {
//         res.status(400).json({message: error.message});
//     }
// })

// router.get('/spents/:id', passport.authenticate('jwt',{session:false} ), async (req, res)=>{
//     const id = req.params.id;

//     try {
//         const spents = await SpentController.getSpentsByUser(id);
//         res.status(201).json({list: spents});
//     } catch (error) {
//         res.status(400).json({message: error.message});
//     }
// })

// router.post('/spents', async (req, res)=>{
//     const {
//         accountId,
//         category,
//         description,
//         date,
//         amount, 
//     } = req.body

//     const newSpent = {          
//             accountId,
//             category,
//             description,
//             date,
//             amount, 
//         }

//     try {

//         await SpentController.register(newSpent);
//         res.status(201).json({message: "Gasto agregado."})

//     } catch (error) {
//         res.status(400).json({message: error.message});
//     }
// })


export default router;