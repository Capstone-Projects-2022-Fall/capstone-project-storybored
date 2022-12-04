const { fail } = require("assert");
const exp = require("constants");
const { createServer } = require("http");
const { Server } = require("socket.io");
const Client = require("socket.io-client");
const { markAsUntransferable } = require("worker_threads");

describe("Backend testing", () => {
  let io, serverSocket, clientSocket;

  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = httpServer.address().port;
      console.log("listening on ", port);
      clientSocket = new Client(`http://localhost:${port}`);
      io.on("connection", (socket) => {
        serverSocket = socket;
      });
      clientSocket.on("connect", done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  //USERS EVENT TESTING
  //
  //
  test("one user in room", (done) => {
    let ppl = ["bob"];
    let word = ppl.toString();
    serverSocket.emit("users", word);
    clientSocket.once("users", (arg) => {
      expect(arg).toEqual("bob");
      done();
    });
  });

  test("three users in room", (done) => {
    let ppl = ["bob", "mary", "petey"];
    let word = ppl.toString();
    serverSocket.emit("users", word);
    clientSocket.once("users", (arg) => {
      expect(arg).toEqual("bob,mary,petey");
      done();
    });
  });

  test("no users", (done) => {
    let ppl = [];
    let word = ppl.toString();
    serverSocket.emit("users", word);
    clientSocket.once("users", (arg) => {
      expect(arg).toEqual("");
      done();
    });
  });

  //SHAPE MESSAGE TESTING
  //
  //
});
