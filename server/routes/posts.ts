import pool from "../startup/db";
import express from 'express';
import Joi from '@hapi/joi';
import { Request, Response, NextFunction } from 'express';
import asyncMiddleware from "../middleware/async";
import auth from "../middleware/auth";
import admin from "../middleware/admin";
import validateId from "../middleware/validateId";

const router = express.Router(); 
const schema = Joi.object({
    title:Joi.string()
        .min(1)
        .max(255)
        .required(),
    body:Joi.string().required(),
})

const commentSchema = Joi.object({
    comment:Joi.string()
        .min(1)
        .required()
})
// get all posts
router.get('/', asyncMiddleware(async (req:Request, res:Response)=>{
    const ret = await pool.query('SELECt * FROM posts')
    res.json(ret )
}));

/**
 * Get post post page
 */
router.get('/:id',validateId, asyncMiddleware(async (req:Request, res:Response)=>{
 
    if(isNaN(parseInt(req.params.id))) return res.status(404).send('Invalid ID');
    const post  = await pool.query('SELECT * FROM posts WHERE pid = $1', [req.params.id])    
    res.json(post)
}));

/**
 * Create post
 */
router.post('/', [auth, admin],asyncMiddleware(async (req:Request, res:Response)=>{
    const {error} = schema.validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    const values = [req.body.title, req.body.body, req.user.uid];
    const result = await pool.query(`INSERT INTO posts( title, body, user_id, date_created )
    VALUES($1, $2, $3, NOW()) RETURNING *`, values)
    res.json(result.rows[0])
}));


//Update post
router.put('/:id',[auth, admin],validateId,  asyncMiddleware(
    async (req:Request, res:Response)=>{
        const {error} = schema.validate(req.body);
        if(error) return res.status(400).send(error.details[0].message);
        const values = [req.body.title, req.body.body, parseInt(req.params.id)];
        const post  = await pool.query('UPDATE posts SET title = $1, body = $2 WHERE pid = $3', values )    
        res.json(post)
    }))
/**
 * Delete post 
 */
router.delete('/:id',[auth, admin], validateId, asyncMiddleware(async (req:Request, res:Response)=>{
    const id = parseInt(req.params.id);
    const post  = await pool.query('DELETE FROM posts WHERE pid = $1', [id])    
    res.status(200).send(`Post with ID: ${id} was deleted`)
}));


// Send comment
router.post('/:id', auth, validateId, asyncMiddleware(
    async (req: Request, res:Response) =>{
        const {error} = commentSchema.validate(req.body);
        if(error) return res.status(400).send(error.details[0].message);
        const values = [req.body.comment, req.user.uid, req.params.id];
        const comment = await pool.query(`INSERT INTO comments( comment, user_id, post_id, date_created )
        VALUES($1, $2, $3, NOW()) RETURNING *`, values)  
        res.json(comment); 
    }
))


export default router;