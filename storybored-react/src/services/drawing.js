//import Konva from "konva";
//var Konva = require("/node_modules/konva/lib/index");
//import Konva from "konva";
//const { default: Konva } = require("konva");
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

//generate arbitrary string for unique shape id, is this enough char?
function generateId() {
  const result = Math.random().toString(36).substring(2, 9);
  return result;
}

//select which tool we are using.
var toolbar = document.getElementById("tools");
var tool = toolbar.value;
function changeTool() {
  tool = toolbar.value;
}

//map containing names of all shape drawing tools and the functions invoked by them
var drawing_map = new Map([
  ["pen", makeLine],
  ["rect", makeRect],
]);
/**
 * Creates a new Konva Line object
 * @returns {Konva Line} Konva Line based on user's mouse position
 */
function makeLine() {
  let pos = stage.getPointerPosition();
  let tempID = generateId();
  let new_line = new Konva.Line({
    stroke: color,
    id: tempID,
    strokeWidth: 5,
    lineCap: "round",
    lineJoin: "round",
    points: [pos.x, pos.y, pos.x, pos.y],
    draggable: true,
  });
  new_line.on("dragstart", function () {
    broadcast(new_line.toJSON());
  });
  new_line.on("dragmove", function () {
    broadcast(new_line.toJSON());
  });
  new_line.on("dragend", function () {
    broadcast(new_line.toJSON());
  });
  return new_line;
}
/**
 * Creates a new Konva Rect object
 * @returns {Konva Rect} Konva Rect with position based on user mouse position
 */
function makeRect() {
  let pos = stage.getPointerPosition();
  let tempID = generateId();
  let new_rect = new Konva.Rect({
    id: tempID,
    x: pos.x,
    y: pos.y,
    width: 80,
    height: 80,
    fill: randomColor(),
    stroke: randomColor(),
    strokeWidth: 4,
    draggable: true,
  });
  new_rect.on("dragstart", function () {
    broadcast(new_rect.toJSON());
  });
  new_rect.on("dragmove", function () {
    broadcast(new_rect.toJSON());
  });
  new_rect.on("dragend", function () {
    broadcast(new_rect.toJSON());
  });
  return new_rect;
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
var lastShape;

function makeDraggable() {
  layer.getChildren(function (node) {
    node.setAttr("draggable", true);
  });
}

function makeUnDraggable() {
  layer.getChildren(function (node) {
    node.setAttr("draggable", false);
  });
}

stage.on("mousedown", function (e) {
  if (tool == "select") {
    makeDraggable();
  }
  isPaint = true;
  let pos = stage.getPointerPosition();
  //need to abstract this for different tools
  if (drawing_map.has(tool)) {
    makeUnDraggable();
    lastShape = drawing_map.get(tool)();
    shape_map.set(lastShape.id, lastShape);
    broadcast(lastShape.toJSON());
    layer.add(lastShape);
  }
});

stage.on("mouseup", function (e) {
  isPaint = false;
});

//functionality for mousemove on non pen objects??? something to figure out
//for now just guarding against with first if
stage.on("mousemove", function (e) {
  if (!isPaint || tool != "pen") {
    return;
  }
  if (tool != "select") {
    makeUnDraggable();
  }
  const pos = stage.getPointerPosition();
  var newPoints = lastShape.points().concat([pos.x, pos.y]);
  lastShape.points(newPoints);
  broadcast(lastShape.toJSON());
  //console.log(lastShape.id());
});

function onPeerData(id, data) {
  let msg = JSON.parse(data);
  if (shape_map.has(msg.attrs.id)) {
    let cur = layer.getChildren(function (node) {
      if (node.getId() === msg.attrs.id) {
        node.setAttrs(msg.attrs);
      }
    });
    layer.draw();
  } else {
    console.log("fresh hot shape on the way!");
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

// need to experiment to see how this impacts shape placement/hit detection on konva canvas
// function resize() {
//   canvas.width = window.innerWidth;
//   canvas.height = window.innerHeight;
// }
