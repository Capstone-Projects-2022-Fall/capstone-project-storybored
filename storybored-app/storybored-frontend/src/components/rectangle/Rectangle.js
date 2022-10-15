import React from "react";
import { Rect } from "react-konva";

const Rectangle = (props) => {
  const { properties } = props;
  return (
    <Rect
      key={properties.key}
      id={properties.id}
      x={properties.x}
      y={properties.y}
      width={properties.width}
      height={properties.height}
      stroke={properties.stroke}
      strokeWidth={properties.strokeWidth}
      fill={properties.fill}
      draggable={properties.draggable}
      listening={properties.listening}
    />
  );
};

export default Rectangle;
