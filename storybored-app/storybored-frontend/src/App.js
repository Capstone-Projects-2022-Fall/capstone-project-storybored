import React, { useContext, useEffect, useState } from "react";

import Canvas from "./components/canvas/Canvas";
import Home from "./components/Home.js";
import CreateRoom from "./components/CreateRoom";
import { SocketContext, SocketProvider } from "./socketContext";
import { RoomProvider } from "./roomContext";
import { UsersContext, UsersProvider } from "./usersContext";

import axios from "axios";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

const App = ({ context, url }) => {
  const { nickName, room, setNickName, setRoom } = useContext(UsersContext);
  const socket = useContext(SocketContext);
  const { users } = useContext(UsersContext);
  const [shapes, setShapes] = useState([]);

  useEffect(() => {
    socket.on("message", (msg) => {
      console.log(msg);
    });
    socket.on("notification", (notif) => {
      console.log(notif);
    });
  }, [socket]);

  return (
    <div className="App">
      <header className="App-header">
        <RoomProvider>
          <UsersProvider>
            <SocketProvider>
              <Router>
                <Routes>
                  <Route path="" element={<Home />} />
                  <Route path="/CreateRoom" element={<CreateRoom />} />
                  {/* <Canvas broadcast={broadcast} lines={lines} setLines={setLines} /> */}
                  <Route path="/Canvas" element={<Canvas shapes={shapes} setShapes={setShapes} user={context.username} />} />
                </Routes>
              </Router>
            </SocketProvider>
          </UsersProvider>
        </RoomProvider>
      </header>
    </div>
  );
};

export default App;

// const rtcConfig = {
//   iceServers: [
//     {
//       urls: ["stun:stun.l.google.com:19302", "stun:global.stun.twilio.com:3478"],
//     },
//   ],
// };

// useEffect(() => {
//   context.eventSource.addEventListener("add-peer", addPeer, false);
//   context.eventSource.addEventListener("remove-peer", removePeer, false);
//   context.eventSource.addEventListener("session-description", sesssionDescription, false);
//   context.eventSource.addEventListener("ice-candidate", iceCandidate, false);
// }, []);

// function addPeer(data) {
//   let message = JSON.parse(data.data);
//   if (context.peers[message.peer.id]) {
//     return;
//   }

//   let peer = new RTCPeerConnection(rtcConfig);
//   context.peers[message.peer.id] = peer;

//   peer.onicecandidate = function(event) {
//     if (event.candidate) {
//       // was missing second parameter 'ice-candidate' in relay function
//       relay(message.peer.id, "ice-candidate", event.candidate);
//     }
//   };

//   if (message.offer) {
//     // create the data channel, map peer updates
//     let channel = peer.createDataChannel("updates");
//     channel.onmessage = function(event) {
//       onPeerData(message.peer.id, event.data);
//     };
//     context.channels[message.peer.id] = channel;
//     createOffer(message.peer.id, peer);
//   } else {
//     peer.ondatachannel = function(event) {
//       context.channels[message.peer.id] = event.channel;
//       event.channel.onmessage = function(evt) {
//         onPeerData(message.peer.id, evt.data);
//       };
//     };
//   }
// }

// async function createOffer(peerID, peer) {
//   let offer = await peer.createOffer();
//   await peer.setLocalDescription(offer);
//   await relay(peerID, "session-description", offer);
// }

// function relay(peerID, event, data) {
//   axios.post(`http://${url}:7007/relay/${peerID}/${event}`, data, {
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${context.token}`,
//     },
//   });
// }

// // function peerDataUpdate(peerID, data) {
// //   onPeerData(peerID, data);
// // }

// function removePeer(data) {
//   let message = JSON.parse(data.data);
//   // should've been peer.id not user.id
//   if (context.peers[message.peer.id]) {
//     context.peers[message.peer.id].close();
//   }
//   delete context.peers[message.peer.id];
// }

// async function sesssionDescription(data) {
//   let message = JSON.parse(data.data);
//   let peer = context.peers[message.peer.id];

//   let remoteDescription = new RTCSessionDescription(message.data);

//   await peer.setRemoteDescription(remoteDescription);
//   if (remoteDescription.type === "offer") {
//     let answer = await peer.createAnswer();
//     await peer.setLocalDescription(answer);
//     await relay(message.peer.id, "session-description", answer);
//   }
// }

// function iceCandidate(data) {
//   let message = JSON.parse(data.data);
//   let peer = context.peers[message.peer.id];
//   // console.log(new RTCIceCandidate(message.data))
//   peer.addIceCandidate(new RTCIceCandidate(message.data));
// }

// function broadcast(data) {
//   for (let peerId in context.channels) {
//     if (context.channels[peerId].readyState === "open") {
//       context.channels[peerId].send(data);
//     }
//   }
// }

// function onPeerData(id, data) {
//   let msg = JSON.parse(data);
//   setShapes(msg);
//   // setLines(msg);
// }
