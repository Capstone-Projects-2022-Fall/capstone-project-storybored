
import React from "react";
import Rectangle from "../rectangle/Rectangle";
import Line from "../line/Line";
import Circle from "../circle/Circle";
import Shape from "../shape/Shape";

/* generate a handle dragging section*/
function generateShapes() {
    return [...Array(10)].map((_, i) => ({
      id: i.toString(),
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      rotation: Math.random() * 180,
      isDragging: false,
    }));
  }
  
  const INITIAL_STATE = generateShapes();
  
  const draggable = () =>{
  const [shape, setShapes] = React.useState(INITIAL_STATE);
  
  const handleDragStart = (e) => {
    const id = e.target.id();
    setShapes(
        shape.map((shape) => {
        return {
          ...shape,
          isDragging: shape.id === id,
        };
      })
    );
  };
  const handleDragEnd = (e) => {
    setShapes(
        shape.map((star) => {
        return {
          ...shape,
          isDragging: false,
        };
      })
    );
  };
  
  
  
  
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Text text="Try to drag a shape" />
        {stars.map((star) => (
          <Star
            key={Shapes.id}
            id={Shapes.id}
            x={Shapes.x}
            y={Shapes.y}
            numPoints={5}
            innerRadius={20}
            outerRadius={40}
            fill="#000000"
            opacity={0.8}
            draggable
            rotation={star.rotation}
            shadowColor="RGB"
            shadowBlur={10}
            shadowOpacity={0.6}
            shadowOffsetX={star.isDragging ? 10 : 5}
            shadowOffsetY={star.isDragging ? 10 : 5}
            scaleX={star.isDragging ? 1.2 : 1}
            scaleY={star.isDragging ? 1.2 : 1}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        ))}
      </Layer>
    </Stage>
  );
  };
  
  const container = document.getElementById('root');
  const root = createRoot(container);


  export default generateShapes;
