import express from "express";
import routes from './startup/routes';
import logging from './startup/logging';


const app = express();

const port = process.env.PORT || 3000;


logging(app)
routes(app)


const server = app.listen(port, ()=>{
    console.log('Started server');
})

export default server;
