import jwt from 'jsonwebtoken';
import { JWT_ACCESS_SECRET } from '../config/auth.config.js';

export default function(req, res, next) {
    if (req.method === "OPTIONS") {
        next();
    }
    try {
        const token = req.cookies.access_token_cookie;
        if(token) {
            const decodedData = jwt.verify(token, JWT_ACCESS_SECRET);
            req.user = decodedData;
        }
        next();
    } catch (err) {
        // console.log(err);
        return res.status(403).json({ message: "Пользователь не авторизован" });
    }
}