var express = require("express");
var http = require("http");
var path = require("path");
var jwt = require("jsonwebtoken");
var uuid = require("uuid");
var dotenv = require("dotenv").config();
var cors = require("cors");
const { map } = require("bluebird");
const { response } = require("express");
//

const PORT = 7007;
// const shape_map = new Map();

/**
 * Creates endpoints for HTTP response and requests.
 */
const app = express();
//  app.use("/static", express.static(`${__dirname}/static`));
app.use(express.json());
app.use(cors());
app.locals.index = 1000000000;
// const connected_clients = []; //const refernce, mutable array
// set up ping interval and ping timeout here
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

const rooms = new Map();

const addUser = (id, nickname, room) => {
  if (!rooms.has(room)) {
    rooms.set(room, {
      id: room,
      users: [],
      URIs: ["", "", ""],
      shapes: [new Map(), new Map(), new Map()],
    });
  }
  for (c in rooms.get(room).users) {
    if (c.id === id && c.room === room) {
      return;
    }
  }
  if (!nickname) return { error: "Username is required" };
  if (!room) return { error: "Room is required" };
  const user = { id, nickname, room };
  rooms.get(room).users.push(user);
  return { user };
};

const getUser = (room, id) => {
  if (!rooms.has(room)) {
    return;
  }
  let user = rooms.get(room).users.find((user) => user.id == id);
  return user;
};

const getUsers = (room) => {
  if (!rooms.has(room)) {
    return;
  }
  return rooms.get(room).users;
};

const removeUser = (id) => {
  //change to get passed a user object
  for (let room of rooms.values()) {
    const index = room.users.findIndex((user) => user.id === id);
    if (index !== -1) {
      return room.users.splice(index, 1)[0];
    }
  }
};

//creating event handlers for socket message received events
io.on("connection", (socket) => {
  socket.on("join", ({ nickname, room }, callback) => {
    const { user, error } = addUser(socket.id, nickname, room);
    if (error) {
      return callback(error);
    }
    socket.join(room);
    console.log(`${user.nickname} joined ${user.room}`);
    io.to(user.room).emit("notification", { title: "Someone joined", description: `${user.nickname} joined` });
    io.to(user.room).emit("users", getUsers(user.room));
    // updateClient(socket.id, socket);
    callback();
  });

  socket.on("sendData", (room, focus, data) => {
    const user = getUser(room, socket.id);
    if (!rooms.has(user.room)) {
      return;
    }
    let shape = JSON.parse(data);
    if (shape.id === null) {
      return;
    }
    rooms.get(user.room).shapes[focus].set(shape.id, shape);
    let response = JSON.stringify(rooms.get(user.room).shapes[focus].get(shape.id));
    if (!user) return;
    io.to(user.room).emit("message", { user: user.nickname, text: response, frame: focus });
  });

  socket.on("updateCanvas", (room, data) => {
    const user = getUser(room, socket.id);
    if (!rooms.has(room)) {
      return;
    }
    const msg = JSON.stringify(Object.fromEntries(rooms.get(user.room).shapes[data]));
    io.to(user.id).emit("update", { message: msg });
  });

  socket.on("removeShape", (room, focus, data) => {
    const user = getUser(room, socket.id);
    if (!rooms.has(user.room)) {
      return;
    }
    rooms.get(user.room).shapes[focus].delete(data);
    io.to(user.room).emit("deleteshape", data);
  });

  socket.on("getFrames", (room) => {
    if (!rooms.has(room)) {
      return;
    }
    let response = rooms.get(room).URIs;
    io.to(room).emit("setFrames", response);
  });

  socket.on("updateFrames", (room, canvas, data) => {
    if (!rooms.has(room)) {
      return;
    }
    rooms.get(room).URIs[canvas] = data;
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      console.log(`${user.nickname} left the server`);
      io.to(user.room).emit("notification", { title: "Someone left", description: `${user.nickname} left` });
      io.to(user.room).emit("users", getUsers(user.room));
      if (rooms.get(user.room).users.length == 0) {
        rooms.delete(user.room);
      }
    }
  });
});

app.get("/", (req, res) => {
  // req.send("Server is up");
});

server.listen(PORT, () => {
  console.log(`Listening to ${PORT}`);
});
