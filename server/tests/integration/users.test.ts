import request from 'supertest';
import server from '../../index';
import pool from '../../startup/db';

describe('/users', ()=>{
    let username = 'test',
        email = 'test@mail.com',
        password = '12345qwerty';

    afterEach(async ()=>{
        server.close();
        await pool.query('DELETE FROM users');
    })
    afterAll(()=>{
        pool.end()
    })
    describe('POST /', ()=>{
        const execRegister = async ():Promise<request.Response>=>{
            return await request(server)
                .post('/users')
                .send({username, email, password });
        }

        it('should return 200 if registered successfully', async ()=>{
            const res = await execRegister();
            const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            expect(res.status).toBe(200);
            expect(user.rows[0].email === email).toBeTruthy()
        })
        
        it('Should return 400 if inputs are not valid', async ()=>{
            username = '';
            const res = await execRegister();
            expect(res.status).toBe(400);

        })

        it('Should return 400 if user already registered', async ()=>{
            username = 'test';
            await pool.query(`INSERT INTO users( username, email, password, date_created )
            VALUES($1, $2, $3, NOW())`, [username, email, password]);
            const res = await execRegister();
            expect(res.status).toBe(500);
        })
    })
})