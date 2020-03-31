import request from 'supertest';
import server from '../../index';
import pool from '../../startup/db';
import key from '../../startup/config';
import jwt from 'jsonwebtoken';




/**
 * Create test user and token
 * test CRUD method with /posts
 * delete user and posts
 * 
 */

describe('/posts', ()=>{
    
    let token:string
    let newUser:any
    let newPost:any;
    beforeEach(async ()=>{
        newUser = await pool.query(`INSERT INTO users( username, email, password, date_created )
        VALUES('John', 'test@mail.ru', '123456', NOW()) RETURNING *`)
        token = jwt.sign({uid: newUser.rows[0].uid, username: 'John', admin: true }, key )
        newPost = {title:'posts title', body:'post text'}
    })
    afterEach( async ()=>{
        server.close();
        await pool.query('DELETE FROM posts')
        await pool.query('DELETE FROM users')
        }
    )
    describe('GET /', ()=>{
        it('should return all posts', async ()=>{
            await pool.query(`INSERT INTO posts
            ( title, body, user_id, date_created )
        VALUES 
            ('Post1','post 1 text', ${newUser.rows[0].uid}, NOW())`)
            
           const res = await request(server).get('/posts');
            expect(res.status).toBe(200);
            expect(res.body.rows.some((p:any)=>p.title === 'Post1')).toBeTruthy();
        });
    });

    describe('GET /:id', ()=>{
        it('should return a post if valid id passed', async ()=>{
            const post = await pool.query(`INSERT INTO posts
            ( title, body, user_id, date_created )
        VALUES 
            ('Post1','post 1 text', ${newUser.rows[0].uid}, NOW())
          RETURNING pid`)
          
            const res = await request(server).get('/posts/' + post.rows[0].pid);
            expect(res.status).toBe(200);
            expect(res.body.rows[0]).toMatchObject(post.rows[0])
        })

        it('should return 404 if invalid id is passed', async ()=>{
            const res = await request(server).get('/posts/jhhj');    
            expect(res.status).toBe(404);
        })
    })
    describe('POST /', ()=>{
        const execPost = async ():Promise<request.Response>=>{
            return await request(server)
            .post('/posts')
            .set('x-auth-token', token)
            .send(newPost);
        }

        it('should save post if it is valid', async ()=>{
            await execPost()
            const savedPost = await pool.query('SELECT * from posts',);
            expect(savedPost.rows[0].title).toEqual(newPost.title)
        })


        it('should return 401 if client is not logged in', async ()=>{
            token = '';
            const res = await execPost();
            expect(res.status).toBe(401);
        })
        it('should return 400 if post is not valid', async ()=>{
            newPost = '';
            const res = await execPost();
            expect(res.status).toBe(400);
        })
    })

    describe('PUT /:id', ()=>{
        
  
        let savedPost:any;

        const execPut = async ():Promise<request.Response>=>{
            savedPost = await pool.query(`INSERT INTO posts
            ( title, body, user_id, date_created )
        VALUES 
          ('Post1','post 1 text', ${newUser.rows[0].uid}, NOW()) RETURNING pid`)
            return await request(server)
            .put('/posts/' + savedPost.rows[0].pid)
            .set('x-auth-token', token)
            .send(newPost);
        }

        it('should update post if it is valid', async ()=>{
         
            await execPut()
            const updatedPost = await pool.query('SELECT * FROM posts WHERE pid = $1', [savedPost.rows[0].pid]);
            
            
            expect(updatedPost.rows[0].title).toEqual(newPost.title)
        })

        it('should return 401 if client is not logged in', async ()=>{
            token = '';
            const res = await execPut();
            expect(res.status).toBe(401);
        })
        it('should return 400 if post is not valid', async ()=>{
            newPost = '';
            const res = await execPut();
            expect(res.status).toBe(400);
        })
    })

    describe('DELETE /:id', ()=>{
        let savedPost:any;
        const execDelete = async ():Promise<request.Response>=>{
            savedPost = await pool.query(`INSERT INTO posts
            ( title, body, user_id, date_created )
        VALUES 
            ('Post1','post 1 text', ${newUser.rows[0].uid}, NOW()) RETURNING pid`)
            return await request(server)
            .delete('/posts/' + savedPost.rows[0].pid)
            .set('x-auth-token', token)
        }
        it('should delete post with given id valid and return status 200', async ()=>{
         
            const res = await execDelete()
            const updatedPost = await pool.query('SELECT * FROM posts WHERE pid = $1', [savedPost.rows[0].pid]);
            expect(updatedPost.rowCount).toEqual(0);
            expect(res.status).toBe(200);
        })
    })
});

   