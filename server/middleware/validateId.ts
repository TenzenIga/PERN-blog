import { NextFunction, Request, Response } from "express";


export default function(req:Request, res:Response, next:NextFunction){
    if(isNaN(parseInt(req.params.id))) return res.status(404).send('Invalid ID');
    next()
}