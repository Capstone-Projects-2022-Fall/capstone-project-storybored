import React from "react";
import { Line as KonvaLine } from "react-konva";

const Line = (props) => {
  const { properties } = props;
  return (
    <KonvaLine
      key={properties.key}
      id={properties.id}
      points={properties.points}
      stroke={properties.stroke}
      strokeWidth={properties.strokeWidth}
      fill={properties.fill}
      closed={properties.closed}
      tension={properties.tension}
      lineCap={properties.lineCap}
      lineJoin={properties.lineJoin}
      draggable={properties.draggable}
      offsetX={properties.offsetX}
      offsetY={properties.offsetY}
      //   globalCompositeOperation={properties.globalCompositeOperation}
      //   globalCompositeOperation={tool === "eraser" ? "destination-out" : "source-over"}
    />
  );
};

export default Line;
