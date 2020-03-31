declare namespace Express {
    export interface Request {
       user: User
    }
 }

 interface User{
    uid: number,
    username: string,
    admin: boolean,
    iat:number
 }