const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

function move(e) {
	if(e.buttons) {
		context.fillStyle = 'green';
		context.beginPath();
		context.arc(e.x, e.y);
	}
}

window.onmousemove = move;