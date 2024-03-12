import { Router } from 'express';
import UserController from '../controller/user.controller.js';

const router = Router();

router.post('/auth/register', async (req, res) => {
    const {
      first_name,
      last_name,
      email, 
      password,
      } = req.body
  
      const newUser = {
        first_name,
        last_name,
        email, 
        password,
        incomes: [],
        spents: [],
        transfers: []
      }
  
      try {
        await UserController.register(newUser);
        res.status(201).json({message: 'Usuario creado.'});
      } catch (error) {
        res.status(400).json({message: error.message});
      }
  });

  router.post('/auth/login', async (req, res)=>{
    const user = req.body;
    try {
      const token = await UserController.login(user);
      console.log(token)
      res.status(200).json({ token });
    } catch (error) {
      res.status(401).json({message: error.message});
    }
    
  })

  export default router;