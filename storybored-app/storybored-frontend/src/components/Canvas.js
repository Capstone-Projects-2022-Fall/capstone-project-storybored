
import React, { useState, useRef } from 'react'

import { Stage, Layer, Line, Text } from 'react-konva';

const Canvas = ({broadcast, lines, setLines, tool, user}) => {

    
    const isDrawing = useRef(false);

    const handleMouseDown = (e) => {
        isDrawing.current = true;
        // const pos = e.target.getStage().getPointerPosition();
        const pos = e.evt

        // setLines([...lines, { tool, points: [pos.x, pos.y] }]);
        let currentPoint = [...lines, { tool, points: [ pos.offsetX, pos.offsetY ], user: user}]
        setLines(currentPoint);
        broadcast(JSON.stringify(currentPoint));
        // console.log("lines:", lines, "position of current Mouse, ", e)
        
    };

    const handleMouseMove = (e) => {
        // no drawing - skipping
        if (!isDrawing.current) {
            return;
        }
        // const stage = e.target.getStage();
        // const point = stage.getPointerPosition();
        const point = e.evt
        
        let lastLineIndex = lines.findLastIndex(element => element.user===user)
        let lastLine = lines[lastLineIndex]

        lastLine.points = lastLine.points.concat([ point.offsetX, point.offsetY ]);

        lines.splice(lastLineIndex, 1, lastLine);

        setLines(lines.concat());
        // console.log("lines:", lines, "position of current Mouse, ", e, point.offsetX, point.offsetY)
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