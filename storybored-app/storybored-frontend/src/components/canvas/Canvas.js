import React, { useState, useRef } from "react";
import { Stage, Layer, Text } from "react-konva";
import { HexColorPicker } from "react-colorful";
import Shape from "../shape/Shape";
import "./styles.css";

// const Canvas = ({ broadcast, lines, setLines }) => {
const Canvas = ({ broadcast, shapes, setShapes }) => {
  const [tool, setTool] = useState("pen");
  const [strokeColor, setStrokeColor] = useState("#abcdef");
  const [fillColor, setFillColor] = useState("#fedcba");
  const [tempId, setTempId] = useState((tempId) => (tempId = generateId()));
  const [strokeWidth, setStrokeWidth] = useState(2);
  const isDrawing = useRef(false);
  var lastShape;

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
      };
    }
    if (tool === "eraser") {
      return;
    }
    setShapes(shapes.concat(lastShape));
    broadcast(JSON.stringify([...shapes]));
  };

  const handleMouseMove = (e) => {
    // no drawing - skipping
    if (!isDrawing.current || tool === "eraser") {
      return;
    }
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    let index = shapes.findIndex((element) => element.id === tempId);
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
    broadcast(JSON.stringify([...shapes]));
  };

  const handleMouseUp = () => {
    // if (tool === "select") {
    //   return;
    // }
    lastShape = null;
    setTempId((tempId) => generateId());
    isDrawing.current = false;
    broadcast(JSON.stringify([...shapes]));
  };

  function generateId() {
    const result = Math.random()
      .toString(36)
      .substring(2, 9);
    return result;
  }

  // const handleMouseOver = (e) => {
  //   console.log(e.target.toString());
  // };

  return (
    <div>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight - 120}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
      >
        <Layer>
          <Text text="Just start drawing" x={5} y={30} />
          {shapes.map((shape, i) => (
            <Shape key={i} shape={shape} />
          ))}
        </Layer>
      </Stage>
      <section className="options">
        <div>
          Stroke Color
          <HexColorPicker color={strokeColor} onChange={setStrokeColor} />
        </div>
        <div>
          Fill Color
          <HexColorPicker color={fillColor} onChange={setFillColor} />
        </div>
        <div className="tools">
          <div>Tool</div>
          <div>
            <select
              value={tool}
              onChange={(e) => {
                setTool(e.target.value);
              }}
            >
              <option value="pen">Pen</option>
              <option value="rectangle">Rectangle</option>
              <option value="circle">Circle</option>
              <option value="eraser">Eraser</option>
            </select>
          </div>
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
    </div>
  );
};

export default Canvas;
