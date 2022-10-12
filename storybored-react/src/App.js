
import React, { useEffect, useState, useRef } from 'react'

import { Stage, Layer, Line, Text } from 'react-konva';

import axios from 'axios';

// const onPeerData = (id, data) => {
//     // let msg = JSON.parse(data);
//     console.log(id, data, "receiving")
//     // if (msg.event === 'draw') {
//     //     draw(msg);
//     // } else if (msg.event === 'drawRect') {
//     //     drawRect(msg);
//     // } else if (msg.event === 'clear') {
//     //     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     // }
// }




const onPeerTest = () => {
    console.log("I can be called")
}

const Canvas = ({broadcast, lines, setLines}) => {

    const [tool, setTool] = useState('pen');
    const isDrawing = useRef(false);

    const handleMouseDown = (e) => {
        isDrawing.current = true;
        const pos = e.target.getStage().getPointerPosition();

        setLines([...lines, { tool, points: [pos.x, pos.y] }]);
        broadcast(JSON.stringify([...lines, { tool, points: [pos.x, pos.y] }]));
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

const App = ({ context }) => {


    const [lines, setLines] = useState([]);
 
    const rtcConfig = {
        iceServers: [
            {
                urls: ["stun:stun.l.google.com:19302", "stun:global.stun.twilio.com:3478"],
            },
        ],
    };

    function onPeerData(id, data) {
        let msg = JSON.parse(data);
        setLines(lines.concat(msg));
        console.log("drawing")
    }
    


    useEffect(() => {
        context.eventSource.addEventListener("add-peer", addPeer, false);
        context.eventSource.addEventListener("remove-peer", removePeer, false);
        context.eventSource.addEventListener("session-description", sesssionDescription, false);
        context.eventSource.addEventListener("ice-candidate", iceCandidate, false);
    }, [])


    function addPeer(data) {
        let message = JSON.parse(data.data);
        if (context.peers[message.peer.id]) {
            return;
        }

        let peer = new RTCPeerConnection(rtcConfig);

        // was missing this line - need to add new peer to peers list
        context.peers[message.peer.id] = peer;

        peer.onicecandidate = function (event) {
            if (event.candidate) {
                // was missing second parameter 'ice-candidate' in relay function
                relay(message.peer.id, "ice-candidate", event.candidate);
            }
        };

        if (message.offer) {
            // create the data channel, map peer updates
            let channel = peer.createDataChannel("updates");
            channel.onmessage = function (event) {
                onPeerData(message.peer.id, event.data);
            };
            context.channels[message.peer.id] = channel;
            createOffer(message.peer.id, peer);
        } else {
            peer.ondatachannel = function (event) {
                context.channels[message.peer.id] = event.channel;
                event.channel.onmessage = function (evt) {
                    onPeerData(message.peer.id, evt.data);
                };
            };
        }
    }



    async function createOffer(peerID, peer) {
        let offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        await relay(peerID, "session-description", offer);
    }

    function relay(peerID, event, data) {
        console.log("relaying....", context.token)

        axios.post(`http://localhost:7007/relay/${peerID}/${event}`, data, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${context.token}`,
            }
        })
    }

    function peerDataUpdate(peerID, data) {
        onPeerData(peerID, data);
    }

    function removePeer(data) {
        let message = JSON.parse(data.data);
        // should've been peer.id not user.id 
        if (context.peers[message.peer.id]) {
            context.peers[message.peer.id].close();
        }
        delete context.peers[message.peer.id];
    }

    async function sesssionDescription(data) {
        let message = JSON.parse(data.data);
        let peer = context.peers[message.peer.id];

        let remoteDescription = new RTCSessionDescription(message.data);

        await peer.setRemoteDescription(remoteDescription);
        if (remoteDescription.type === "offer") {
            let answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            await relay(message.peer.id, "session-description", answer);
        }
    }

    function iceCandidate(data) {
        let message = JSON.parse(data.data);
        let peer = context.peers[message.peer.id];
        peer.addIceCandidate(new RTCIceCandidate(message.data));
    }

    function broadcast(data) {
        console.log("BROADCASTING", data)
        for (let peerId in context.channels) {
            if (context.channels[peerId].readyState === 'open') {
                context.channels[peerId].send(data);
            }
        }
    }

    return (
        <div>
            <Canvas broadcast={broadcast} lines={lines} setLines={setLines}/>
        </div>
    )
}




export default App;
