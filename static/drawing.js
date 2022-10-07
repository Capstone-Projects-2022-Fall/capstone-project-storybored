//import Konva from "konva";
//var Konva = require("/node_modules/konva/lib/index");
//import Konva from "konva";

//const { default: Konva } = require("konva");

var height = 600;
var width = 800;
var shape_id = 0; //need to map and keep track of these to interact with previously drawn functions.
var shape_map = new Map();
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
    id: shape_id.toString(),
    strokeWidth: 5,
    lineCap: "round",
    lineJoin: "round",
    points: [pos.x, pos.y, pos.x, pos.y],
  });
  shape_id++;
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
// need to experiment to see how this impacts shape placement/hit detection on konva canvas
// function resize() {
//   canvas.width = window.innerWidth;
//   canvas.height = window.innerHeight;
// }

function onPeerData(id, data) {
  //   let msg = JSON.parse(data);
  //console.log(data);
  //console.log(shape_map.has(data.id));
  if (shape_map.has(data.id)) {
    //console.log("made it to if");
    shape_map.get(data.id).points(data.points);
    layer.draw();
  } else {
    //console.log("made it to else");
    shape_map.set(
      data.id,
      new Konva.Line({
        stroke: data.colorcolor,
        id: data.id,
        strokeWidth: data.strokeWidth,
        lineCap: data.lineCap,
        lineJoin: data.lineJoin,
        points: data.points,
      })
    );
    let cur = shape_map.get(data.id);
    //console.log(layer);
    layer.add(cur);
    //console.log(shape_map);
    layer.draw();
    shape_id = data.id + 1;
  }
  //   if(shape_map.has())
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

function logContents() {
  console.log(stage);
  console.log(layer);
  console.log(shape_map);
}
