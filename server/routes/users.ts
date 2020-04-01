import pool from "../startup/db"
import express from 'express';
import Joi from '@hapi/joi';
import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import asyncMiddleware from "../middleware/async";
const router = express.Router(); 
const schema = Joi.object({
    username:Joi.string()
        .alphanum()
        .min(1)
        .max(30)
        .required(),
    email:Joi.string()
        .email(),
    password:Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
  
})

router.get('/', asyncMiddleware(async (req:Request, res:Response)=>{
        const ret = await pool.query('SELECt * FROM users')
        res.json(ret)
}))

//Register
router.post('/', asyncMiddleware(async (req:Request, res:Response)=>{
        const {error} = schema.validate(req.body);
        if(error) return res.status(400).send(error.details[0].message);
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(req.body.password, salt)
        const values = [req.body.username, req.body.email,password];
        const result = await pool.query(`INSERT INTO users( username, email, password, date_created )
                    VALUES($1, $2, $3, NOW()) RETURNING *`, values)
        res.status(200).json(result.rows[0])
}))

export default router;