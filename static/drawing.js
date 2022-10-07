//import Konva from "konva";
//var Konva = require("/node_modules/konva/lib/index");
//import Konva from "konva";

//const { default: Konva } = require("konva");

var height = 600;
var width = 800;
var shape_map = new Map();
function randomColor() {
  let r = Math.random() * 255;
  let g = Math.random() * 255;
  let b = Math.random() * 255;
  return `rgb(${r}, ${g}, ${b})`;
  //return `rgb(${0}, ${0}, ${0})`;
}

function generateId() {
  const result = Math.random().toString(36).substring(2, 9);
  return result;
}

//set up the konva stage
var stage = new Konva.Stage({
  container: "container",
  width: width,
  height: height,
});

//create a layer and add it to stage
var layer = new Konva.Layer();
stage.add(layer);

//variables for drawing
var color = randomColor();
var isPaint = false;
var lastLine;

stage.on("mousedown", function (e) {
  isPaint = true;
  let pos = stage.getPointerPosition();
  const tempID = generateId();
  lastLine = new Konva.Line({
    stroke: color,
    id: tempID,
    strokeWidth: 5,
    lineCap: "round",
    lineJoin: "round",
    points: [pos.x, pos.y, pos.x, pos.y],
  });
  shape_map.set(lastLine.id, lastLine);
  broadcast(lastLine.toJSON());
  layer.add(lastLine);
});

stage.on("mouseup", function (e) {
  isPaint = false;
});

stage.on("mousemove", function (e) {
  if (!isPaint) {
    return;
  }
  const pos = stage.getPointerPosition();
  var newPoints = lastLine.points().concat([pos.x, pos.y]);
  lastLine.points(newPoints);
  broadcast(lastLine.toJSON());
  //console.log(lastLine.id());
});

function onPeerData(id, data) {
  let msg = JSON.parse(data);
  //console.log(msg.attrs.id);
  //console.log(msg);
  //console.log(shape_map.has(msg.attrs.id));
  if (shape_map.has(msg.attrs.id)) {
    let cur = layer.getChildren(function (node) {
      if (node.getId() === msg.attrs.id) {
        node.setAttr("points", msg.attrs.points);
      }
    });
    layer.draw();
  } else {
    //  console.log(msg.attrs.id);
    shape_map.set(msg.attrs.id, msg);
    let cur = Konva.Node.create(msg);
    layer.add(cur);
    layer.draw();
  }
}

function logContents() {
  console.log(stage);
  console.log(layer);
  console.log(shape_map);
}

// function draw(data) {
//   ctx.beginPath();
//   ctx.moveTo(data.lastPoint.x, data.lastPoint.y);
//   ctx.lineTo(data.x, data.y);
//   ctx.strokeStyle = data.color;
//   ctx.lineWidth = Math.pow(1, 4) * 2;
//   ctx.lineCap = "round";
//   ctx.stroke();
//   ctx.closePath();
// }

// function move(e) {
//   if (e.buttons) {
//     if (!lastPoint) {
//       lastPoint = { x: e.offsetX, y: e.offsetY };
//       return;
//     }

//     draw({
//       lastPoint,
//       x: e.offsetX,
//       y: e.offsetY,
//       color: color,
//     });
//     broadcast(
//       JSON.stringify({
//         event: "draw",
//         lastPoint,
//         x: e.offsetX,
//         y: e.offsetY,
//         color: color,
//       })
//     );

//     lastPoint = { x: e.offsetX, y: e.offsetY };
//   }
// }

// need to experiment to see how this impacts shape placement/hit detection on konva canvas
// function resize() {
//   canvas.width = window.innerWidth;
//   canvas.height = window.innerHeight;
// }
