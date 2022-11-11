import React, { useState, useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { GiPencil, GiSquare, GiCircle, GiLargePaintBrush } from "react-icons/gi";
import Shape from "../shape/Shape";
import Toolbar from "../Toolbar.js";
import FrameView from "../FrameView";
import "./styles.css";
// import { SocketContext } from "../../socketContext";
// import { UsersContext } from "../../usersContext";
import io from "socket.io-client";
import { Stage, Layer } from "react-konva";
import { NotificationContainer, NotificationManager } from "react-notifications";

const width = window.innerWidth;
const height = window.innerHeight;
// const ENDPOINT = "139.144.172.98:7007"
const ENDPOINT = "http://localhost:7007";
const socket = io(ENDPOINT, { transports: ["websocket", "polling"] });

const Canvas = ({ shapes, setShapes, username, roomName }) => {
  const [tool, setTool] = useState("pen");
  const [strokeColor, setStrokeColor] = useState("#000"); //black
  const [fillColor, setFillColor] = useState("#fff"); //white
  const [tempId, setTempId] = useState((tempId) => (tempId = generateId()));
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [showColorSelectors, setShowColorSelectors] = useState(false);
  const [undoStack, updateUndoStack] = useState([]);
  const [redoStack, updateRedoStack] = useState([]);
  const isDrawing = useRef(false);
  const [players, setPlayers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);

  const [uri, setUri] = useState("");
  const [updateUri, setUpdateUri] = useState(true);
  let lastShape;
  const stageRef = React.useRef(null);

  const nickname = username;
  const room = roomName;
  useEffect(() => {
    socket.emit("join", { nickname, room }, (error) => {
      if (error) {
        console.log(error);
        return;
      } else {
        console.log("joined server");
      }
      return;
    });

    // socket.emit("updateCanvas", 0, () => {});
  }, []);

  useEffect(() => {
    socket.on("users", (users) => {
      setPlayers(users);
      console.log(users);
    });
    socket.on("message", (msg) => {
      let show = JSON.parse(msg.text);
      //console.log(show);
      if (show.id === null) {
        return;
      }
      let index = shapes.findLastIndex((element) => element.id === show.id);
      //console.log(index);
      if (index < 0) {
        //console.log("here");
        setShapes(shapes.concat(show));
      } else {
        //console.log("there");
        shapes[index] = show;
        setShapes([...shapes]);
      }
    });

    socket.on("deleteshape", (data) => {
      setShapes(shapes.filter((shape) => shape.id !== data));
    });

    socket.on("update", (data) => {
      console.log(data);
    });

    socket.on("notification", (notif) => {
      console.log(notif.description);
      NotificationManager.info(notif.description, "", 6000);
    });
    return () => {
      socket.off("notification");
      socket.off("message");
      socket.off("users");
    };
  }, [socket, shapes, setShapes]);

  //Updating FrameView
  //setTimeout ensures FrameViewImage's are only updated once every 3 seconds, for performance reasons
  useEffect(() => {
    if (updateUri) {
      setUpdateUri(false);
      setUri(stageRef.current.toDataURL());
      setTimeout(() => {
        setUpdateUri(true);
      }, 3000);
      //console.log("URI: " + uri);}
    }
  });

  const handleMouseDown = (e) => {
    // setTempId((tempId) => generateId());
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    try {
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
        updateUndoStack((undoStack) => [...undoStack, tempId]);
        console.log(undoStack.length);
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
        updateUndoStack((undoStack) => [...undoStack, tempId]);
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
        updateUndoStack((undoStack) => [...undoStack, tempId]);
      }
      if (tool === "eraser") {
        return;
      }
      socket.emit("sendData", JSON.stringify(lastShape));
    } catch (err) {
      console.log(err);
      return;
    }
  };

  const handleMouseMove = (e) => {
    try {
      // no drawing - skipping
      if (!isDrawing.current || tool === "eraser") {
        return;
      }
      //get pointer position
      const stage = e.target.getStage();
      const pos = stage.getPointerPosition();

      //get shape and modify properties of shape based on mousedrag
      let index = shapes.findIndex((element) => element.id === tempId);
      //console.log(shapes);
      let tempShape = shapes[index];
      if (tool === "pen") {
        tempShape.points = tempShape.points.concat([pos.x, pos.y]);
      }
      if (tool === "rectangle") {
        tempShape.width = pos.x - tempShape.x;
        tempShape.height = pos.y - tempShape.y;
      }
      if (tool === "circle") {
        let x = pos.x - tempShape.x;
        let y = pos.y - tempShape.y;
        let rad = Math.sqrt(x * x + y * y);
        tempShape.radius = rad;
      }
      socket.emit("sendData", JSON.stringify(tempShape));
    } catch (TypeError) {
      console.log("oops! your tool broke!");
      return;
    }
  };

  const handleMouseUp = () => {
    lastShape = null;
    setTempId((tempId) => generateId());
    isDrawing.current = false;
  };

  function generateId() {
    let d = new Date();
    let t = d.getTime().toString();
    return t;
  }

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
    if (showUsers) return players.map((p) => <p>{p.nickname}</p>);
  };

  function undo() {
    if (undoStack.length === 0) {
      return;
    }
    let toBeUndone = undoStack[undoStack.length - 1];
    updateUndoStack(undoStack.filter((item) => item !== toBeUndone));
    let popped = shapes.filter((element) => element.id === toBeUndone);
    console.log(popped);
    updateRedoStack((redoStack) => [...redoStack, popped]);
    socket.emit("removeShape", toBeUndone);
    return;
  }

  function redo() {
    if (redoStack.length === 0) {
      return;
    }
    let toBeRedone = redoStack[redoStack.length - 1];
    console.log(toBeRedone);
    updateRedoStack(redoStack.filter((item) => item !== toBeRedone));
    let id = toBeRedone.id;
    updateUndoStack((undoStack) => [...undoStack, id]);
    socket.emit("sendData", JSON.stringify(toBeRedone));
    return;
  }

  //

  return (
    <div className="Container" style={{ maxWidth: width }}>
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
          width={width - 560}
          height={height - 120}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          ref={stageRef}
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
              {/* <div> */}
              <button onClick={undo}>Undo</button>
              <button onClick={redo}>Redo</button>
              {/* </div> */}
            </div>
          </div>
        </section>
      </div>

      <div className="RightContainer" style={{ height: height - 120 }}>
        <div className="NotificationContainer">
          <NotificationContainer />
        </div>

        <>
          <FrameView numFrames={3} frame={uri} width={width} height={height} />
        </>
      </div>
    </div>
  );
};

export default Canvas;

// const shape_preset_map = new Map([
//     [
//       "pen",
//       {
//         type: "line",
//         id: tempId,
//         points: [pos.x, pos.y, pos.x, pos.y],
//         stroke: strokeColor,
//         strokeWidth: strokeWidth,
//         tension: 0.5,
//         lineCap: "round",
//         draggable: false,
//         user: "test",
//       },
//     ],
//     [
//       "rectangle",
//       {
//         type: "rectangle",
//         id: tempId,
//         x: pos.x,
//         y: pos.y,
//         stroke: strokeColor,
//         strokeWidth: strokeWidth,
//         fill: fillColor,
//         width: 5,
//         height: 5,
//         draggable: false,
//         listening: false,
//         user: "test",
//       },
//     ],
//     [
//       "circle",
//       {
//         type: "circle",
//         id: tempId,
//         x: pos.x,
//         y: pos.y,
//         fill: fillColor,
//         stroke: strokeColor,
//         strokeWidth: strokeWidth,
//         radius: 4,
//         draggable: false,
//         listening: false,
//         user: "test",
//       },
//     ],
//   ]);
