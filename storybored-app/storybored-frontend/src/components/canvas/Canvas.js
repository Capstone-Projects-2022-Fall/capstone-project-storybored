import { shapes } from "konva/lib/Shape";
import React, { useState, useRef } from "react";
import { Stage, Layer, Text } from "react-konva";
import Shape from "../shape/Shape";

// const Canvas = ({ broadcast, lines, setLines }) => {
const Canvas = ({ broadcast, shapes, setShapes }) => {
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("red");
  const isDrawing = useRef(false);
  var lastShape;

  const handleMouseDown = (e) => {
    let tempId = generateId();
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    if (tool === "pen") {
      lastShape = {
        type: "line",
        key: tempId,
        id: tempId,
        points: [pos.x, pos.y, pos.x, pos.y],
        stroke: color,
        strokeWidth: 4,
        tension: "round",
        lineCap: "round",
      };
    } else {
      console.log("pen only!");
    }
    setShapes(shapes.concat(lastShape));
    //setShape([...shapes, {tool, color, shape}]);
    // setLines([...lines, { tool, points: [pos.x, pos.y] }]);
    console.log(JSON.stringify([...shapes, { tool, lastShape }]));
    // broadcast(JSON.stringify([...lines, { tool, points: [pos.x, pos.y] }]));
    broadcast(JSON.stringify([...shapes, { tool, lastShape }]));
  };

  const handleMouseMove = (e) => {
    // no drawing - skipping
    if (!isDrawing.current || tool !== "pen") {
      return;
    }
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lastShape.points;
    console.log(lastShape);
    // add point
    // lastShape.points = lastLine.concat([point.x, point.y]);

    // replace last
    // lines.splice(lines.length - 1, 1, lastLine);

    setShapes(shapes.concat(lastShape));
    // setLines(lines.concat());
    console.log(JSON.stringify(shapes.concat()));
    broadcast(JSON.stringify(shapes.concat()));
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  function generateId() {
    const randomId = Math.random().toString(36).substring(10);
    return randomId;
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
            <Shape shape={shape} />
          ))}
          {/* {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={color}
              strokeWidth={5}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={line.tool === "eraser" ? "destination-out" : "source-over"}
            />
          ))} */}
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
        <option value="eraser">Eraser</option>
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
