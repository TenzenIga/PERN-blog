import { Pool } from "pg";
import env from 'dotenv';

// convert to uppercase
env.config();


const envString = process.env.NODE_ENV?.toUpperCase()
//access the environment variables for this environment


 const pool = new Pool({
    user:'postgres',
    host:'localhost',
    database:process.env['DB_NAME_' + envString],
    password:process.env['DB_PASSWORD_' + envString],
    port:5432
});

export default pool;