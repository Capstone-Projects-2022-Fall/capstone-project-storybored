var express = require("express");
var http = require("http");
var path = require("path");
var jwt = require("jsonwebtoken");
var uuid = require("uuid");
var dotenv = require("dotenv");
var redis = require("redis");
var bluebird = require("bluebird");
bluebird.promisifyAll(redis);

dotenv.config();

//setup express server
const app = express();
app.use("/static", express.static(`${__dirname}/static`));
app.use(express.json());
app.locals.index = 1000000000;

const server = http.createServer(app);
const connected_clients = {}; //const refernce, mutable array

const redisClient = redis.createClient();
/**
 * Authenticate JWT for incoming requests
 * @param {request object} req
 * @param {response object} res
 * @param {function} next
 */
function authenticate(req, res, next) {
  let token;
  if (req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.query.token) {
    token = req.query.token;
  }
  if (typeof token !== "string") {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
  });
  req.user = user;
  next();
}

/**
 * Remove a client from the connection list. Updates all connected peers
 * @param {client object} client containing a UUID
 */
async function disconnect(client) {
  delete connected_clients[client.id];
  await redisClient.delAsync(`messages:${client.id}`);

  let roomIDs = await redisClient.smembersAsync(`${client.id}:channels`);
  await redisClient.delAsync(`${client.id}:channels`);

  await Promise.all(
    roomIDs.map(async (roomID) => {
      await redisClient.sremAsync(`channels:${roomId}`, client.id);
      let peerIDs = await redisClient.smembersAsync(`channels:${roomID}`);
      let msg = JSON.stringify({
        event: "remove-peer",
        data: { peer: client.user, roomID: roomID },
      });
      await Promise.all(
        peerIDs.map(async (peerID) => {
          if (peerID !== client.id) {
            await redisClient.publish(`messages:${peerID}`, msg);
          }
      }));
    })
  );
}

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

  const token = jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: "3600s" });
  return res.json({ token });
});

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
  res.setHeader("Access-Control-Allow-Origin");
  res.flushHeaders();

  //setup new client
  let client = {
    id: req.user.id,
    user: req.user,
    redis: redis.createClient(),
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
 *Directs a client to a unique room
 *@param {PATH} '/:roomID' endpoint for API call
 *@param {function} authenticate function used to authenticate JWT
 *@param {HTTP handler function} (req, res) function for processing get HTTP request and response
 */
app.get("/:roomID", authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, "static/index.html"));
});

/**
 * Communicates to all connected clients that a new user has joined, generates an offer to setup peer connections
 * @param {PATH} '/:roomID/join' endpoint for API call
 * @param {function} authenticate function used to authenticate JWT
 * @param {async HTTP handler function}(req, res) function for processing post HTTP request and response
 */
app.post("/:roomID/join", authenticate, async (req, res) => {
  let roomID = req.params.roomID;

  await redisClient.saddAsync(`${req.user.id}:channels`, roomID);

  let peerIDs = await redisClient.smembersAsync(`channels:${roomID}`);
  peerIDs.forEach(peerID => {
    redisClient.publish(
      `messages:${peerID}`,
      JSON.stringify({
        event: "add-peer",
        data: { peer: req.user, roomID, offer: false }
      }));

    redisClient.publish(
      `messages:${req.user.id}`,
      JSON.stringify({
        event: "add-peer",
        data: {
          peer: { id: peerID },
          roomID,
          offer: true,
        }
	}));
  });

  await redisClient.saddAsync(`channels:${roomID}`, req.user.id);
  return res.sendStatus(200);
});

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
		data:{ peer: req.user , data: req.body}
	};

	redisClient.publish(`messages:${peerID}`, JSON.stringify(msg));
	return res.sendStatus(200);
});

server.listen(process.env.PORT || 7007, () => {
  console.log(`started server on port ${server.address().port}`);
});
