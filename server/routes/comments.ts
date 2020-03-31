import pool from "../startup/db"
import express from 'express';
import Joi from '@hapi/joi';
import { Request, Response, NextFunction } from 'express';
import asyncMiddleware from "../middleware/async";
import auth from "../middleware/auth";
import validateId from "../middleware/validateId";
const router = express.Router(); 
const schema = Joi.object({
    title:Joi.string()
        .min(1)
        .max(255)
        .required(),
    body:Joi.string().required(),
})


//Update comment
router.put('/:id', auth, validateId, asyncMiddleware(
    async(req:Request, res:Response)=>{
        const values = [req.body.comment, req.params.cid];
        const post = await pool.query('UPDATE comments SET comment = $1 WHERE cid = $2', values)
    }
))


//Delete comment
router.delete('/:id', auth, validateId, asyncMiddleware(
    async (req:Request, res:Response)=>{
        const values = [ req.params.cid, req.user.uid];
        const post = await pool.query('DELETE FROM comments WHERE cid = $1 AND user_id = $2' , values)
        res.status(200).send(`Comment with ${req.params.cid} deleted`);
    }
))



export default router;