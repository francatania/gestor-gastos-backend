import { Router } from 'express';
import UserController from '../controller/user.controller.js';
import mongoose from 'mongoose';

const router = Router();

router.post('/users', async(req, res, next)=>{
  const  {
    first_name,
    last_name,
    email,
    password,
  } = req.body

  const data = {
    first_name,
    last_name,
    email,
    password,
  }

  try {
    await UserController.register(data);
    res.status(200).json({message: "Se creó el usuario."})
  } catch (error) {
    res.status(400).json({message: error.message})
  }
})

router.get('/users', async (req, res, next) => {
  try {
    const users = await UserController.getUsers({})
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});


router.get('/users/:id', async (req, res)=>{
  try {
    const id = req.params.id;
    const user = await UserController.getUserById(id);
    res.status(200).json({user: user});
  } catch (error) {
    res.status(400).json({message: error.message});
  }
})

router.delete('/users', async (req, res)=>{
  try {
    await UserController.deleteUsers();
    res.status(204);
  } catch (error) {
    res.status(400).json({message: error.message});
  }
})

router.delete('/users/:id', async (req, res) => {
  try {
    const { params: { id } } = req;
    await UserController.deleteById({ _id: uid });
    res.status(204);
  } catch (error) {
    res.status(400).json({message: error.message});
  }
});

export default router;