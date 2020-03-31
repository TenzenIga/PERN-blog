import winston from 'winston';
import { Application } from 'express';
export default function(app:Application){
process.on('uncaughtException', (ex)=>{
 
    winston.error(ex.message, ()=>{
      process.exit(1)
    })
});

process.on('unhandledRejection', (ex:any)=>{
  
    winston.error(ex.message, ()=>{
      process.exit(1)
    } )
    
});


winston.configure({
    transports: [
      new (winston.transports.File)({ filename: 'logfile.log' })
    ]
  });
}
