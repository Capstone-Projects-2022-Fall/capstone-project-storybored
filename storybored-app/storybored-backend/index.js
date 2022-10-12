var express = require("express");
var http = require("http");
var path = require("path");
var jwt = require("jsonwebtoken");
var uuid = require("uuid");
var dotenv = require("dotenv").config();
var redis = require("ioredis");
var bluebird = require("bluebird");
var cors = require('cors')
bluebird.promisifyAll(redis);







/**
 * Creates endpoints for HTTP response and requests.
 */
 const app = express();
//  app.use("/static", express.static(`${__dirname}/static`));
 app.use(express.json());
 app.use(cors())
 app.locals.index = 1000000000;
 
 /**
  * Used to listen for API calls on selected port
  */
 const server = http.createServer(app);


/**
 * internal list of connected clients
 */
 const connected_clients = {}; //const refernce, mutable array
 /**
  * Client for redis communication
  */
 const redisClient = redis.createClient({port:6379});




/**
 * retrieves the index given to the user
 * @param {PATH} '/' endpoint for API call
 * @param {HTTP handler function} (req, res) function for processing get HTTP request and response
 */
 app.get("/", (req, res) => {
  let id = (app.locals.index++).toString(36);
  res.redirect(`/${id}`);
});







 /**
 * Authenticate JWT for incoming requests
 * @param {request object} req request stream from client
 * @param {response object} res response stream to client
 * @param {function} next function called upon completion of
 */
function authenticate(req, res, next) {
  // authenticate calls (first called by join --> get :roomId/join?) would fail because there would be no token in the headers, so 401 status would be returned

  let token;
  
  if (req.query.token) {
    token = req.query.token;
  }
  else if (req.body.headers) {
    token = req.body.headers.Authorization.split(" ")[1];
  }
  else if (req.headers){
    token = req.headers.authorization.split(" ")[1];
  }
  // console.log(req)
  // console.log("token", req.query.token, req.body.headers)

  if (typeof token !== "string") {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}


/**
 * Sets up a new client and adds them to the list of connected clients. Adds clients to list of redis subscribers
 * @param {PATH} '/connect' endpoint for API call
 * @param {function} authenticate function used to authenticate JWT
 * @param {HTTP handler function} (req, res) function for processing get HTTP request and response
 */
 app.get("/connect", authenticate, (req, res) => {

  
  if (req.headers.accept !== "text/event-stream") {
    return res.sendStatus(404);
  }

  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Content-type", "text/event-stream");

  // setHeader needed a second parameter
  // res.setHeader("Access-Control-Allow-Origin");
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.flushHeaders();

  //setup new client
  let client = {
    id: req.user.id,
    user: req.user,
    redis: redis.createClient({port:6379}),
    emit: (event, data) => {
      res.write(`id: ${uuid.v4()}\n`);
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    },
  };

  //add it to our connected client list until they leave
  connected_clients[client.id] = client;

  //subscribe to redis events
  client.redis.on("message", (channel, message) => {
    let msg = JSON.parse(message);
    client.emit(msg.event, msg.data);
  });

  client.redis.subscribe(`messages:${client.id}`);

  client.emit("connected", { user: req.user });

  req.on("close", () => {
    disconnect(client);
  });
});


/**
 * Communicates to all connected clients that a new user has joined, generates an offer to setup peer connections
 * @param {PATH} '/:roomId/join' endpoint for API call
 * @param {function} authenticate function used to authenticate JWT
 * @param {async HTTP handler function}(req, res) function for processing post HTTP request and response
 */
 app.post("/:roomId/join", authenticate, async (req, res) => {
  let roomId = req.params.roomId;

  // Removed Async keyword - Aysnc not a recognized function, bluebird not working correctly? or updated document - double check
  await redisClient.sadd(`${req.user.id}:channels`, roomId);

  // Removed Async keyword
  let peerIds = await redisClient.smembers(`channels:${roomId}`);
  peerIds.forEach((peerId) => {
    redisClient.publish(
      `messages:${peerId}`,
      JSON.stringify({
        event: "add-peer",
        data: {
          peer: req.user,
          roomId,
          offer: false,
        },
      })
    );
    redisClient.publish(
      `messages:${req.user.id}`,
      JSON.stringify({
        event: "add-peer",
        data: {
          peer: { id: peerId },
          roomId,
          offer: true,
        },
      })
    );
  });

  // Removed Async keyword
  await redisClient.sadd(`channels:${roomId}`, req.user.id);
  return res.sendStatus(200);
});






/**
 * Generate UUID for new users
 * @param {PATH} '/acesss' endpoint for API call
 * @param {HTTP handler function} (req, res) function for processing post HTTP request and response
 */
app.post("/access", (req, res) => {
  
    if (!req.body.username) {
      return res.sendStatus(403);
    }
    const user = {
      id: uuid.v4(),
      username: req.body.username,
    };
  
    // 401 error caused by : no .env file with token secret to create a new token below
    const token = jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: "3600s" });
    return res.json({ token });
});

server.listen(process.env.PORT || 7007, () => {
    console.log(`started server on port ${server.address().port}`);
});
  




/**
 * Remove a client from the connection list. Updates all connected peers
 * @param {client object} client containing a UUID
 */
 async function disconnect(client) {
  delete connected_clients[client.id];

  // Removed Async keyword
  await redisClient.del(`messages:${client.id}`);

  // Removed Async keyword
  let roomIds = await redisClient.smembers(`${client.id}:channels`);

  // Removed Async keyword
  await redisClient.del(`${client.id}:channels`);

  await Promise.all(
    roomIds.map(async (roomId) => {
      // Removed Async keyword
      await redisClient.srem(`channels:${roomId}`, client.id);
      // Removed Async keyword
      let peerIDs = await redisClient.smembers(`channels:${roomId}`);
      let msg = JSON.stringify({
        event: "remove-peer",
        data: { peer: client.user, roomId: roomId },
      });
      await Promise.all(
        peerIDs.map(async (peerID) => {
          if (peerID !== client.id) {
            await redisClient.publish(`messages:${peerID}`, msg);
          }
        })
      );
    })
  );
}



/**
 * Remove a client from the connection list. Updates all connected peers
 * @param {client object} client containing a UUID
 */
 async function disconnect(client) {
  delete connected_clients[client.id];

  // Removed Async keyword
  await redisClient.del(`messages:${client.id}`);

  // Removed Async keyword
  let roomIds = await redisClient.smembers(`${client.id}:channels`);

  // Removed Async keyword
  await redisClient.del(`${client.id}:channels`);

  await Promise.all(
    roomIds.map(async (roomId) => {
      // Removed Async keyword
      await redisClient.srem(`channels:${roomId}`, client.id);
      // Removed Async keyword
      let peerIDs = await redisClient.smembers(`channels:${roomId}`);
      let msg = JSON.stringify({
        event: "remove-peer",
        data: { peer: client.user, roomId: roomId },
      });
      await Promise.all(
        peerIDs.map(async (peerID) => {
          if (peerID !== client.id) {
            await redisClient.publish(`messages:${peerID}`, msg);
          }
        })
      );
    })
  );
}



/**
 * Relays drawdata messages to peers
 * @param {PATH} '/relay/:peerID/:event' endpoint for API call
 * @param {function} authenticate function used to authenticate JWT
 * @param {HTTP handler function}(req, res) function for processing post HTTP request and response
 */
 app.post("/relay/:peerID/:event", authenticate, (req, res) => {
  let peerID = req.params.peerID;
  let msg = {
    event: req.params.event,
    data: { peer: req.user, data: req.body },
  };

  redisClient.publish(`messages:${peerID}`, JSON.stringify(msg));
  return res.sendStatus(200);
});