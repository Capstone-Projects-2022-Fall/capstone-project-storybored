import React from "react";
import { Circle as KonvaCircle } from "react-konva";

const Circle = (props) => {
  const { properties } = props;
  return (
    <KonvaCircle
      key={properties.key}
      id={properties.id}
      x={properties.x}
      y={properties.y}
      radius={properties.radius}
      fill={properties.fill}
      stroke={properties.stroke}
      strokeWidth={properties.strokeWidth}
      draggable={properties.draggable}
      listening={properties.listening}
    />
  );
};

export default Circle;
