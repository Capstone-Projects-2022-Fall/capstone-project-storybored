
import React, { useRef } from 'react'

import { Stage, Layer, Line, Text } from 'react-konva';

const Canvas = ({broadcast, lines, setLines, tool, user}) => {

    
    const isDrawing = useRef(false);

    const handleMouseDown = (e) => {
        isDrawing.current = true;

        // grab position 
        const pos = e.target.getStage().getPointerPosition();

        // current position is the previous lines combined with new point
        let currentPoint = [...lines, { tool, points: [ pos.x, pos.y ], user: user}]

        // set line as new point
        setLines(currentPoint);
        broadcast(JSON.stringify(currentPoint));
    };

    const handleMouseMove = (e) => {
        if (!isDrawing.current) {
            return;
        }
        const pos = e.target.getStage().getPointerPosition();

        let lastLineIndex = lines.findLastIndex(element => element.user===user)
        let lastLine = lines[lastLineIndex]

        lastLine.points = lastLine.points.concat([ pos.x, pos.y ]);

        // dont want to mutate original variable 
        let newLine = lines
        newLine.splice(lastLineIndex, 1, lastLine);

        setLines(newLine.concat());
        broadcast(JSON.stringify(lines.concat()));        
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