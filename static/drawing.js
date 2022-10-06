// const canvas = document.querySelector("canvas");
// const ctx = canvas.getContext("2d");
//var lastPoint;
//import Konva from "konva";
//var konva = require("Konva");
//const Konva = window.konva;
//import Konva from "konva";

var height = 600;
var width = 800;
function randomColor() {
  let r = Math.random() * 255;
  let g = Math.random() * 255;
  let b = Math.random() * 255;
  return `rgb(${r}, ${g}, ${b})`;
  //return `rgb(${0}, ${0}, ${0})`;
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
  lastLine = new Konva.Line({
    stroke: color,
    strokeWidth: 5,
    lineCap: "round",
    lineJoin: "round",
    points: [pos.x, pos.y, pos.x, pos.y],
  });
  //broadcast();
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
});
// need to experiment to see how this impacts shape placement/hit detection on konva canvas
// function resize() {
//   canvas.width = window.innerWidth;
//   canvas.height = window.innerHeight;
// }

function onPeerData(id, data) {
  let msg = JSON.parse(data);
  //   if (msg.event === "draw") {
  //     draw(msg);
  //   } else if (msg.event === "drawRect") {
  //     drawRect(msg);
  //   } else if (msg.event === "clear") {
  //     ctx.clearRect(0, 0, canvas.width, canvas.height);
  //   }
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

// function up() {
//   lastPoint = undefined;
// }

// window.onmousemove = move;

// window.onresize = resize;

// window.onmouseup = up;
