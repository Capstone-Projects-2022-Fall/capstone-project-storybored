import React from "react";
import Rectangle from "../rectangle/Rectangle";
import Line from "../line/Line";
import { Circle } from "react-konva";
//import Shapes from shape directories

const Shape = (props) => {
  const { shape } = props;
  console.log(shape);
  if (shape.type === "line") {
    return <Line properties={shape} />;
  }

  if (shape.type === "rectangle") {
    return <Rectangle properties={shape} />;
  }

  if (shape.type === "circle") {
    return <Circle properties={shape} />;
  }
  console.log("unrecognized shape found in shape.js");
};

export default Shape;
