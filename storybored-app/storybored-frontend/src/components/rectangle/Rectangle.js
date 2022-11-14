import React from "react";
import { Rect } from "react-konva";

const Rectangle = (props) => {
  const { properties } = props;

  //   const handleClick = (e) => {
  //     console.log(e.target.attrs.user);
  //     if (e.target.attrs.user !== "select") {
  //       return;
  //     }
  //     console.log(e.target);
  //   };
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
      //   onClick={handleClick}
      user={properties.user}
      rotation={properties.rotation}
      //   globalCompositeOperation={properties.globalCompositeOperation}
      //   globalCompositeOperation={tool === "eraser" ? "destination-out" : "source-over"}
      //   onMouseOver={handleMouseOver()}
    />
  );
};

export default Rectangle;
