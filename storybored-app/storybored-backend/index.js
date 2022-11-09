var express = require("express");
var http = require("http");
var path = require("path");
var jwt = require("jsonwebtoken");
var uuid = require("uuid");
var dotenv = require("dotenv").config();
var cors = require("cors");
const { map } = require("bluebird");
//

const PORT = 7007;
const shape_map = new Map();

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
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

const addUser = (id, nickname, room) => {
  for (c in connected_clients) {
    if (c.id === id && c.room === room) {
      return;
    }
  }
  if (!nickname) return { error: "Username is required" };
  if (!room) return { error: "Room is required" };
  const user = { id, nickname, room };
  connected_clients.push(user);
  return { user };
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

// async function updateClient(socketId, socket) {
//   for (let shape of shape_map.keys()) {
//     let response = JSON.stringify(shape);
//     io.to(socketId).emit("message", { user: response.user, text: response });
//   }
// }

//creating event handlers for socket message received events
io.on("connection", (socket) => {
  socket.on("join", ({ nickname, room }, callback) => {
    const { user, error } = addUser(socket.id, nickname, room);
    if (error) {
      return callback(error);
    }
    socket.join(room);
    console.log(`${user.nickname} joined`);
    socket.broadcast.emit("notification", { title: "Someone joined", description: `${user.nickname} joined` });
    io.emit("users", getUsers());
    // updateClient(socket.id, socket);
    callback();
  });

  socket.on("sendData", (data) => {
    const user = getUser(socket.id);
    let shape = JSON.parse(data);
    shape_map.set(shape.id, shape);
    let response = JSON.stringify(shape_map.get(shape.id));
    if (!user) return;
    io.to(user.room).emit("message", { user: user.nickname, text: response });
  });

  socket.on("removeShape", (data) => {
    console.log(data);
    console.log(shape_map);
    const user = getUser(socket.id);
    shape_map.delete(data);
    io.to(user.room).emit("deleteshape", data);
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      console.log(`${user.nickname} left the server`);
      io.emit("notification", { title: "Someone left", description: `${user.nickname} left` });
      io.emit("users", getUsers());
    }
    if (connected_clients.length == 0) {
      shape_map.clear();
    }
  });
});

app.get("/", (req, res) => {
  // req.send("Server is up");
});

server.listen(PORT, () => {
  console.log(`Listening to ${PORT}`);
});
