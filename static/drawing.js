const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
var lastPoint;

function randomColor() {
    // let r = Math.random() * 255;
    // let g = Math.random() * 255;
    // let b = Math.random() * 255;
    // return `rgb(${r}, ${g}, ${b})`;
	return `rgb(${0}, ${0}, ${0})`;
}

var color = randomColor();

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function onPeerData(id, data) {
    let msg = JSON.parse(data);
    if (msg.event === 'draw') {
        draw(msg);
    } else if (msg.event === 'drawRect') {
        drawRect(msg);
    } else if (msg.event === 'clear') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}


function draw(data) {
    ctx.beginPath();
    ctx.moveTo(data.lastPoint.x, data.lastPoint.y);
    ctx.lineTo(data.x, data.y);
    ctx.strokeStyle = data.color;
    ctx.lineWidth = Math.pow(1, 4) * 2;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.closePath();
}

function move(e) {
    if (e.buttons) {
        if (!lastPoint) {
            lastPoint = { x: e.offsetX, y: e.offsetY };
            return;
        }

        draw({
            lastPoint,
            x: e.offsetX,
            y: e.offsetY,
            color: color
        });
        broadcast(JSON.stringify({
            event: 'draw',
            lastPoint,
            x: e.offsetX,
            y: e.offsetY,
            color: color
        }));

        lastPoint = { x: e.offsetX, y: e.offsetY };
    }
}

function up() {
    lastPoint = undefined;
}



window.onmousemove = move;

window.onresize = resize;

window.onmouseup = up;
