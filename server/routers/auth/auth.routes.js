import express from 'express';
export const router = express.Router();
import controller from '../../controllers/auth.controller.js';
import { check } from 'express-validator';
import authMidleware from '../../middleware/auth.midleware.js';

router.post('/registration', [
    check('username', 'Имя пользователя не может быть пустым.').trim().notEmpty(),
    check('password', 'Пароль должен быть больше 4 и меньше 30 символов.').trim().isLength({ min: 4, max: 30 })
], controller.registration);
router.post('/login', controller.login);
router.delete('/logout', authMidleware, controller.logout);
router.post('/refresh', authMidleware, controller.refresh);
