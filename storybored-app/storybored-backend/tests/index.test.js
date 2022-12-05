const { fail } = require("assert");
const exp = require("constants");
const { createServer } = require("http");
const { Server } = require("socket.io");
const Client = require("socket.io-client");
const { markAsUntransferable } = require("worker_threads");

describe("Canvas Synchronization Tests", () => {
  let io, serverSocket, clientSocket;
  const NEWSHAPE = {
    type: "circle",
    id: "a",
    x: 15,
    y: 20,
    fill: "red",
    stroke: "black",
    strokeWidth: 4,
    radius: 4,
    draggable: false,
    listening: true,
    user: "test",
    rotation: 0,
  };

  const NEWSHAPERESULTARRAY = [NEWSHAPE];

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
  test("new shape empty canvas same frame", (done) => {
    const focusedCanvas = 0;
    shapes = [];
    let send = JSON.stringify({ user: "test", text: NEWSHAPE, frame: 0 });
    serverSocket.emit("message", send);
    clientSocket.once("message", (msg) => {
      let show = JSON.parse(msg.text);
      let frame = JSON.parse(msg.frame);
      if (frame !== focusedCanvas) {
        return;
      }

      let index = shapes.findLastIndex((element) => element.id === show.id);
      if (index < 0) {
        shapes = shapes.concat(msg);
        expect(shapes).toEqual(NEWSHAPERESULTARRAY.toString());
        done();
      } else {
        fail();
      }
    });
  });

  test("new shape some shapes canvas", (done) => {
    const focusedCanvas = 0;
    shapes = [
      {
        type: "circle",
        id: "b",
        x: 15,
        y: 20,
        fill: "red",
        stroke: "black",
        strokeWidth: 4,
        radius: 4,
        draggable: false,
        listening: true,
        user: "test",
        rotation: 0,
      },
      {
        type: "circle",
        id: "c",
        x: 15,
        y: 20,
        fill: "red",
        stroke: "black",
        strokeWidth: 4,
        radius: 4,
        draggable: false,
        listening: true,
        user: "test",
        rotation: 0,
      },
    ];
    let send = JSON.stringify({ user: "test", text: NEWSHAPE, frame: 0 });
    serverSocket.emit("message", send);
    clientSocket.once("message", (msg) => {
      let show = JSON.parse(msg.text);
      let frame = JSON.parse(msg.frame);
      if (frame !== focusedCanvas) {
        return;
      }

      let index = shapes.findLastIndex((element) => element.id === show.id);
      if (index < 0) {
        shapes = shapes.concat(msg);
        expect(shapes).toEqual(
          [
            {
              type: "circle",
              id: "b",
              x: 15,
              y: 20,
              fill: "red",
              stroke: "black",
              strokeWidth: 4,
              radius: 4,
              draggable: false,
              listening: true,
              user: "test",
              rotation: 0,
            },
            {
              type: "circle",
              id: "c",
              x: 15,
              y: 20,
              fill: "red",
              stroke: "black",
              strokeWidth: 4,
              radius: 4,
              draggable: false,
              listening: true,
              user: "test",
              rotation: 0,
            },
            {
              type: "circle",
              id: "a",
              x: 15,
              y: 20,
              fill: "red",
              stroke: "black",
              strokeWidth: 4,
              radius: 4,
              draggable: false,
              listening: true,
              user: "test",
              rotation: 0,
            },
          ].toString()
        );
        done();
      } else {
        fail();
      }
    });
  });

  test("modify shape some shapes canvas", (done) => {
    let shapes = [
      {
        type: "circle",
        id: "a",
        x: 35,
        y: 20,
        fill: "red",
        stroke: "black",
        strokeWidth: 4,
        radius: 4,
        draggable: false,
        listening: true,
        user: "test",
        rotation: 0,
      },
    ];
    const focusedCanvas = 0;
    let send = JSON.stringify({ user: "test", text: NEWSHAPE, frame: 0 });
    serverSocket.emit("message", send);
    clientSocket.once("message", (msg) => {
      let show = JSON.parse(msg.text);
      let frame = JSON.parse(msg.frame);
      if (frame !== focusedCanvas) {
        return;
      }

      let index = shapes.findLastIndex((element) => element.id === show.id);
      if (index < 0) {
        fail();
      } else {
        shapes[index] = show;
        expect(shapes).toEqual(NEWSHAPERESULTARRAY.toString());
        done();
      }
    });
  });

  test("shape message on different frame", (done) => {
    const focusedCanvas = 0;
    shapes = [];
    let send = JSON.stringify({ user: "test", text: NEWSHAPE, frame: 0 });
    serverSocket.emit("message", send);
    clientSocket.once("message", (msg) => {
      let show = JSON.parse(msg.text);
      let frame = JSON.parse(msg.frame);
      if (frame !== focusedCanvas) {
        done();
      }

      let index = shapes.findLastIndex((element) => element.id === show.id);
      if (index < 0) {
        shapes = shapes.concat(msg);
        fail();
      } else {
        fail();
      }
    });
  });

  test("delete shape correct canvas", (done) => {
    shapes = [
      {
        type: "circle",
        id: "b",
        x: 15,
        y: 20,
        fill: "red",
        stroke: "black",
        strokeWidth: 4,
        radius: 4,
        draggable: false,
        listening: true,
        user: "test",
        rotation: 0,
      },
      {
        type: "circle",
        id: "a",
        x: 15,
        y: 20,
        fill: "red",
        stroke: "black",
        strokeWidth: 4,
        radius: 4,
        draggable: false,
        listening: true,
        user: "test",
        rotation: 0,
      },
    ];
    const focused = 0;
    serverSocket.emit("deleteshape", "b");
    clientSocket.once("deleteshape", (msg) => {
      shapes.filter(shapes.id !== msg);
      expect(shapes).toEqual(NEWSHAPERESULTARRAY);
      done();
    });
  });

  test("delete shape wrong canvas", (done) => {
    shapes = [
      {
        type: "circle",
        id: "b",
        x: 15,
        y: 20,
        fill: "red",
        stroke: "black",
        strokeWidth: 4,
        radius: 4,
        draggable: false,
        listening: true,
        user: "test",
        rotation: 0,
      },
      {
        type: "circle",
        id: "a",
        x: 15,
        y: 20,
        fill: "red",
        stroke: "black",
        strokeWidth: 4,
        radius: 4,
        draggable: false,
        listening: true,
        user: "test",
        rotation: 0,
      },
    ];
    const focused = a;
    serverSocket.emit("deleteshape", "b");
    clientSocket.once("deleteshape", (msg) => {
      shapes.filter(shapes.id !== msg);
      expect(shapes).toEqual([
        {
          type: "circle",
          id: "b",
          x: 15,
          y: 20,
          fill: "red",
          stroke: "black",
          strokeWidth: 4,
          radius: 4,
          draggable: false,
          listening: true,
          user: "test",
          rotation: 0,
        },
        {
          type: "circle",
          id: "a",
          x: 15,
          y: 20,
          fill: "red",
          stroke: "black",
          strokeWidth: 4,
          radius: 4,
          draggable: false,
          listening: true,
          user: "test",
          rotation: 0,
        },
      ]);
      done();
    });
  });
});
