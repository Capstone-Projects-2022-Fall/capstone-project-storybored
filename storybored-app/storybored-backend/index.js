var express = require("express");
var http = require("http");
var path = require("path");
var jwt = require("jsonwebtoken");
var uuid = require("uuid");
var dotenv = require("dotenv").config();
// var redis = require("ioredis");
var bluebird = require("bluebird");
var cors = require("cors");
const { Socket } = require("dgram");
const { callbackify } = require("util");
//

const PORT = 7007;

// let address = "127.0.0.0";

/**
 * Creates endpoints for HTTP response and requests.
 */
const app = express();
//  app.use("/static", express.static(`${__dirname}/static`));
app.use(express.json());
app.use(cors());
app.locals.index = 1000000000;
const connected_clients = []; //const refernce, mutable array
const server = http.createServer(app);
const io = require("socket.io")(server,
  { cors:{
    origin: "*",
    }});

const addUser = (id, nickname, room) => {

  if (!nickname) return { error: "Username is required" }
  if (!room) return { error: "Room is required" }
  const user = { id, nickname, room };
  connected_clients.push(user);
  return {user};
};

const getUser = (id) => {
  let user = connected_clients.find((user) => user.id == id);
  return user;
};

const getUsers = () => {
  return connected_clients;
};

const removeUser = (id) => {
  const index = connected_clients.findIndex((user) => user.id == id);
  if (index !== -1) {
    return connected_clients.splice(index, 1)[0];
  }
};

/**
 * Used to listen for API calls on selected port
 */


//creating event handlers for socket message received events
io.on("connection", (socket) => {
  socket.on("join", ({ nickname, room }, callback) => {
    const { user, error } = addUser(socket.id, nickname, room);
    if (error) {
      return callback(error);
    }
    console.log(`${user.name} joined`);
    socket.broadcast.emit("notification", { title: "Someone joined", description: `${user.name} joined` });
    io.emit("users", getUsers());
    callback();
  });

  socket.on("sendData", (data) => {
    const user = getUser(socket.id);
    if(!user) return;
    io.emit("message", { user: user.nickname, text: data });
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      console.log("user disconnected from server");
      io.emit("notification", { title: "Someone left", description: `${user.name} left` });
      io.emit("users", getUsers());
    }
  });
});

app.get("/", (req, res) => {
  req.send("Server is up");
});

server.listen(PORT, () => {
  console.log(`Listening to ${PORT}`);
});
