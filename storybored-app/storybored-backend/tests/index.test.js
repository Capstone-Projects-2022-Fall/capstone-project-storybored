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

  test("should work", (done) => {
    clientSocket.on("users", (users) => {
      expect(users).toBe(["bob", "mary"]);
      done();
    });
    serverSocket.emit("users", ["bob", "mary"]);
  });
});
