
import React, { useEffect, useState } from 'react'

import { Stage, Layer, Line, Text } from 'react-konva';



export const onPeerData = (id, data) => {
    // let msg = JSON.parse(data);
    console.log(id,data, "receiving")
    // if (msg.event === 'draw') {
    //     draw(msg);
    // } else if (msg.event === 'drawRect') {
    //     drawRect(msg);
    // } else if (msg.event === 'clear') {
    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
    // }
}

const Canvas = (props) => {

    const [tool, setTool] = React.useState('pen');
    const [lines, setLines] = React.useState([]);
    const isDrawing = React.useRef(false);
    
    const handleMouseDown = (e) => {
        isDrawing.current = true;
        const pos = e.target.getStage().getPointerPosition();
        
        setLines([...lines, { tool, points: [pos.x, pos.y] }]);
        props.broadcast([...lines, { tool, points: [pos.x, pos.y] }]);
    };

    const handleMouseMove = (e) => {
        // no drawing - skipping
        if (!isDrawing.current) {
            return;
        }
        const stage = e.target.getStage();
        const point = stage.getPointerPosition();
        let lastLine = lines[lines.length - 1];
        // add point
        lastLine.points = lastLine.points.concat([point.x, point.y]);

        // replace last
        lines.splice(lines.length - 1, 1, lastLine);
        
        setLines(lines.concat());
        props.broadcast(lines.concat());
    };

    const handleMouseUp = () => {
        isDrawing.current = false;
    };

    
    

    return (
        <div>
            <Stage
                width={window.innerWidth}
                height={window.innerHeight}
                onMouseDown={handleMouseDown}
                onMousemove={handleMouseMove}
                onMouseup={handleMouseUp}
            >
                <Layer>
                    <Text text="Just start drawing" x={5} y={30} />
                    {lines.map((line, i) => (
                        <Line
                            key={i}
                            points={line.points}
                            stroke="#df4b26"
                            strokeWidth={5}
                            tension={0.5}
                            lineCap="round"
                            lineJoin="round"
                            globalCompositeOperation={
                                line.tool === 'eraser' ? 'destination-out' : 'source-over'
                            }
                        />
                    ))}
                </Layer>
            </Stage>
            <select
                value={tool}
                onChange={(e) => {
                    setTool(e.target.value);
                }}
            >
                <option value="pen">Pen</option>
                <option value="eraser">Eraser</option>
            </select>
        </div>
    );
};





// var shape_map = new Map();
// const rtcConfig = {
//     iceServers: [
//         {
//             urls: ["stun:stun.l.google.com:19302", "stun:global.stun.twilio.com:3478"],
//         },
//     ],
// };

const App = (props) => {

    return (
        <div>
            <Canvas broadcast={props.broadcast}/>
        </div>

    )
}




export default App;
