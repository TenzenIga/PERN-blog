


if(!process.env.jwtPrivateKey){
    throw new Error('FATAL ERROR jwtPrivateKey is not defined');
}
const key = process.env.jwtPrivateKey;
 export default key;