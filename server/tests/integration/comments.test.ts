import request from 'supertest';
import server from '../../index';
import pool from '../../startup/db';
import key from '../../startup/config';
import jwt from 'jsonwebtoken';


/**
 * Create test user and token
 * create new post
 * test CRUD method with /comments route
 * delete user, post and comments
 * 
 */

 describe('/posts', ()=>{

    let token:string,
        newUser:any,
        newPost:any,
        newComment:any,
        commentBody = {comment:'test comment'};
    beforeEach(async ()=>{
        newUser = await pool.query(`INSERT INTO users( username, email, password, date_created )
        VALUES('John', 'test@mail.ru', '123456', NOW()) RETURNING *`);
        
        token = jwt.sign({uid: newUser.rows[0].uid, username: 'John', admin: true }, key );
        
        newPost = await pool.query(`INSERT INTO posts( title, body, user_id, date_created )
        VALUES('Post title', 'post text', ${newUser.rows[0].uid}, NOW()) RETURNING *`);
       
        newComment = await pool.query(`INSERT INTO comments( comment, user_id, post_id, date_created )
        VALUES('first comment', ${newUser.rows[0].uid}, ${newPost.rows[0].pid}, NOW()) RETURNING *`);
        
        
    })
    
    afterEach( async ()=>{
        server.close();
        await pool.query('DELETE FROM comments')
        await pool.query('DELETE FROM posts')
        await pool.query('DELETE FROM users')
        }
    )

      
    describe('GET /:id', ()=>{
        it('should return all comments to the post', async ()=>{
            const res = await request(server).get('/comments/' + newPost.rows[0].pid);
            expect(res.status).toBe(200);
            expect(res.body.rows[0].comment).toEqual('first comment');
        })
    })
    describe('POST /:id', ()=>{
        // function to add comment
        const execPost = async ():Promise<request.Response>=>{
            return await request(server)
            .post('/comments/' + newPost.rows[0].pid)
            .set('x-auth-token', token)
            .send(commentBody);
        }

        it('should add comment to the post', async ()=>{
            const res = await execPost()
            expect(res.status).toBe(200);
            expect(res.body.rows.some((p:any)=> p.comment === 'first comment'));
            expect(res.body.rows.some((p:any)=> p.comment === commentBody.comment));
        })



    })
    describe('PUT /:id', ()=>{
        // function to add comment
        const execPut = async ():Promise<request.Response>=>{
            return await request(server)
            .put('/comments/' + newComment.rows[0].cid)
            .set('x-auth-token', token)
            .send(commentBody);
        }

        it('should update comment', async ()=>{
            const res = await execPut()
            expect(res.status).toBe(200);
        })
       
    })

    describe('DELETE /:id', ()=>{
        // function to add comment
        const execDelete = async ():Promise<request.Response>=>{
            return await request(server)
            .delete('/comments/' + newComment.rows[0].cid)
            .set('x-auth-token', token)
        }

        it('should update comment', async ()=>{
            const res = await execDelete()
            expect(res.status).toBe(200);
        })
    })
 
 })