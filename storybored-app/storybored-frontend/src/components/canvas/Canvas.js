import React, { useState, useRef,  useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { GiPencil, GiSquare, GiCircle, GiLargePaintBrush } from "react-icons/gi";
import { BiShapePolygon} from "react-icons/bi";
import Shape from "../shape/Shape";
import Toolbar from "../Toolbar.js";
import FrameView from "../FrameView";
import "./styles.css";
// import { SocketContext } from "../../socketContext";
// import { UsersContext } from "../../usersContext";
import io from 'socket.io-client'
import { Stage, Layer } from "react-konva";
import { NotificationContainer, NotificationManager } from 'react-notifications';

const width = window.innerWidth;
const height = window.innerHeight;
//const ENDPOINT = "139.144.172.98:7007"
const ENDPOINT = "http://localhost:7007";
const socket = io(ENDPOINT, { transports: ["websocket", "polling"] });

const room = 4;


const Canvas = ({ shapes, setShapes, username }) => {
  const [tool, setTool] = useState("pen");
  const [strokeColor, setStrokeColor] = useState("#000"); //black
  const [fillColor, setFillColor] = useState("#fff"); //white
  const [tempId, setTempId] = useState((tempId) => (tempId = generateId()));
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [showColorSelectors, setShowColorSelectors] = useState(false);
  const isDrawing = useRef(false);
  // const socket = useContext(SocketContext);
//   const { setUsers } = useContext(UsersContext);
  const [players, setPlayers] = useState([]);

  const [uri, setUri] = useState('')
  const [updateUri, setUpdateUri] = useState(true)
  const [frameIndex, setFrameIndex] = useState(0)

  let lastShape;
  const stageRef = React.useRef(null);

  var redoStack = [];
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

  useEffect(() => {
    socket.on("users", (users) => {
      setPlayers(users);
      console.log(users);
    });
    socket.on("message", (msg) => {
      let show = JSON.parse(msg.text);

      //console.log(show);
	  if(show.id === null || show.frameIndex !== frameIndex){return;}
      let index = shapes.findLastIndex((element) => element.id === show.id);
      //console.log(index);
      if (index < 0) {
        //console.log("here");
        setShapes(shapes.concat(show));
      } else {
        //console.log("there");
        shapes[index] = show;
        setShapes([...shapes])
      }
    });


    socket.on("notification", (notif) => {
      console.log(notif.description);
      NotificationManager.info(notif.description, '', 6000)
    });


    socket.on("giveFrame", (data) => {
      //console.log(data)
      if(data.newShapes === null) return;

      
      let myShapes = []
      data.newShapes.forEach(element => {
        const newShape = JSON.parse(element)
        myShapes.push(newShape)
      });
      setShapes([...myShapes])
      setFrameIndex(data.newIndex);
      //setShapes([...data.newShapes])
    });
    

    return () => {
      socket.off("notification");
      socket.off("message");
      socket.off("users");
    }
  }, [socket, shapes, setShapes]);

  //Updating FrameView
  //setTimeout ensures FrameViewImage's are only updated once every 3 seconds, for performance reasons
  useEffect(() => {
    if(updateUri){
      setUpdateUri(false);
      setUri(stageRef.current.toDataURL());
      setTimeout(() => {
        setUpdateUri(true)
      }, 3000)
      //console.log("URI: " + uri);}
    }

  });

  const handleMouseDown = (e) => {
	// setTempId((tempId) => generateId());
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
	try{
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
        frameIndex: frameIndex
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
        frameIndex: frameIndex
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
        frameIndex: frameIndex
      };
    }
    if (tool === "custom shape") {
      lastShape = {
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
        user: "test",
        frameIndex: frameIndex
      };
    }
    if (tool === "eraser") {
      return;
    }
    // setShapes(shapes.concat(lastShape));
    socket.emit("sendData", JSON.stringify(lastShape));
} catch(TypeError){
	console.log("oops! your tool broke!");
	return;
}
  };

  const handleMouseMove = (e) => {
	try{
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
    if (tool === "custom shape") {
      tempShape.points = tempShape.points.concat([pos.x, pos.y]);
    }
    socket.emit("sendData", JSON.stringify(tempShape));
}catch(TypeError){
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
  const setCustom = () => setTool("custom shape");
  const toggleColorSelectors = () => {
    setShowColorSelectors((prevState) => !prevState);
  };

  //Array containing objects for the toolbar; each object has an onClick function and an icon
  const toolbar_params = [
    { func: setPen, icon: <GiPencil /> },
    { func: setRect, icon: <GiSquare /> },
    { func: setCircle, icon: <GiCircle /> },
    { func: setCustom, icon: <BiShapePolygon /> },
    { func: toggleColorSelectors, icon: <GiLargePaintBrush /> },
  ];

  const UserDropdown = () => {
    return players.map(p => <p>{p.nickname}</p>)
  }
  

  function undo(){
    var toBeUndone = shapes.length - 1;
    redoStack.push(shapes.splice(toBeUndone, 1));
    setShapes([...shapes]);
    return;
  }

  function redo(){
    /*var toBeRedone = redoStack.pop();
    shapes.splice(shapes.length - 1, 0, toBeRedone);
    setShapes([...shapes]);*/
    return;
  }

  /* const createNewFrame = () => {
    socket.emit("newFrame", null);
  } */

  const moveToPrevFrame = () => {
    if(frameIndex>0){
      socket.emit("getFrame", frameIndex-1)
    }
  }

  const moveToNextFrame = () => {
      socket.emit("getFrame", frameIndex+1)
    }
  

  return (
    <div className="Container" style={{maxWidth:width}}>
      <button onClick={moveToPrevFrame}>Prev Frame</button>
      <button onClick={moveToNextFrame}>Next Frame</button>

      <div className="userList">
        <h3>Users</h3>
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
            </div>
          </div>
        </section>
        {/*<button onClick={createNewFrame}>New Frame</button>*/}
        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>
      </div>

      <div className='RightContainer' style={{height: height-120}}>
        <div className="NotificationContainer">
          <NotificationContainer />
        </div>

        <>
            <FrameView numFrames={3} frame={uri} width={width} height={height}/>
        </>
      </div>
    </div>
  );
};

export default Canvas;
