import express from 'express';
export const router = express.Router();
import controller from '../../controllers/auth.controller.js';
import { check } from 'express-validator';
import usersMidleware from '../../middleware/users.midleware.js';

router.get('/users', controller.getUsers);
router.get('/users/me', usersMidleware, controller.getUserInfo);
