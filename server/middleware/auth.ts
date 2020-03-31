import { Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import key from '../startup/config';



export default function auth(req:Request, res:Response, next:NextFunction){
    const token = req.header('x-auth-token');
    if(!token) return res.status(401).send('Access denied. No token provided');
    try {
        const decoded:any= jwt.verify(token, key)
       req.user = decoded
        next()
    } catch (error) {
        res.status(400).send('Invalid token.')
    }
    
}

