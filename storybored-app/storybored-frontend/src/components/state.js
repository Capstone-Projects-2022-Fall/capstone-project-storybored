import React from "react";
import { createStore } from "state";
import  Circle from "../circle/Circle";
import Rectangle from "./rectangle/Rectangle";
import Shape from"./shape/Shape";


function stage() {

const baseState = {
  selected: null,
  shapes: {},
};

 const useShapes = createStore(baseState);
const setState = (fn) => useShapes.set(produce(fn));

 const createCircle = ({ x, y }) => {
  setState((state) => {
    state.shapes[nanoid()] = {
      type: SHAPE_TYPES.CIRCLE, 
      radius: DEFAULTS.CIRCLE.RADIUS, 
      fill: DEFAULTS.CIRCLE.FILL, 
      stroke: DEFAULTS.CIRCLE.STROKE, 
      x,
      y,
    };
  });
};

createRectangle({
  x: coords.x - offsetX,
  y: coords.y - offsetY,
});

createCircle({
  x: coords.x - (offsetX - clientWidth / 2),
  y: coords.y - (offsetY - clientHeight / 2),
});

/*Select, Move, Resize and Rotate shapes*/

 const selectShape = (id) => {
  setState((state) => {
    state.selected = id;
  });
};

 const clearSelection = () => {
  setState((state) => {
    state.selected = null;
  });
};

 const moveShape = (id, event) => {
  setState((state) => {
    const shape = state.shapes[id];

    if (shape) {
      shape.x = event.target.x();
      shape.y = event.target.y();
    }
  });
};

 const transformRectangleShape = (node, id, event) => {
  // transformer is changing scale of the node
  // and NOT its width or height
  // but in the store we have only width and height
  // to match the data better we will reset scale on transform end
  const scaleX = node.scaleX();
  const scaleY = node.scaleY();

  // we will reset the scale back
  node.scaleX(1);
  node.scaleY(1);

  setState((state) => {
    const shape = state.shapes[id];

    if (shape) {
      shape.x = node.x();
      shape.y = node.y();
      
      shape.rotation = node.rotation();
      
       shape.width = clamp(
        // increase the width in order of the scale
        node.width() * scaleX,
        // should not be less than the minimum width
        LIMITS.RECT.MIN,
        // should not be more than the maximum width
        LIMITS.RECT.MAX
      );
      shape.height = clamp(
        node.height() * scaleY,
        LIMITS.RECT.MIN,
        LIMITS.RECT.MAX
      );
    }
  });
};

 const updateAttribute = (attr, value) => {
  setState((state) => {
    const shape = state.shapes[state.selected];

    if (shape) {
      shape[attr] = value;
    }
  });
};
}


