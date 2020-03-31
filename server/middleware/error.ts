
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import winston from 'winston';

export default function(err:ErrorRequestHandler,req:Request, res:Response, next:NextFunction) {
    winston.error(err)
    res.status(500).send('Something failed');   
    
 }
