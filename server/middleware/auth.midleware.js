import jwt from 'jsonwebtoken';
import { JWT_ACCESS_SECRET } from '../config/auth.config.js';

export default function(req, res, next) {
    if (req.method === "OPTIONS") {
        next();
    }
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
           return res.status(403).json({ message: "Пользователь не авторизован" });
        }
        const decodedData = jwt.verify(token, JWT_ACCESS_SECRET);
        req.user = decodedData;
        next();
    } catch (err) {
        // console.log(err);
        return res.status(403).json({message: "Пользователь не авторизован"});
    }
}