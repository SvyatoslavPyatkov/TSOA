import db from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_EXPIRE, JWT_REFRESH_EXPIRE } from '../config/auth.config.js';
import { validationResult } from 'express-validator';

const generateAccessToken = (id) => {
    const payload = { id }
    return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_EXPIRE });
}

const generateRefreshToken = (id) => {
    const payload = { id }
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRE });
}

const validateAccessToken = (token) => {
    try {
        const userData = jwt.verify(token, JWT_ACCESS_SECRET);
        return userData;
    } catch (err) {
        return null;
    }
}

const validateRefreshToken = (token) => {
    try {
        const userData = jwt.verify(token, JWT_REFRESH_SECRET);
        return userData;
    } catch (err) {
        return null;
    }
}

class authController {
    async registration(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: "Ошибка при регистрации", errors })
            }

            const { first_name, last_name, username, password } = req.body;
            const candidate = await db.userModel.findOne({ where: { username: username } });
            if (candidate) {
                return res.status(400).json({ message: "Пользователь с данным именем уже существует "})
            }
            const hashed_password = bcrypt.hashSync(password, 7);

            db.userModel.create({
                first_name: first_name,
                last_name: last_name,
                username: username,
                hashed_password: hashed_password
            })
            .then(
                res.status(201).json({ message: "Пользователь был успешно зарегистрирован." })
            )
            .catch(err => {
                res.status(500).json({ message: err.message });
            });
        } catch (err) {
            res.status(400).json({ message: "Ошибка регистрации", errors })
        }
    }

    async login(req, res) {
        try {
            const { first_name_input, last_name_input, username, password } = req.body;
            const user = await db.userModel.findOne({
                where: {username: username }
            });
            if (!user) {
                return res.status(400).json({ message: `Пользователь ${ username } не найден` })
            }

            bcrypt.compare(password, user.hashed_password)
            .then(function(validPassword) {
                if (!validPassword) {
                    return res.status(400).json({ message: "Введён неверный пароль" })
                }
                const accessToken = generateAccessToken(user.id);
                const refreshToken = generateRefreshToken(user.id);
                res.cookie("access_token_cookie", accessToken, {maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true});
                res.cookie("refresh_token_cookie", refreshToken, {maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true});
                const userOutput = {
                    id: user.id,
                    username: user.username, 
                    first_name: user.first_name, 
                    last_name: user.last_name
                };
                return res.status(200).json(userOutput);
            });
        } catch (err) {
            return res.status(400).json(err)
        }
    }

    async logout(req, res) {
        try {
            res.clearCookie('access_token_cookie');
            res.clearCookie('refresh_token_cookie');
            return res.status(204).json();
        } catch (err) {
            res.status(400).json({ message: "Ошибка выхода из учётной записи" })
        }
    }

    async refresh(req, res) {
        try {
            const { refresh_token_cookie } = req.cookies;
            if (!refresh_token_cookie) {
                return res.status(400).json({ message: "Ошибка авторизации" });
            }
            const userData = validateRefreshToken(refresh_token_cookie);
            if (!userData) {
                return res.status(400).json({ message: "Ошибка авторизации" });
            }

            const user = await db.userModel.findByPk(userData.id);
            const newAccessToken = generateAccessToken(user.id);
            const newRefreshToken = generateRefreshToken(user.id);
            res.cookie("access_token_cookie", newAccessToken, {maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true});
            res.cookie('refresh_token_cookie', newRefreshToken, {maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.sendStatus(200);

        } catch (err) {
            return res.status(400).json({ message: "Ошибка авторизации" });
        }
    }

    async getUsers(req, res) {
        try {
            const users = await db.userModel.findAll({
                attributes: {exclude: ['hashed_password']}
            });
            // res.set('Access-Control-Allow-Origin', '*');
            res.json(users);
        } catch (err) {
            res.status(400).json({ message: "Ошибка получения пользователей" })
        }
    }

    async getUserInfo(req, res) {
        try {
            const user_id = req.user.id

            const user = await db.userModel.findByPk(user_id , {
                attributes: {exclude: ['hashed_password']}
            });

            res.json(user);
        } catch (err) {
            
        }
    }
}

export default new authController;