import React from "react";
import { Penta } from "react-konva";

const Pentagon = (props) => {
    const { properties } = props;
    return (
        <Penta
        key={properties.key}
        id={properties.id}
        x={properties.x}
        y={properties.y}
        width={properties.width}
        height={properties.height}
        radius={properties.radius}
        size={properties.size}
        area ={properties.area}
        stroke={properties.stroke}
        strokeWidth={properties.strokeWidth}
        fill={properties.fill}
        draggable={properties.draggable}
        listening={properties.listening}
      />
    );
  };
    /*(var i = 0; i < 5; i ++){
            const ang = (i / 5) * Math.PI * 2 + rotation;
            ctx.lineTo(
                Math.cos(ang) * radius + x,
                Math.sin(ang) * radius + y
            );
         }
         ctx.closePath();
    }
    
    ctx.beginPath();
    pentagon(100,100,50,-Math.PI / 2);
    ctx.fill();
    ctx.stroke();

*/
export default Pentagon;

