
import React, { useEffect, useState, useRef } from 'react'

import Canvas from './components/Canvas';

import axios from 'axios';



const App = ({ context }) => {
    

    const [lines, setLines] = useState([]);
    const [tool, setTool] = useState('pen');
 
    const rtcConfig = {
        iceServers: [
            {
                urls: ["stun:stun.l.google.com:19302", "stun:global.stun.twilio.com:3478"],
            },
        ],
    };

    
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
        for (let peerId in context.channels) {
            if (context.channels[peerId].readyState === 'open') {
                context.channels[peerId].send(data);
            }
        }
    }

    function onPeerData(id, data) {
        let msg = JSON.parse(data);
        setLines(lines.concat(msg));
    }

    return (
        <div>
            <select
                value={tool}
                onChange={(e) => {
                    setTool(e.target.value);
                }}>
                <option value="pen">Pen</option>
                <option value="eraser">Eraser</option>
            </select>
            <Canvas broadcast={broadcast} lines={lines} setLines={setLines} tool={tool}/>
        </div>
    )
}




export default App;
