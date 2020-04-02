import pool from "../startup/db";
import express from 'express';
import Joi from '@hapi/joi';
import { Request, Response } from 'express';
import asyncMiddleware from "../middleware/async";
import auth from "../middleware/auth";
import validateId from "../middleware/validateId";



const router = express.Router(); 

const commentSchema = Joi.object({
    comment:Joi.string()
        .min(1)
        .required()
})



/**
 * Get comments from post 
 * @id post id
 */

 router.get('/:id', validateId, asyncMiddleware(
    async (req:Request, res: Response) =>{
        const ret = await pool.query('SELECt * FROM comments WHERE post_id = $1', [req.params.id])
        res.status(200).json(ret )
    }
 )) 

/**
 * Send comment to post
 *  @id post id
 * */ 
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

/**
 * Edit comment
 * @id comment id
 */
router.put('/:id', auth, validateId, asyncMiddleware(
    async (req:Request, res:Response)=>{
        const id = parseInt(req.params.id);
        const {error} = commentSchema.validate(req.body);
        if(error) return res.status(400).send(error.details[0].message);
        // check if comment belongs to user
        const isCommentBelongsToUser = await pool.query('SELECT EXISTS(SELECT 1 FROM comments WHERE cid = $1 AND user_id = $2)', [id, req.user.uid ])
        
        if(!isCommentBelongsToUser.rows[0].exists){
            return res.status(403).send("В доступе отказано")
        }
        const values = [req.body.comment, id];
        await pool.query('UPDATE comments SET comment = $1 WHERE cid = $2', values) 
        res.status(200).json({msg:'Comment edited'});
    }
))

 /**
  * Delete comment 
  * @id comment id
  */
router.delete('/:id', auth, validateId, asyncMiddleware(
    async (req:Request, res:Response)=>{
        const id = parseInt(req.params.id);
        await pool.query('DELETE FROM posts WHERE pid = $1', [id])    
        res.status(200).json({msg:`Post with ID: ${id} was deleted`})
    }))

export default router;