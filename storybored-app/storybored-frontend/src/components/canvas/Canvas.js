import { shapes } from "konva/lib/Shape";
import React, { useState, useRef } from "react";
import { Stage, Layer, Text } from "react-konva";
import Shape from "../shape/Shape";

// const Canvas = ({ broadcast, lines, setLines }) => {
const Canvas = ({ broadcast, shapes, setShapes }) => {
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("red");
  const [tempId, setTempId] = useState((tempId) => (tempId = generateId()));
  const isDrawing = useRef(false);
  var lastShape;

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    if (tool === "pen") {
      //put this in a map or something so we can actually maintain this
      lastShape = {
        type: "line",
        id: tempId,
        points: [pos.x, pos.y, pos.x, pos.y],
        stroke: color,
        strokeWidth: 4,
        tension: 0.5,
        lineCap: "round",
        draggable: false,
      };
      console.log(lastShape);
    } else if (tool === "rectangle") {
      lastShape = {
        type: "rectangle",
        id: tempId,
        x: pos.x,
        y: pos.y,
        stroke: "#000000",
        strokeWidth: 1,
        fill: color,
        width: 60,
        height: 40,
        draggable: false,
      };
    } else if (tool === "circle") {
      console.log("found a cirlce!");
      lastShape = {
        type: "circle",
        id: tempId,
        x: pos.x,
        y: pos.y,
        fill: color,
        stroke: "#000000",
        strokeWidth: 1,
        radius: 40,
        draggable: false,
      };
    } else {
      console.log("not supported yet!");
    }
    setShapes(shapes.concat(lastShape));
    console.log(shapes);
    broadcast(JSON.stringify([...shapes]));
  };

  const handleMouseMove = (e) => {
    // no drawing - skipping
    if (!isDrawing.current || tool !== "pen") {
      return;
    }
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();

    let index = shapes.findIndex((element) => element.id === tempId);
    let tempLine = shapes[index];
    tempLine.points = tempLine.points.concat([pos.x, pos.y]);
    shapes[index] = tempLine;
    // console.log(shapes[index]);
    // console.log(shapes);
    setShapes([...shapes]);
    // // setLines(lines.concat());
    // console.log(JSON.stringify(shapes.concat()));
    broadcast(JSON.stringify([...shapes]));
  };

  const handleMouseUp = () => {
    lastShape = null;
    setTempId((tempId) => generateId());
    isDrawing.current = false;
    broadcast(JSON.stringify([...shapes]));
  };

  function generateId() {
    const result = Math.random().toString(36).substring(2, 9);
    return result;
  }

  return (
    <div>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight - 50}
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
      <select
        value={tool}
        onChange={(e) => {
          setTool(e.target.value);
        }}
      >
        <option value="pen">Pen</option>
        <option value="rectangle">Rectangle</option>
        <option value="circle">Circle</option>
        <option value="select">Select</option>
      </select>
      <select //extend to stroke and color selection, convert to swatches or hexpicker
        value={color}
        onChange={(e) => {
          setColor(e.target.value);
        }}
      >
        <option value="#c40000">Red</option>
        <option value="#0222c2">Blue</option>
        <option value="#f5e614">Yellow</option>
        <option value="#09b515">Green</option>
        <option value="#5409d6">Purple</option>
        <option value="#d99400">Orange</option>
      </select>
    </div>
  );
};

export default Canvas;
