const server = require('fastify')({ logger: true });
const fastifySecureSession= require('@fastify/secure-session')
const fastifyPassport=require('@fastify/passport')
const PassportLocal=require('passport-local').Strategy

const fs = require('fs')
const path = require('path')
// set up secure sessions for @fastify/passport to store data in
//server.register(fastifySecureSession, { key: fs.readFileSync(path.join(__dirname, 'secret-key')) })
server.register(fastifySecureSession, { key: fs.readFileSync(path.join(__dirname, 'secret-key'))})

// initialize @fastify/passport and connect it to the secure-session storage. Note: both of these plugins are mandatory.
server.register(fastifyPassport.initialize())
server.register(fastifyPassport.secureSession())

// register an example strategy for fastifyPassport to authenticate users using
fastifyPassport.use('test', new PassportLocal(function(username,password,done){
    if (username==="jose" && password==="123456")
    return done(null,{id:1,name:"Jose"});
    done(null,false);
})) // you'd probably use some passport strategy from npm here

// Add an authentication for a route which will use the strategy named "test" to protect the route
fastifyPassport.registerUserSerializer(async (user, request) => user.id);

// ... and then a deserializer that will fetch that user from the database when a request with an id in the session arrives
fastifyPassport.registerUserDeserializer(async (id, request) => {
  return {id:1, name:"Jose"};
});

server.post('/pato',(req,res)=>{
    res.send('hola mundo')
})
server.post(
  '/',
  { preValidation: fastifyPassport.authenticate('test', { authInfo: false }) },
  async () => 'hello world!'
)

// Add an authentication for a route which will use the strategy named "test" to protect the route, and redirect on success to a particular other route.
server.post(
  '/login',
  { preValidation: fastifyPassport.authenticate('test', { successRedirect: '/', authInfo: false }) },
  () => {}
)

server.listen({ port: 3000 })