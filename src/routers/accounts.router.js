import { Router } from 'express';
import AccountController from '../controller/account.controller.js';

const router = Router();

router.post('/accounts/:id', async(req, res, next)=>{
  const  {
    accountName
  } = req.body

  const userId = req.params.id

  const data = {
    accountName,
    userId
  }

  try {
    await AccountController.create(data);
    res.status(200).json({message: `Se creó la cuenta ${accountName}`})
  } catch (error) {
    res.status(400).json({message: error.message})
  }
})

router.get('/accounts/:id', async (req, res, next) => {
  const id = req.params.id

  try {
    const account = await AccountController.getAccountById(id)
    res.status(200).json(account);
  } catch (error) {
    next(error);
  }
});



router.delete('/accounts/:id', async (req, res) => {
  try {
    const { params: { id } } = req;
    await AccountController.deleteById({ _id: id });
    res.status(204);
  } catch (error) {
    res.status(400).json({message: error.message});
  }
});

export default router;