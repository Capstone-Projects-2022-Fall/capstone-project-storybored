
import React, { useRef, useState } from 'react'

import { Stage, Layer, Line, Text } from 'react-konva';

const Canvas = ({broadcast, lines, setLines, tool, user}) => {

    const [ID, setID] = useState(0)
    const isDrawing = useRef(false);
    // console.log("update", lines)

    const handleMouseDown = (e) => {
        isDrawing.current = true;

        // grab position 
        const pos = e.target.getStage().getPointerPosition();

        // current position is the previous lines combined with new point information + userid information 
        let currentPoint = { tool, points: [ pos.x, pos.y ], user: user}
        let newLine = [...lines, currentPoint]

        // set line as new point
        setLines(newLine);
        // broadcast(JSON.stringify(currentPoint), true);
    };

    // the function is triggered IF it passes the first condition, which is the mouse is DOWN 
    const handleMouseMove = (e) => {
        if (!isDrawing.current) {
            return;
        }

        // grab current position
        const pos = e.target.getStage().getPointerPosition();

        // lines is a list of lines (mouse down, mouse movement, mouse up), so grab the index of the last line that was drawn by the CURRENT USER 
        let lastLineIndex = lines.findLastIndex(element => element.user===user)

        // grab the last line with the index 
        let lastLine = lines[lastLineIndex]

        // add the current position of the mouse to the lastLine points (update the line currently being drawn)
        lastLine.points = lastLine.points.concat([ pos.x, pos.y ]);

        // dont want to mutate original variable lines, so make a copy of lines
        let newLine = [...lines]
        
        // splice newLine to update lines variable --> use index of the last line drawn by the user and replace with the lastLine variable which has the new points added to it
        newLine.splice(lastLineIndex, 1, lastLine);

        // finally set the lines variables to our updated version
        setLines(newLine.concat());

        // broadcast
        broadcast(JSON.stringify(lines));        
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
            
        </div>
    );
};


export default Canvas