import React, { useState, useRef, useContext, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { GiPencil, GiSquare, GiCircle, GiLargePaintBrush } from "react-icons/gi";
import Shape from "../shape/Shape";
import Toolbar from "../Toolbar.js";
import "./styles.css";
// import { SocketContext } from "../../socketContext";
import { UsersContext } from "../../usersContext";
import io from 'socket.io-client'
import { Stage, Layer } from "react-konva";
import { NotificationContainer, NotificationManager } from 'react-notifications';

const width = window.innerWidth;
const height = window.innerHeight;
const ENDPOINT = "139.144.172.98:7007"
//const ENDPOINT = "http://localhost:7007";
const socket = io(ENDPOINT, { transports: ["websocket", "polling"] });
const date = new Date();
const room = 4;


const Canvas = ({ shapes, setShapes, username }) => {
  const [tool, setTool] = useState("pen");
  const [strokeColor, setStrokeColor] = useState("#abcdef");
  const [fillColor, setFillColor] = useState("#fedcba");
  const [tempId, setTempId] = useState((tempId) => (tempId = generateId()));
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [showColorSelectors, setShowColorSelectors] = useState(false);
  const isDrawing = useRef(false);
  // const socket = useContext(SocketContext);
  const { setUsers } = useContext(UsersContext);
  const [players, setPlayers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const undoStack = [];
  const redoStack = [];
  var lastShape;
  // const location = useLocation();

  const nickname = username;
  useEffect(() => {
    socket.emit("join", { nickname, room }, (error) => {
      if (error) {
        console.log(error);
        return;
      } else {
        console.log("joined server");
      }
      return;
    })
  }, []);

  function playerHandler(users) {
    setPlayers(users);
  }


  useEffect(() => {
    socket.on("users", (users) => {
      setPlayers(users);
      console.log(users);
    });
    socket.on("message", (msg) => {
      let show = JSON.parse(msg.text);
      // console.log(show);
      let index = shapes.findLastIndex((element) => element.id === show.id);
      console.log(index);
      if (index < 0) {
        console.log("here");
        setShapes(shapes.concat(show));
      } else {
        console.log("there");
        shapes[index] = show;
        setShapes([...shapes])
      }
    });
    socket.on("notification", (notif) => {
      console.log(notif.description);
      NotificationManager.info(notif.description, '', 10000)
    });
    return () => {
      socket.off("notification");
      socket.off("message");
      socket.off("users");
    }
  }, [socket, shapes, setShapes]);

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    //put this in a map or something so we can actually maintain this
    if (tool === "pen") {
      lastShape = {
        type: "line",
        id: tempId,
        points: [pos.x, pos.y, pos.x, pos.y],
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        tension: 0.5,
        lineCap: "round",
        draggable: false,
        user: "test",
      };
    }
    if (tool === "rectangle") {
      lastShape = {
        type: "rectangle",
        id: tempId,
        x: pos.x,
        y: pos.y,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        fill: fillColor,
        width: 5,
        height: 5,
        draggable: false,
        listening: false,
        user: "test",
      };
    }
    if (tool === "circle") {
      lastShape = {
        type: "circle",
        id: tempId,
        x: pos.x,
        y: pos.y,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        radius: 4,
        draggable: false,
        listening: false,
        user: "test",
      };
    }
    if (tool === "eraser") {
      return;
    }
    undoStack.push(lastShape);
    setShapes(shapes.concat(lastShape));
    socket.emit("sendData", JSON.stringify(lastShape));
  };

  const handleMouseMove = (e) => {
    // no drawing - skipping
    if (!isDrawing.current || tool === "eraser") {
      return;
    }
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();

    // let index = shapes.findIndex((element) => element.id === tempId);
    let index = shapes.findLastIndex((element) => element.user === "test");

    if (tool === "pen") {
      let tempLine = shapes[index];
      tempLine.points = tempLine.points.concat([pos.x, pos.y]);
      tempLine.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
      shapes[index] = tempLine;
    }
    if (tool === "rectangle") {
      let tempRect = shapes[index];
      tempRect.width = pos.x - tempRect.x;
      tempRect.height = pos.y - tempRect.y;
      shapes[index] = tempRect;
    }
    if (tool === "circle") {
      let tempCircle = shapes[index];
      let x = pos.x - tempCircle.x;
      let y = pos.y - tempCircle.y;
      let rad = Math.sqrt(x * x + y * y);
      tempCircle.radius = rad;
      shapes[index] = tempCircle;
    }
    // console.log(shapes[index]);
    // console.log(shapes);
    setShapes([...shapes]);
    // console.log(JSON.stringify(shapes.concat()));
    socket.emit("sendData", JSON.stringify(shapes[index]));
  };

  const handleMouseUp = () => {
    let index = shapes.findLastIndex((element) => element.user === "test");
    // if (tool === "select") {
    //   return;
    // }
    lastShape = null;
    setTempId((tempId) => generateId());
    isDrawing.current = false;
    socket.emit("sendData", JSON.stringify(shapes[index]));
  };

  function generateId() {
    let d = new Date();
    let t = d.getTime().toString();
    return t;
  }

  // const handleMouseOver = (e) => {
  //   console.log(e.target.toString());
  // };

  const setPen = () => setTool("pen");
  const setRect = () => setTool("rectangle");
  const setCircle = () => setTool("circle");
  const toggleColorSelectors = () => {
    setShowColorSelectors((prevState) => !prevState);
  };

  //Array containing objects for the toolbar; each object has an onClick function and an icon
  const toolbar_params = [
    { func: setPen, icon: <GiPencil /> },
    { func: setRect, icon: <GiSquare /> },
    { func: setCircle, icon: <GiCircle /> },
    { func: toggleColorSelectors, icon: <GiLargePaintBrush /> },
  ];

  const UserDropdown = () => {
    if (showUsers)
      return players.map(p => <p>{p.nickname}</p>)
  }

  function undo(){
    var toBeUndone = undoStack.pop();
    toBeUndone = shapes.indexOf(toBeUndone);
    shapes.splice(toBeUndone, 1);
    setShapes([...shapes]);
    return;
  }

  return (
    <div className="Container">
      <div className="userList">
        <h3 onClick={() => setShowUsers((prevState) => !prevState)}>Users [v]</h3>
        <UserDropdown />
      </div>
      <Toolbar items={toolbar_params} />

      {showColorSelectors && (
        <div className="Color-Selectors">
          <div className="Stroke">
            <p>Stroke Color</p>
            <HexColorPicker color={strokeColor} onChange={setStrokeColor} />
          </div>
          <div className="Fill">
            <p>Fill Color</p>
            <HexColorPicker color={fillColor} onChange={setFillColor} />
          </div>
        </div>
      )}

      <div className="Canvas-Container">
        <Stage
          className="Canvas"
          width={width - 120}
          height={height - 120}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
        >
          <Layer>
            {shapes.map((shape, i) => (
              <Shape key={i} shape={shape} />
            ))}
          </Layer>
        </Stage>
        <section className="options">
          <div className="tools">
            <div style={{ fontSize: "2em" }}>Tool: {tool}</div>

            <div>
              <div>Stroke width</div>
              <div>
                <input
                  type="number"
                  value={strokeWidth}
                  id="strokebox"
                  onChange={(e) => {
                    setStrokeWidth(parseInt(e.target.value));
                  }}
                ></input>
              </div>
            </div>
          </div>
        </section>
        <button onclick={undo}>Undo</button>
      </div>

      <div className="NotificationContainer">
        <NotificationContainer />
      </div>
    </div>
  );
};

export default Canvas;
