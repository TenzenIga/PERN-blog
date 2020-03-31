import { NextFunction, Request, Response } from "express";

// 401 Unauthorized 
// 403  Forbidden

export default function(req:Request, res:Response, next:NextFunction){
    if(!req.user.admin) return res.status(403).send('В доступе отказано')
    next()
} 