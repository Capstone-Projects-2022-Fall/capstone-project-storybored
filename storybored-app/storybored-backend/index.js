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

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

const rooms = new Map();
// let room_data = {
//   id: "test",
//   users: [],
//   URI: "",
//   shapes: new Map(),
// };
//need to route to room and then to user to update local data
const addUser = (id, nickname, room) => {
  if (!rooms.contains(room)) {
    rooms.put(room, {
      id: room,
      users: [],
      URI: "",
      shapes: new Map(),
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
  let user = rooms.get(user).find((user) => user.id == id);
  return user;
};

const getUsers = () => {
  return room_data.users;
};

const removeUser = (id) => {
  const index = room_data.users.findIndex((user) => user.id == id);
  if (index !== -1) {
    return room_data.users.splice(index, 1)[0];
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
    console.log(`${user.nickname} joined`);
    socket.broadcast.emit("notification", { title: "Someone joined", description: `${user.nickname} joined` });
    io.emit("users", getUsers());
    // updateClient(socket.id, socket);
    callback();
  });

  socket.on("sendData", (data) => {
    const user = getUser(socket.id);
    let shape = JSON.parse(data);
    room_data.shapes.set(shape.id, shape);
    let response = JSON.stringify(room_data.shapes.get(shape.id));
    if (!user) return;
    io.to(user.room).emit("message", { user: user.nickname, text: response });
  });

  socket.on("updateCanvas", (data) => {
    const user = getUser(socket.id);
    const msg = JSON.stringify(Object.fromEntries(room_data.shapes));
    io.to(user.id).emit("update", { message: msg });
  });

  socket.on("removeShape", (data) => {
    // console.log(data);
    // console.log(room_data.shapes);
    const user = getUser(socket.id);
    room_data.shapes.delete(data);
    io.to(user.room).emit("deleteshape", data);
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      console.log(`${user.nickname} left the server`);
      io.emit("notification", { title: "Someone left", description: `${user.nickname} left` });
      io.emit("users", getUsers());
    }
    if (room_data.users.length == 0) {
      room_data.shapes.clear();
    }
  });
});

app.get("/", (req, res) => {
  // req.send("Server is up");
});

server.listen(PORT, () => {
  console.log(`Listening to ${PORT}`);
});
