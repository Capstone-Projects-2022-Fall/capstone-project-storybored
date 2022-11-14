import React, { useState, useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { GiPencil, GiSquare, GiCircle, GiPointing } from "react-icons/gi";
import { BsFillEraserFill, BsTypeBold } from "react-icons/bs";
import { BiShapePolygon } from "react-icons/bi";
import Shape from "../shape/Shape";
import Toolbar from "../Toolbar.js";
import FrameView from "../FrameView";
import "./styles.css";
import io from "socket.io-client";
import { Stage, Layer } from "react-konva";
import { NotificationContainer, NotificationManager } from "react-notifications";

const width = 1600;
const height = 800;
const ENDPOINT = "139.144.172.98:7007";
// const ENDPOINT = "http://localhost:7007";
const socket = io(ENDPOINT, { transports: ["websocket", "polling"] });

const Canvas = ({ shapes, setShapes, username, roomName }) => {
  const [tool, setTool] = useState("pen");
  const [strokeColor, setStrokeColor] = useState("#000"); //black
  const [fillColor, setFillColor] = useState("#fff"); //white
  const [tempId, setTempId] = useState((tempId) => (tempId = generateId()));
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [undoStack, updateUndoStack] = useState([]);
  const [redoStack, updateRedoStack] = useState([]);
  const isDrawing = useRef(false);
  const isModding = useRef(false);
  const [players, setPlayers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const [focusedCanvas, setFocusedCanvas] = useState(0);
  //usestate to keep track of index of focused canvas
  const [uri, setUri] = useState([]);
  const [updateUri, setUpdateUri] = useState(true);
  const [selectOption, setSelectOption] = useState("drag");
  let lastShape;
  let modShape;
  const stageRef = React.useRef(null);
  const nickname = username;
  const room = roomName;
  const drawing_tools = ["pen", "rectangle", "circle", "custom shape", "words"];

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
  }, []);

  useEffect(() => {
    socket.emit("updateCanvas", room, focusedCanvas);
  }, [focusedCanvas]);

  useEffect(() => {
    socket.on("users", (users) => {
      setPlayers(users);
      console.log(users);
    });

    socket.on("message", (msg) => {
      let show = JSON.parse(msg.text);
      let frame = JSON.parse(msg.frame);
      //   console.log(frame);
      if (show.id === null || frame !== focusedCanvas) {
        return;
      }
      let index = shapes.findLastIndex((element) => element.id === show.id);
      if (index < 0) {
        setShapes(shapes.concat(show));
      } else {
        shapes[index] = show;
        setShapes([...shapes]);
      }
    });

    socket.on("deleteshape", (data) => {
      setShapes(shapes.filter((shape) => shape.id !== data));
    });

    socket.on("update", (data) => {
      let shape_update = new Map(Object.entries(JSON.parse(data.message)));
      let fresh_shapes = Array.from(shape_update.values());
      //   console.log(fresh_shapes);
      setShapes((shapes) => [...fresh_shapes]);
      //   console.log(shapes);
    });

    socket.on("notification", (notif) => {
      console.log(notif.description);
      NotificationManager.info(notif.description, "", 6000);
    });

    socket.on("setFrames", (data) => {
      setUri(data);
    });

    return () => {
      socket.off("notification");
      socket.off("message");
      socket.off("users");
      socket.off("deleteshape");
      socket.off("update");
      socket.off("setFrames");
    };
  }, [socket, shapes, setShapes]);

  //Updating FrameView
  //setTimeout ensures FrameViewImage's are only updated once every 3 seconds, for performance reasons
  useEffect(() => {
    if (updateUri) {
      setUpdateUri(false);
      socket.emit("updateFrames", room, focusedCanvas, stageRef.current.toDataURL());
      socket.emit("getFrames", room);
      //   setUri(stageRef.current.toDataURL());
      setTimeout(() => {
        setUpdateUri(true);
      }, 3000);
      //console.log("URI: " + uri);}
    }
  });

  /**MOUSEDOWN EVENT HANDLER FUNCTION
   *
   */
  const handleMouseDown = (e) => {
    // setTempId((tempId) => generateId());
    const pos = e.target.getStage().getPointerPosition();
    try {
      if (drawing_tools.includes(tool)) {
        console.log("here");
        isDrawing.current = true;
        lastShape = initializeShape(tool, pos);
        updateUndoStack((undoStack) => [...undoStack, tempId]);
        socket.emit("sendData", room, focusedCanvas, JSON.stringify(lastShape));
      } else if (tool === "select") {
        if (e.target.attrs.className === "Canvas") {
          return;
        }
        isModding.current = true;
        let i = shapes.findIndex((element) => element.id === e.target.attrs.id);
        modShape = shapes[i];
        console.log(modShape);
      } else if (tool === "erase") {
        if (e.target.attrs.className === "Canvas") {
          return;
        }
        console.log("here");
        console.log(e.target.attrs.id);
        socket.emit("removeShape", room, e.target.attrs.id);
      }
      return;
    } catch (err) {}
  };

  /**MOUSEMOVE EVENT HANDLER FUNCTION
   *
   * @param {*}
   * @returns
   */
  const handleMouseMove = (e) => {
    try {
      // no drawing - skipping
      if ((!isDrawing.current && tool !== "select") || tool === "erase" || tool == "words") {
        return;
      }
      //get pointer position
      const stage = e.target.getStage();
      const pos = stage.getPointerPosition();
      if (drawing_tools.includes(tool)) {
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
        if (tool === "custom shape") {
          tempShape.points = tempShape.points.concat([pos.x, pos.y]);
        }
        socket.emit("sendData", room, focusedCanvas, JSON.stringify(tempShape));
        return;
      }
      if (isModding.current && tool === "select") {
        let i = shapes.findIndex((element) => element.id === e.target.attrs.id);
        modShape = shapes[i];
        if (modShape.type === "circle") {
          if (selectOption === "drag") {
            modShape.x = pos.x;
            modShape.y = pos.y;
          }
          if (selectOption === "rotateR" || selectOption === "rotateL") {
            let sum = selectOption === "rotateR" ? 1 : -1;
            modShape.rotation = modShape + sum;
          }
        }
        if (modShape.type === "rectangle") {
          if (selectOption === "drag") {
            modShape.x = pos.x - modShape.width / 2;
            modShape.y = pos.y - modShape.height / 2;
          }
          if (selectOption === "rotateR" || selectOption === "rotateL") {
            let sum = selectOption === "rotateR" ? 1 : -1;
            modShape.rotation = modShape.rotation + sum;
          }
        }
        if (modShape.type === "line") {
          if (selectOption === "drag") {
            modShape.offsetX = -(pos.x - modShape.points[0]);
            modShape.offsetY = -(pos.y - modShape.points[1] - 10);
          }
          if (selectOption === "rotateR" || selectOption === "rotateL") {
            let sum = selectOption === "rotateR" ? 1 : -1;
            modShape.rotation = modShape + sum;
          }
        }
        socket.emit("sendData", room, focusedCanvas, JSON.stringify(modShape));
      }
    } catch (err) {
      console.log(err);
      return;
    }
  };

  /***MOUSEUP EVENT HANDLER FUNCTION
   *
   */
  const handleMouseUp = () => {
    lastShape = null;
    setTempId((tempId) => generateId());
    isDrawing.current = false;
    isModding.current = false;
  };

  function generateId() {
    let d = new Date();
    let t = d.getTime().toString();
    return t;
  }

  const setPen = () => setTool("pen");
  const setRect = () => setTool("rectangle");
  const setCircle = () => setTool("circle");
  const setCustom = () => setTool("custom shape");
  const setSelect = () => setTool("select");
  const setErase = () => setTool("erase");
  const setWords = () => setTool("words");

  //Array containing objects for the toolbar; each object has an onClick function and an icon
  const toolbar_params = [
    { func: setPen, icon: <GiPencil /> },
    { func: setRect, icon: <GiSquare /> },
    { func: setCircle, icon: <GiCircle /> },
    { func: setCustom, icon: <BiShapePolygon /> },
    { func: setSelect, icon: <GiPointing /> },
    { func: setErase, icon: <BsFillEraserFill /> },
    { func: setWords, icon: <BsTypeBold /> },
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
    socket.emit("removeShape", room, toBeUndone);
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
    socket.emit("sendData", room, focusedCanvas, JSON.stringify(toBeRedone));
    return;
  }

  function initializeShape(tool, pos) {
    let newShape;
    if (tool === "pen") {
      newShape = {
        type: "line",
        id: tempId,
        points: [pos.x, pos.y, pos.x, pos.y],
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        tension: 0.5,
        lineCap: "round",
        draggable: false,
        listening: true,
        user: "test",
        rotation: 0,
      };
    }
    if (tool === "rectangle") {
      newShape = {
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
        listening: true,
        user: tool,
        rotation: 0,
      };
    }
    if (tool === "circle") {
      newShape = {
        type: "circle",
        id: tempId,
        x: pos.x,
        y: pos.y,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        radius: 4,
        draggable: false,
        listening: true,
        user: "test",
        rotation: 0,
      };
    }
    if (tool === "custom shape") {
      newShape = {
        type: "line",
        id: tempId,
        points: [pos.x, pos.y, pos.x, pos.y],
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        fill: fillColor,
        closed: true,
        tension: 0.5,
        lineCap: "round",
        draggable: false,
        listening: true,
        user: "test",
        offsetX: 0,
        offsetY: 0,
        rotation: 0,
      };
    }
    if (tool === "words") {
      newShape = {
        type: "words",
        id: tempId,
        x: pos.x,
        y: pos.y,
        text: "hello there",
        draggable: false,
        listening: true,
        rotation: 0,
      };
    }
    return newShape;
  }

  return (
    <div className="Container" style={{ maxWidth: width }}>
      <div className="userList">
        <h3 onClick={() => setShowUsers((prevState) => !prevState)}>Users [v]</h3>
        <UserDropdown />
      </div>
      <Toolbar items={toolbar_params} />

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
          {/* <div className="tools"> */}
          <div className="tools" style={{ fontSize: "2em", maxWidth: "200px" }}>
            Tool: {tool}
          </div>

          {/* <div> */}
          <div className="tools" style={{ fontSize: "1.5em" }}>
            <div>Stroke width</div>
            <div>
              <input
                type="number"
                value={strokeWidth}
                id="strokebox"
                onChange={(e) => {
                  setStrokeWidth(parseInt(e.target.value));
                  //   console.log(focusedCanvas);
                }}
              ></input>
            </div>
          </div>
          <div className="tools" style={{ fontSize: "1.2em", maxHeight: "140px" }}>
            <p>Stroke Color</p>
            <HexColorPicker color={strokeColor} onChange={setStrokeColor} />
          </div>
          <div className="tools" style={{ fontSize: "1.2em", maxHeight: "140px" }}>
            <p>Fill Color</p>
            <HexColorPicker color={fillColor} onChange={setFillColor} />
          </div>
          <div className="tools" style={{ fontSize: "1.5em" }}>
            <button onClick={undo}>Undo</button>
            <button onClick={redo}>Redo</button>
            <div>
              <label htmlFor="modepicker">Select Tool Mode:</label>
              <select
                name="modepicker"
                id="modepicker"
                value={selectOption}
                onChange={(e) => {
                  setSelectOption(e.target.value);
                }}
              >
                <option value="drag">Drag</option>
                <option value="rotateR">Rotate Clockwise</option>
                <option value="rotateL">Rotate Counter Clockwise</option>
              </select>
            </div>
          </div>
          <div className="tools" style={{ fontSize: "1.5em" }}>
            <label htmlFor="framepicker">Current Frame:</label>
            <select
              name="framepicker"
              id="framepicker"
              value={focusedCanvas}
              onChange={(e) => {
                setFocusedCanvas(parseInt(e.target.value));
                let empty_stack = [];
                updateUndoStack([...empty_stack]);
                updateRedoStack([...empty_stack]);
                // console.log(focusedCanvas);
                socket.emit("updateCanvas", room, focusedCanvas);
              }}
            >
              <option value="0">Frame 1</option>
              <option value="1">Frame 2</option>
              <option value="2">Frame 3</option>
            </select>
          </div>
          {/* </div> */}
          {/* </div> */}
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
