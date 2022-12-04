import React from "react";
import Rectangle from "../rectangle/Rectangle";
import Line from "../line/Line";
import Circle from "../circle/Circle";
import Words from "../text/text";
//import Shapes from shape directories

const Shape = (props) => {
  const { shape } = props;
  if (shape.type === "line") {
    return <Line properties={shape} />;
  } else if (shape.type === "rectangle") {
    return <Rectangle properties={shape} />;
  } else if (shape.type === "circle") {
    return <Circle properties={shape} />;
  } else if (shape.type === "words") {
    return <Words properties={shape} />;
  } else {
    console.log("unrecognized shape found in shape.js");
  }
};

export default Shape;
