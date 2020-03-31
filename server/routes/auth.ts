import Joi from '@hapi/joi';
import express from 'express';
import asyncMiddleware from '../middleware/async';

import { Request, Response} from 'express';
import bcrypt from 'bcrypt';
import pool from '../startup/db';
import jwt from 'jsonwebtoken';
import key from '../startup/config';

const router = express.Router(); 

const schema = Joi.object({
    email:Joi.string()
        .email()
        .required(),
    password:Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required(),
})

router.post('/', asyncMiddleware(async(req:Request, res:Response)=>{
    const {error} = schema.validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    const email = req.body.email
    let user = await pool.query('SELECT * FROM users WHERE email=$1',[email] )   
    //if 0 
    if(!user.rowCount) return res.status(400).send('Неправильный email или пароль.')
    const validPassword = await bcrypt.compare(req.body.password, user.rows[0].password)
    if(!validPassword) return res.status(400).send('Неправильный email или пароль.')
    
    const token = jwt.sign({uid: user.rows[0].uid, username: user.rows[0].username, admin: user.rows[0].admin }, key )
    res.send(token)
   
}))
export default router